import mongoose, { Schema, Document } from 'mongoose';

export interface IAdSpaceContent extends Document {
  // Which rail this content is for
  rail: 'left' | 'right';
  
  // Position/order in the rail (for multiple content blocks)
  position: number; // 1, 2, 3, etc.
  
  // Content
  title?: string; // Optional title/heading
  content: string; // Main text content (supports HTML)
  
  // Styling
  backgroundColor?: string; // Hex color or Tailwind class
  textColor?: string; // Hex color or Tailwind class
  borderColor?: string; // Hex color or Tailwind class
  
  // Display settings
  isActive: boolean; // Show/hide this content
  showBorder: boolean; // Show border around content
  showBackground: boolean; // Show background color
  
  // Additional settings
  padding?: string; // Custom padding (e.g., 'p-4', 'p-6')
  margin?: string; // Custom margin (e.g., 'mb-4', 'mb-6')
  textAlign?: 'left' | 'center' | 'right'; // Text alignment
  
  // Link (optional)
  linkUrl?: string; // If content should be clickable
  linkText?: string; // Link text
  
  createdAt: Date;
  updatedAt: Date;
}

const AdSpaceContentSchema = new Schema<IAdSpaceContent>(
  {
    rail: { 
      type: String, 
      enum: ['left', 'right'], 
      required: true 
    },
    position: { 
      type: Number, 
      required: true, 
      default: 1,
      min: 1 
    },
    title: { 
      type: String, 
      default: '' 
    },
    content: { 
      type: String, 
      required: true,
      default: '' 
    },
    backgroundColor: { 
      type: String, 
      default: '#FFFFFF' 
    },
    textColor: { 
      type: String, 
      default: '#1F2937' 
    },
    borderColor: { 
      type: String, 
      default: '#E5E7EB' 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    showBorder: { 
      type: Boolean, 
      default: true 
    },
    showBackground: { 
      type: Boolean, 
      default: true 
    },
    padding: { 
      type: String, 
      default: 'p-4' 
    },
    margin: { 
      type: String, 
      default: 'mb-4' 
    },
    textAlign: { 
      type: String, 
      enum: ['left', 'center', 'right'], 
      default: 'left' 
    },
    linkUrl: { 
      type: String, 
      default: '' 
    },
    linkText: { 
      type: String, 
      default: '' 
    },
  },
  { timestamps: true }
);

// Index for efficient queries
AdSpaceContentSchema.index({ rail: 1, position: 1 });
AdSpaceContentSchema.index({ rail: 1, isActive: 1 });

export default mongoose.models.AdSpaceContent || mongoose.model<IAdSpaceContent>('AdSpaceContent', AdSpaceContentSchema);

