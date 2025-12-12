/**
 * Analytics Plugin v2.0
 * Advanced analytics tracking with sessions, events, and comprehensive dashboards
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User Agent Parser - simple implementation
const parseUserAgent = (ua) => {
  if (!ua) return { device: 'unknown', browser: 'unknown', os: 'unknown' };

  const uaLower = ua.toLowerCase();

  // Device detection
  let device = 'desktop';
  if (/mobile|android|iphone|ipad|ipod|blackberry|windows phone/i.test(ua)) {
    device = /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile';
  }

  // Browser detection
  let browser = 'unknown';
  if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('edg')) browser = 'Edge';
  else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('safari')) browser = 'Safari';
  else if (uaLower.includes('opera') || uaLower.includes('opr')) browser = 'Opera';

  // OS detection
  let os = 'unknown';
  if (uaLower.includes('windows')) os = 'Windows';
  else if (uaLower.includes('mac')) os = 'macOS';
  else if (uaLower.includes('linux')) os = 'Linux';
  else if (uaLower.includes('android')) os = 'Android';
  else if (uaLower.includes('iphone') || uaLower.includes('ipad')) os = 'iOS';

  return { device, browser, os };
};

// Generate session ID
const generateSessionId = () => {
  return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
};

module.exports = {
  /**
   * Called when plugin is activated
   */
  onActivate: async () => {
    console.log('📊 Analytics Plugin v2.0 activated');
    // Clean up stale sessions (inactive for more than 30 minutes)
    try {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
      await prisma.analyticsSession.updateMany({
        where: {
          isActive: true,
          startedAt: { lt: thirtyMinutesAgo },
        },
        data: {
          isActive: false,
          endedAt: new Date(),
        },
      });
    } catch (e) {
      console.log('Session cleanup skipped:', e.message);
    }
  },

  /**
   * Called when plugin is deactivated
   */
  onDeactivate: async () => {
    console.log('📊 Analytics Plugin deactivated');
  },

  /**
   * Start or resume a session
   */
  getOrCreateSession: async (sessionId, data = {}) => {
    try {
      if (sessionId) {
        const existing = await prisma.analyticsSession.findUnique({
          where: { id: sessionId },
        });
        if (existing && existing.isActive) {
          return existing;
        }
      }

      const { device, browser, os } = parseUserAgent(data.userAgent);

      return await prisma.analyticsSession.create({
        data: {
          userId: data.userId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          device,
          browser,
          os,
          referer: data.referer,
          landingPage: data.path,
        },
      });
    } catch (error) {
      console.error('Error creating session:', error);
      return null;
    }
  },

  /**
   * Track a page view with enhanced data
   */
  trackPageView: async (data) => {
    try {
      const { device, browser, os } = parseUserAgent(data.userAgent);

      const pageView = await prisma.pageView.create({
        data: {
          path: data.path,
          userId: data.userId,
          sessionId: data.sessionId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          referer: data.referer,
          device,
          browser,
          os,
          country: data.country,
          city: data.city,
        },
      });

      // Update session page count
      if (data.sessionId) {
        await prisma.analyticsSession.update({
          where: { id: data.sessionId },
          data: {
            pageCount: { increment: 1 },
            exitPage: data.path,
          },
        }).catch(() => {});
      }

      return pageView;
    } catch (error) {
      console.error('Error tracking page view:', error);
      return null;
    }
  },

  /**
   * Update page view with engagement metrics
   */
  updatePageView: async (pageViewId, data) => {
    try {
      return await prisma.pageView.update({
        where: { id: pageViewId },
        data: {
          duration: data.duration,
          scrollDepth: data.scrollDepth,
        },
      });
    } catch (error) {
      console.error('Error updating page view:', error);
      return null;
    }
  },

  /**
   * Track custom event
   */
  trackEvent: async (data) => {
    try {
      return await prisma.analyticsEvent.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          category: data.category,
          action: data.action,
          label: data.label,
          value: data.value,
          path: data.path,
          metadata: data.metadata,
          ipAddress: data.ipAddress,
        },
      });
    } catch (error) {
      console.error('Error tracking event:', error);
      return null;
    }
  },

  /**
   * End session
   */
  endSession: async (sessionId, duration) => {
    try {
      return await prisma.analyticsSession.update({
        where: { id: sessionId },
        data: {
          isActive: false,
          endedAt: new Date(),
          duration: duration || 0,
        },
      });
    } catch (error) {
      console.error('Error ending session:', error);
      return null;
    }
  },

  // Export helper
  parseUserAgent,
  generateSessionId,
};

