import mongoose, { Schema, Document } from 'mongoose';

export interface IHeroSettings extends Document {
  // Effect Settings
  centerEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  leftEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  rightEffect: 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight';
  
  // Speed Settings (in milliseconds)
  rotationSpeed: number; // Shop rotation interval (default: 5000)
  animationSpeed: number; // Animation duration (default: 0.5)
  
  // Color Settings
  primaryColor: string; // Hex color
  secondaryColor: string; // Hex color
  accentColor: string; // Hex color
  
  // Display Settings
  showLeftShop: boolean;
  showRightShop: boolean;
  showSearchBar: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const HeroSettingsSchema = new Schema<IHeroSettings>(
  {
    centerEffect: { type: String, enum: ['card', '3d', 'glass', 'highlighted', 'spotlight'], default: 'card' },
    leftEffect: { type: String, enum: ['card', '3d', 'glass', 'highlighted', 'spotlight'], default: '3d' },
    rightEffect: { type: String, enum: ['card', '3d', 'glass', 'highlighted', 'spotlight'], default: 'glass' },
    rotationSpeed: { type: Number, default: 5000 },
    animationSpeed: { type: Number, default: 0.5 },
    primaryColor: { type: String, default: '#3B82F6' },
    secondaryColor: { type: String, default: '#8B5CF6' },
    accentColor: { type: String, default: '#EC4899' },
    showLeftShop: { type: Boolean, default: true },
    showRightShop: { type: Boolean, default: true },
    showSearchBar: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.HeroSettings || mongoose.model<IHeroSettings>('HeroSettings', HeroSettingsSchema);

