import mongoose, { Schema, Document } from 'mongoose';

export interface IAdSlot {
  id: string;
  name: string;
  code: string; // HTML/JavaScript code for the ad
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdSettings extends Document {
  homepageAds: boolean;
  categoryAds: boolean;
  searchAds: boolean;
  shopPageAds: boolean;
  adsenseCode: string;
  adsenseId?: string;
  // Custom ads per slot
  customAds: {
    homepage: IAdSlot[];
    category: IAdSlot[];
    search: IAdSlot[];
    shop: IAdSlot[];
  };
  updatedAt: Date;
  createdAt: Date;
}

const AdSlotSchema = new Schema<IAdSlot>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const AdSettingsSchema = new Schema<IAdSettings>(
  {
    homepageAds: { type: Boolean, default: true },
    categoryAds: { type: Boolean, default: true },
    searchAds: { type: Boolean, default: false },
    shopPageAds: { type: Boolean, default: true },
    adsenseCode: { type: String, default: '' },
    adsenseId: { type: String, default: '' },
    customAds: {
      homepage: { type: [AdSlotSchema], default: [] },
      category: { type: [AdSlotSchema], default: [] },
      search: { type: [AdSlotSchema], default: [] },
      shop: { type: [AdSlotSchema], default: [] },
    },
  },
  { timestamps: true }
);

// Ensure only one document exists
AdSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      homepageAds: true,
      categoryAds: true,
      searchAds: false,
      shopPageAds: true,
      adsenseCode: '',
      adsenseId: '',
    });
  }
  return settings;
};

export default mongoose.models.AdSettings || mongoose.model<IAdSettings>('AdSettings', AdSettingsSchema);

