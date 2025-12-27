// Types for CustomPage - safe to import in client components
// This file does NOT import mongoose

export enum PageComponentType {
  HERO = 'hero',
  LEFT_RAIL = 'left_rail',
  RIGHT_RAIL = 'right_rail',
  AD_SPACE = 'ad_space',
  BUTTON = 'button',
  SLIDER = 'slider',
  CONTENT = 'content',
}

export interface AnimationEffect {
  type: 'fade' | 'slide' | 'zoom' | 'bounce' | 'rotate' | 'none';
  duration?: number;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export interface PageComponent {
  _id?: string;
  type: PageComponentType;
  order: number;
  isActive: boolean;
  content: {
    // Hero specific
    title?: string;
    subtitle?: string;
    image?: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
    
    // Left/Right Rail specific
    width?: string;
    position?: 'fixed' | 'sticky' | 'relative';
    backgroundColor?: string;
    
    // Ad Space specific
    adCode?: string;
    adSize?: string;
    adType?: 'google_adsense' | 'custom';
    
    // Button specific
    buttonText?: string;
    buttonLink?: string;
    style?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    color?: string;
    
    // Slider specific
    slides?: Array<{
      image: string;
      title?: string;
      description?: string;
      link?: string;
    }>;
    autoplay?: boolean;
    interval?: number;
    
    // Content specific
    html?: string;
    text?: string;
    
    // Common
    padding?: string;
    margin?: string;
    className?: string;
  };
  animation?: AnimationEffect;
}

export interface CustomPage {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isPublished: boolean;
  components: PageComponent[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
}

