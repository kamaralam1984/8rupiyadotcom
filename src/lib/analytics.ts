/**
 * 8Rupiya Analytics Library
 * Client-side tracking utilities
 */

import { v4 as uuidv4 } from 'uuid';
import Cookies from 'js-cookie';

export class Analytics {
  private static visitorId: string | null = null;
  private static sessionId: string | null = null;
  private static startTime: number = Date.now();

  /**
   * Initialize analytics tracking
   */
  static init() {
    // Get or create visitor ID
    this.visitorId = Cookies.get('_8r_vid') || null;
    if (!this.visitorId) {
      this.visitorId = uuidv4();
      Cookies.set('_8r_vid', this.visitorId, { expires: 365 }); // 1 year
    }

    // Get or create session ID
    this.sessionId = sessionStorage.getItem('_8r_sid') || null;
    if (!this.sessionId) {
      this.sessionId = uuidv4();
      sessionStorage.setItem('_8r_sid', this.sessionId);
    }

    // Track page view
    this.trackPageView();

    // Track time spent on page
    this.trackTimeSpent();

    // Track exit
    this.trackExit();
  }

  /**
   * Get device type
   */
  private static getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return 'mobile';
    }
    return 'desktop';
  }

  /**
   * Get browser name
   */
  private static getBrowser(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Firefox') > -1) return 'Firefox';
    if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) return 'Opera';
    if (ua.indexOf('Trident') > -1) return 'Internet Explorer';
    if (ua.indexOf('Edge') > -1) return 'Edge';
    if (ua.indexOf('Chrome') > -1) return 'Chrome';
    if (ua.indexOf('Safari') > -1) return 'Safari';
    return 'Unknown';
  }

  /**
   * Get OS
   */
  private static getOS(): string {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'MacOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1) return 'iOS';
    return 'Unknown';
  }

  /**
   * Get UTM parameters
   */
  private static getUTMParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || undefined,
      utmMedium: params.get('utm_medium') || undefined,
      utmCampaign: params.get('utm_campaign') || undefined,
    };
  }

  /**
   * Track page view
   */
  static async trackPageView() {
    try {
      const data = {
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        deviceType: this.getDeviceType(),
        browser: this.getBrowser(),
        os: this.getOS(),
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        ...this.getUTMParams(),
      };

      await fetch('/api/analytics/pageview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Analytics: Failed to track page view', error);
    }
  }

  /**
   * Track click event
   */
  static async trackClick(clickType: string, data: any = {}) {
    try {
      await fetch('/api/analytics/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitorId: this.visitorId,
          sessionId: this.sessionId,
          clickType,
          sourcePage: window.location.pathname,
          deviceType: this.getDeviceType(),
          ...data,
        }),
      });
    } catch (error) {
      console.error('Analytics: Failed to track click', error);
    }
  }

  /**
   * Track time spent on page
   */
  private static trackTimeSpent() {
    window.addEventListener('beforeunload', async () => {
      const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
      
      // Use sendBeacon for reliable tracking on page exit
      const data = JSON.stringify({
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        path: window.location.pathname,
        timeSpent,
      });

      navigator.sendBeacon('/api/analytics/timespent', data);
    });
  }

  /**
   * Track exit
   */
  private static trackExit() {
    window.addEventListener('beforeunload', () => {
      const data = JSON.stringify({
        visitorId: this.visitorId,
        sessionId: this.sessionId,
        exitPage: window.location.pathname,
      });

      navigator.sendBeacon('/api/analytics/exit', data);
    });
  }

  /**
   * Track shop view
   */
  static trackShopView(shopId: string, shopName: string) {
    this.trackClick('shop_detail', { shopId, shopName });
  }

  /**
   * Track shop card click
   */
  static trackShopCardClick(shopId: string, shopName: string) {
    this.trackClick('shop_card', { shopId, shopName });
  }

  /**
   * Track phone click
   */
  static trackPhoneClick(shopId: string, phone: string) {
    this.trackClick('phone_click', { shopId, targetUrl: `tel:${phone}` });
  }

  /**
   * Track WhatsApp click
   */
  static trackWhatsAppClick(shopId: string, phone: string) {
    this.trackClick('whatsapp_click', { shopId, targetUrl: `https://wa.me/${phone}` });
  }

  /**
   * Track direction click
   */
  static trackDirectionClick(shopId: string) {
    this.trackClick('direction_click', { shopId });
  }

  /**
   * Track category click
   */
  static trackCategoryClick(category: string) {
    this.trackClick('category_click', { category });
  }

  /**
   * Track search
   */
  static trackSearch(query: string) {
    this.trackClick('search_click', { searchQuery: query });
  }
}

export default Analytics;

