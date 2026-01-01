/**
 * Device Detection Utility
 * Detects device type and optimizes ad display accordingly
 */

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  screenWidth: number;
  screenHeight: number;
}

/**
 * Get current device information
 * @returns DeviceInfo object with device details
 */
export function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    // Server-side default
    return {
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      deviceType: 'desktop',
      screenWidth: 1920,
      screenHeight: 1080,
    };
  }

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // Mobile: < 768px
  const isMobile = screenWidth < 768;
  
  // Tablet: 768px - 1024px
  const isTablet = screenWidth >= 768 && screenWidth < 1024;
  
  // Desktop: >= 1024px
  const isDesktop = screenWidth >= 1024;

  const deviceType = 
    isMobile ? 'mobile' :
    isTablet ? 'tablet' :
    'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
    screenWidth,
    screenHeight,
  };
}

/**
 * Check if current device is mobile
 * @returns boolean
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Check if current device is tablet
 * @returns boolean
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const width = window.innerWidth;
  return width >= 768 && width < 1024;
}

/**
 * Check if current device is desktop
 * @returns boolean
 */
export function isDesktopDevice(): boolean {
  if (typeof window === 'undefined') return true;
  return window.innerWidth >= 1024;
}

/**
 * Get optimal ad size based on device
 * @returns Ad size configuration
 */
export function getOptimalAdSize(): {
  width: number | string;
  height: number | string;
  format: string;
} {
  const device = getDeviceInfo();

  if (device.isMobile) {
    return {
      width: '100%',
      height: 250,
      format: 'auto',
    };
  }

  if (device.isTablet) {
    return {
      width: 728,
      height: 90,
      format: 'horizontal',
    };
  }

  // Desktop
  return {
    width: 970,
    height: 250,
    format: 'horizontal',
  };
}

/**
 * Log device information (development only)
 */
export function logDeviceInfo(): void {
  if (process.env.NODE_ENV === 'development') {
    const info = getDeviceInfo();
    console.log('📱 Device Info:', {
      type: info.deviceType,
      screen: `${info.screenWidth}x${info.screenHeight}`,
      isMobile: info.isMobile,
      isTablet: info.isTablet,
      isDesktop: info.isDesktop,
    });
  }
}

