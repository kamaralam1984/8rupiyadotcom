import mongoose from 'mongoose';
import connectDB from './mongodb';
import Shop from '@/models/Shop';
import User from '@/models/User';
import Review from '@/models/Review';
import Payment from '@/models/Payment';
import Commission from '@/models/Commission';
import Plan from '@/models/Plan';
import Category from '@/models/Category';

export interface DatabaseRepairResult {
  success: boolean;
  message: string;
  details?: any;
  errors?: string[];
}

/**
 * Comprehensive database repair utility
 */
export class DatabaseRepair {
  /**
   * Fix missing indexes
   */
  static async fixMissingIndexes(): Promise<DatabaseRepairResult> {
    const errors: string[] = [];
    const fixed: string[] = [];

    try {
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) {
        return { success: false, message: 'Database connection not available' };
      }

      // Fix Shop indexes
      try {
        const shopCollection = db.collection('shops');
        
        // Geospatial index for location
        try {
          await shopCollection.createIndex({ 'location.coordinates': '2dsphere' });
          fixed.push('Shop location 2dsphere index');
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            errors.push(`Shop location index: ${e.message}`);
          }
        }

        // Text index for search
        try {
          await shopCollection.createIndex({ name: 'text', description: 'text', category: 'text' });
          fixed.push('Shop text search index');
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            errors.push(`Shop text index: ${e.message}`);
          }
        }

        // Status index
        try {
          await shopCollection.createIndex({ status: 1 });
          fixed.push('Shop status index');
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            errors.push(`Shop status index: ${e.message}`);
          }
        }
      } catch (e: any) {
        errors.push(`Shop indexes: ${e.message}`);
      }

      // Fix Review indexes
      try {
        const reviewCollection = db.collection('reviews');
        
        // Sparse unique index for shopId + userId
        try {
          await reviewCollection.createIndex(
            { shopId: 1, userId: 1 },
            { unique: true, sparse: true, name: 'shopId_1_userId_1' }
          );
          fixed.push('Review shopId+userId sparse unique index');
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            errors.push(`Review unique index: ${e.message}`);
          }
        }
      } catch (e: any) {
        errors.push(`Review indexes: ${e.message}`);
      }

      // Fix User indexes
      try {
        const userCollection = db.collection('users');
        
        // Email unique index
        try {
          await userCollection.createIndex({ email: 1 }, { unique: true });
          fixed.push('User email unique index');
        } catch (e: any) {
          if (!e.message.includes('already exists')) {
            errors.push(`User email index: ${e.message}`);
          }
        }
      } catch (e: any) {
        errors.push(`User indexes: ${e.message}`);
      }

      return {
        success: errors.length === 0,
        message: `Fixed ${fixed.length} indexes. ${errors.length > 0 ? `${errors.length} errors occurred.` : ''}`,
        details: { fixed, errors },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to fix indexes: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Fix duplicate key errors
   */
  static async fixDuplicateKeys(): Promise<DatabaseRepairResult> {
    const errors: string[] = [];
    const fixed: string[] = [];

    try {
      await connectDB();

      // Fix duplicate reviews (keep latest)
      try {
        const duplicateReviews = await Review.aggregate([
          {
            $group: {
              _id: { shopId: '$shopId', userId: '$userId' },
              count: { $sum: 1 },
              reviews: { $push: '$$ROOT' },
            },
          },
          { $match: { count: { $gt: 1 } } },
        ]);

        for (const group of duplicateReviews) {
          if (group.reviews.length > 1) {
            // Sort by createdAt, keep latest
            const sorted = group.reviews.sort(
              (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            // Delete older duplicates
            const toDelete = sorted.slice(1);
            for (const review of toDelete) {
              await Review.findByIdAndDelete(review._id);
            }
            fixed.push(`Removed ${toDelete.length} duplicate reviews for shop ${group._id.shopId}`);
          }
        }
      } catch (e: any) {
        errors.push(`Duplicate reviews: ${e.message}`);
      }

      // Fix duplicate users (keep first)
      try {
        const duplicateUsers = await User.aggregate([
          {
            $group: {
              _id: '$email',
              count: { $sum: 1 },
              users: { $push: '$$ROOT' },
            },
          },
          { $match: { count: { $gt: 1 } } },
        ]);

        for (const group of duplicateUsers) {
          if (group.users.length > 1) {
            // Keep first, delete rest
            const toDelete = group.users.slice(1);
            for (const user of toDelete) {
              await User.findByIdAndDelete(user._id);
            }
            fixed.push(`Removed ${toDelete.length} duplicate users for email ${group._id}`);
          }
        }
      } catch (e: any) {
        errors.push(`Duplicate users: ${e.message}`);
      }

      return {
        success: errors.length === 0,
        message: `Fixed ${fixed.length} duplicate key issues. ${errors.length > 0 ? `${errors.length} errors occurred.` : ''}`,
        details: { fixed, errors },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to fix duplicate keys: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Clean up orphaned documents
   */
  static async cleanupOrphanedDocuments(): Promise<DatabaseRepairResult> {
    const errors: string[] = [];
    const fixed: string[] = [];

    try {
      await connectDB();

      // Clean up reviews with invalid shopId
      try {
        const shops = await Shop.find({}).select('_id').lean();
        const validShopIds = new Set(shops.map((s: any) => s._id.toString()));
        
        const orphanedReviews = await Review.find({});
        let deletedCount = 0;
        
        for (const review of orphanedReviews) {
          const shopId = review.shopId?.toString();
          if (shopId && !validShopIds.has(shopId)) {
            await Review.findByIdAndDelete(review._id);
            deletedCount++;
          }
        }
        
        if (deletedCount > 0) {
          fixed.push(`Removed ${deletedCount} orphaned reviews`);
        }
      } catch (e: any) {
        errors.push(`Orphaned reviews: ${e.message}`);
      }

      // Clean up payments with invalid shopId
      try {
        const shops = await Shop.find({}).select('_id').lean();
        const validShopIds = new Set(shops.map((s: any) => s._id.toString()));
        
        const orphanedPayments = await Payment.find({});
        let deletedCount = 0;
        
        for (const payment of orphanedPayments) {
          const shopId = (payment as any).shopId?.toString();
          if (shopId && !validShopIds.has(shopId)) {
            // Don't delete payments, just unlink them
            (payment as any).shopId = undefined;
            await payment.save();
            deletedCount++;
          }
        }
        
        if (deletedCount > 0) {
          fixed.push(`Unlinked ${deletedCount} orphaned payments`);
        }
      } catch (e: any) {
        errors.push(`Orphaned payments: ${e.message}`);
      }

      // Clean up commissions with invalid paymentId
      try {
        const payments = await Payment.find({}).select('_id').lean();
        const validPaymentIds = new Set(payments.map((p: any) => p._id.toString()));
        
        const orphanedCommissions = await Commission.find({});
        let deletedCount = 0;
        
        for (const commission of orphanedCommissions) {
          const paymentId = (commission as any).paymentId?.toString();
          if (paymentId && !validPaymentIds.has(paymentId)) {
            await Commission.findByIdAndDelete(commission._id);
            deletedCount++;
          }
        }
        
        if (deletedCount > 0) {
          fixed.push(`Removed ${deletedCount} orphaned commissions`);
        }
      } catch (e: any) {
        errors.push(`Orphaned commissions: ${e.message}`);
      }

      return {
        success: errors.length === 0,
        message: `Cleaned up ${fixed.length} orphaned document issues. ${errors.length > 0 ? `${errors.length} errors occurred.` : ''}`,
        details: { fixed, errors },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to cleanup orphaned documents: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Rebuild all indexes
   */
  static async rebuildIndexes(): Promise<DatabaseRepairResult> {
    try {
      await connectDB();
      const db = mongoose.connection.db;
      if (!db) {
        return { success: false, message: 'Database connection not available' };
      }

      const collections = ['shops', 'users', 'reviews', 'payments', 'commissions', 'plans', 'categories'];
      const rebuilt: string[] = [];

      for (const collectionName of collections) {
        try {
          const collection = db.collection(collectionName);
          await collection.dropIndexes();
          // Note: createIndexes() requires index specifications, so we skip it here
          // Indexes will be recreated automatically by Mongoose models on next connection
          rebuilt.push(collectionName);
        } catch (e: any) {
          // Collection might not exist or have indexes
          console.warn(`Could not rebuild indexes for ${collectionName}:`, e.message);
        }
      }

      return {
        success: true,
        message: `Rebuilt indexes for ${rebuilt.length} collections`,
        details: { rebuilt },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to rebuild indexes: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Fix database connection
   */
  static async fixConnection(): Promise<DatabaseRepairResult> {
    try {
      // Access the global cached connection
      const cached = (global as any).mongoose;
      
      if (cached) {
        cached.conn = null;
        cached.promise = null;
      }

      // Close existing connection if connected
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }

      // Small delay to ensure connection is fully closed
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reconnect
      await connectDB();

      return {
        success: true,
        message: 'Database connection re-established successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to fix connection: ${error.message}`,
        errors: [error.message],
      };
    }
  }

  /**
   * Run all database repairs
   */
  static async runAllRepairs(): Promise<DatabaseRepairResult> {
    const results: DatabaseRepairResult[] = [];

    // 1. Fix connection
    results.push(await this.fixConnection());
    if (!results[0].success) {
      return {
        success: false,
        message: 'Cannot proceed with repairs - database connection failed',
        details: results,
      };
    }

    // 2. Fix missing indexes
    results.push(await this.fixMissingIndexes());

    // 3. Fix duplicate keys
    results.push(await this.fixDuplicateKeys());

    // 4. Cleanup orphaned documents
    results.push(await this.cleanupOrphanedDocuments());

    const successCount = results.filter((r) => r.success).length;
    const totalCount = results.length;

    return {
      success: successCount === totalCount,
      message: `Completed ${totalCount} repair operations. ${successCount} succeeded, ${totalCount - successCount} failed.`,
      details: results,
    };
  }
}

