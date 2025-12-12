/**
 * Analytics Tracker - Frontend Script
 * Embed this script in your theme to track page views and events
 * 
 * Usage:
 * <script src="/api/plugins/analytics/tracker.js"></script>
 * <script>
 *   WPAnalytics.init({ apiUrl: '/api/analytics' });
 *   WPAnalytics.trackEvent('button', 'click', 'signup-button');
 * </script>
 */

(function(window) {
  'use strict';

  const WPAnalytics = {
    config: {
      apiUrl: '/api/analytics',
      trackPageViews: true,
      trackScrollDepth: true,
      trackTimeOnPage: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    },
    sessionId: null,
    pageViewId: null,
    startTime: null,
    maxScrollDepth: 0,

    init: function(options) {
      Object.assign(this.config, options || {});
      this.sessionId = this.getOrCreateSession();
      this.startTime = Date.now();

      if (this.config.trackPageViews) {
        this.trackPageView();
      }

      if (this.config.trackScrollDepth) {
        this.initScrollTracking();
      }

      if (this.config.trackTimeOnPage) {
        this.initTimeTracking();
      }

      // Track when user leaves
      window.addEventListener('beforeunload', () => this.onPageLeave());
    },

    getOrCreateSession: function() {
      const stored = localStorage.getItem('wp_analytics_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (Date.now() - session.lastActivity < this.config.sessionTimeout) {
          session.lastActivity = Date.now();
          localStorage.setItem('wp_analytics_session', JSON.stringify(session));
          return session.id;
        }
      }
      // Create new session
      return this.createSession();
    },

    createSession: async function() {
      try {
        const response = await fetch(this.config.apiUrl + '/track/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: window.location.pathname }),
          credentials: 'include',
        });
        const data = await response.json();
        const session = { id: data.sessionId, lastActivity: Date.now() };
        localStorage.setItem('wp_analytics_session', JSON.stringify(session));
        return data.sessionId;
      } catch (e) {
        console.error('Analytics: Failed to create session', e);
        return null;
      }
    },

    trackPageView: async function() {
      try {
        const response = await fetch(this.config.apiUrl + '/track/pageview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: window.location.pathname,
            sessionId: this.sessionId,
          }),
          credentials: 'include',
        });
        const data = await response.json();
        this.pageViewId = data.id;
      } catch (e) {
        console.error('Analytics: Failed to track page view', e);
      }
    },

    trackEvent: async function(category, action, label, value) {
      try {
        await fetch(this.config.apiUrl + '/track/event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category,
            action,
            label,
            value,
            path: window.location.pathname,
            sessionId: this.sessionId,
          }),
          credentials: 'include',
        });
      } catch (e) {
        console.error('Analytics: Failed to track event', e);
      }
    },

    initScrollTracking: function() {
      window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;
        this.maxScrollDepth = Math.max(this.maxScrollDepth, scrollPercent);
      });
    },

    initTimeTracking: function() {
      // Update session activity periodically
      setInterval(() => {
        const stored = localStorage.getItem('wp_analytics_session');
        if (stored) {
          const session = JSON.parse(stored);
          session.lastActivity = Date.now();
          localStorage.setItem('wp_analytics_session', JSON.stringify(session));
        }
      }, 60000); // Every minute
    },

    onPageLeave: function() {
      const duration = Math.round((Date.now() - this.startTime) / 1000);
      // Use sendBeacon for reliable delivery on page unload
      if (navigator.sendBeacon && this.pageViewId) {
        navigator.sendBeacon(
          this.config.apiUrl + '/track/update',
          JSON.stringify({
            pageViewId: this.pageViewId,
            duration,
            scrollDepth: this.maxScrollDepth,
          })
        );
      }
    },
  };

  window.WPAnalytics = WPAnalytics;
})(window);

