import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageLayout extends Document {
  name: string; // Layout name (e.g., "Default", "Summer 2024")
  isActive: boolean; // Only one layout can be active at a time
  isDefault: boolean; // Default layout
  
  // Section Visibility Controls
  sections: {
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    stats: { enabled: boolean; order: number };
    footer: { enabled: boolean; order: number };
  };
  
  // Hero Settings Reference
  heroSettingsId?: mongoose.Types.ObjectId;
  
  createdAt: Date;
  updatedAt: Date;
}

const HomepageLayoutSchema = new Schema<IHomepageLayout>(
  {
    name: { type: String, required: true },
    isActive: { type: Boolean, default: false },
    isDefault: { type: Boolean, default: false },
    sections: {
      hero: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 1 } },
      connectionStatus: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 2 } },
      leftRail: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 3 } },
      rightRail: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 4 } },
      featuredShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 5 },
        title: { type: String, default: 'Featured Shops' },
        limit: { type: Number, default: 12 }
      },
      paidShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 6 },
        title: { type: String, default: 'Premium Shops' },
        limit: { type: Number, default: 12 }
      },
      topRated: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 7 },
        title: { type: String, default: 'Top Rated Shops' },
        limit: { type: Number, default: 6 }
      },
      nearbyShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 8 },
        title: { type: String, default: 'All Shops' },
        limit: { type: Number, default: 20 }
      },
      stats: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 9 } },
      footer: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 10 } },
    },
    heroSettingsId: { type: Schema.Types.ObjectId, ref: 'HeroSettings' },
  },
  { timestamps: true }
);

// Ensure only one active layout
HomepageLayoutSchema.index({ isActive: 1 });
HomepageLayoutSchema.index({ isDefault: 1 });

export default mongoose.models.HomepageLayout || mongoose.model<IHomepageLayout>('HomepageLayout', HomepageLayoutSchema);

