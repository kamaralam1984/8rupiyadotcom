import mongoose, { Schema, Document } from 'mongoose';

// 30 Hero Effects
export type HeroEffect = 
  | 'card' | '3d' | 'glass' | 'highlighted' | 'spotlight'
  | 'gradient' | 'neon' | 'minimal' | 'bold' | 'elegant'
  | 'modern' | 'classic' | 'vibrant' | 'subtle' | 'dynamic'
  | 'smooth' | 'sharp' | 'rounded' | 'angular' | 'curved'
  | 'glow' | 'shadow' | 'border' | 'outline' | 'filled'
  | 'animated' | 'static' | 'hover' | 'pulse' | 'fade';

export interface IHeroSettings extends Document {
  // Background Image
  backgroundImage?: string; // URL to background image
  
  // Effect Settings (30 options)
  centerEffect: HeroEffect;
  leftEffect: HeroEffect;
  rightEffect: HeroEffect;
  
  // Time Settings (in milliseconds)
  rotationSpeed: number; // Shop rotation interval (default: 5000)
  animationSpeed: number; // Animation duration (default: 0.5)
  transitionDuration: number; // Transition duration (default: 0.5)
  
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

const heroEffectEnum = [
  'card', '3d', 'glass', 'highlighted', 'spotlight',
  'gradient', 'neon', 'minimal', 'bold', 'elegant',
  'modern', 'classic', 'vibrant', 'subtle', 'dynamic',
  'smooth', 'sharp', 'rounded', 'angular', 'curved',
  'glow', 'shadow', 'border', 'outline', 'filled',
  'animated', 'static', 'hover', 'pulse', 'fade'
] as const;

const HeroSettingsSchema = new Schema<IHeroSettings>(
  {
    backgroundImage: { type: String, default: '' },
    centerEffect: { type: String, enum: heroEffectEnum, default: 'card' },
    leftEffect: { type: String, enum: heroEffectEnum, default: '3d' },
    rightEffect: { type: String, enum: heroEffectEnum, default: 'glass' },
    rotationSpeed: { type: Number, default: 5000, min: 1000, max: 60000 },
    animationSpeed: { type: Number, default: 0.5, min: 0.1, max: 5 },
    transitionDuration: { type: Number, default: 0.5, min: 0.1, max: 5 },
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

