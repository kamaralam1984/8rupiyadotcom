import mongoose, { Schema, Document } from 'mongoose';

export interface IHomepageLayout extends Document {
  name: string; // Layout name (e.g., "Default", "Summer 2024")
  isActive: boolean; // Only one layout can be active at a time
  isDefault: boolean; // Default layout
  
  // Section Visibility Controls
  sections: {
    // Top Sections
    topCTA: { enabled: boolean; order: number };
    hero: { enabled: boolean; order: number };
    connectionStatus: { enabled: boolean; order: number };
    
    // Content Sections
    aboutSection: { enabled: boolean; order: number };
    seoTextSection: { enabled: boolean; order: number };
    
    // Sidebars
    leftRail: { enabled: boolean; order: number };
    rightRail: { enabled: boolean; order: number };
    
    // Shop Sections
    featuredShops: { enabled: boolean; order: number; title?: string; limit?: number };
    paidShops: { enabled: boolean; order: number; title?: string; limit?: number };
    topRated: { enabled: boolean; order: number; title?: string; limit?: number };
    nearbyShops: { enabled: boolean; order: number; title?: string; limit?: number };
    
    // Mixed Content Sections
    mixedContent1: { enabled: boolean; order: number; variant?: 'text-left' | 'text-right' | 'text-center' | 'text-only' };
    mixedContent2: { enabled: boolean; order: number; variant?: 'text-left' | 'text-right' | 'text-center' | 'text-only' };
    mixedContent3: { enabled: boolean; order: number; variant?: 'text-left' | 'text-right' | 'text-center' | 'text-only' };
    mixedContent4: { enabled: boolean; order: number; variant?: 'text-left' | 'text-right' | 'text-center' | 'text-only' };
    
    // Ad Sections
    displayAd1: { enabled: boolean; order: number }; // After SEO Text
    displayAd2: { enabled: boolean; order: number }; // Between sections
    inFeedAds: { enabled: boolean; order: number }; // In-feed ads between shops
    
    // Other Sections
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
      // Top Sections
      topCTA: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 1 } },
      hero: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 2 } },
      connectionStatus: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 3 } },
      
      // Content Sections
      aboutSection: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 4 } },
      seoTextSection: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 5 } },
      
      // Sidebars
      leftRail: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 6 } },
      rightRail: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 7 } },
      
      // Shop Sections
      featuredShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 8 },
        title: { type: String, default: 'Featured Shops' },
        limit: { type: Number, default: 12 }
      },
      paidShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 9 },
        title: { type: String, default: 'Premium Shops' },
        limit: { type: Number, default: 12 }
      },
      topRated: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 10 },
        title: { type: String, default: 'Top Rated Shops' },
        limit: { type: Number, default: 6 }
      },
      nearbyShops: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 11 },
        title: { type: String, default: 'All Shops' },
        limit: { type: Number, default: 20 }
      },
      
      // Mixed Content Sections
      mixedContent1: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 12 },
        variant: { type: String, enum: ['text-left', 'text-right', 'text-center', 'text-only'], default: 'text-left' }
      },
      mixedContent2: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 13 },
        variant: { type: String, enum: ['text-left', 'text-right', 'text-center', 'text-only'], default: 'text-right' }
      },
      mixedContent3: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 14 },
        variant: { type: String, enum: ['text-left', 'text-right', 'text-center', 'text-only'], default: 'text-center' }
      },
      mixedContent4: { 
        enabled: { type: Boolean, default: true }, 
        order: { type: Number, default: 15 },
        variant: { type: String, enum: ['text-left', 'text-right', 'text-center', 'text-only'], default: 'text-only' }
      },
      
      // Ad Sections
      displayAd1: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 16 } },
      displayAd2: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 17 } },
      inFeedAds: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 18 } },
      
      // Other Sections
      stats: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 19 } },
      footer: { enabled: { type: Boolean, default: true }, order: { type: Number, default: 20 } },
    },
    heroSettingsId: { type: Schema.Types.ObjectId, ref: 'HeroSettings' },
  },
  { timestamps: true }
);

// Ensure only one active layout
HomepageLayoutSchema.index({ isActive: 1 });
HomepageLayoutSchema.index({ isDefault: 1 });

export default mongoose.models.HomepageLayout || mongoose.model<IHomepageLayout>('HomepageLayout', HomepageLayoutSchema);

