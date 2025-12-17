// Main theme JavaScript - Unified functionality
(function() {
  'use strict';
  var API = '/api';

  // Get auth headers
  function getAuthHeaders() {
    var token = localStorage.getItem('access_token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  // Check if user is authenticated
  async function checkAuth() {
    try {
      var r = await fetch(API + '/auth/me', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  // Update cart count in header
  async function updateCartCount() {
    try {
      var r = await fetch(API + '/shop/cart', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) return;
      var cart = await r.json();
      var count = cart.items?.reduce(function(s, i) { return s + i.quantity; }, 0) || 0;

      // Update all cart count badges
      var badges = document.querySelectorAll('.cart-count, #cartCount');
      badges.forEach(function(badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
      });
    } catch (e) {}
  }

  // Add to cart function
  async function addToCart(type, id, quantity) {
    quantity = quantity || 1;
    try {
      var body = { quantity: quantity };
      if (type === 'course') {
        body.courseId = id;
      } else {
        body.productId = id;
      }

      var r = await fetch(API + '/shop/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(body),
        credentials: 'include'
      });

      if (!r.ok) {
        var err = await r.json().catch(function() { return {}; });
        throw new Error(err.message || 'Failed to add to cart');
      }

      updateCartCount();
      showNotification('Added to cart!', 'success');
      return true;
    } catch (e) {
      showNotification(e.message || 'Failed to add to cart', 'error');
      return false;
    }
  }

  // Enroll in free course
  async function enrollFreeCourse(courseId) {
    try {
      var r = await fetch(API + '/lms/courses/' + courseId + '/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({}),
        credentials: 'include'
      });

      if (r.ok) {
        showNotification('Successfully enrolled!', 'success');
        setTimeout(function() { window.location.href = '/learn/' + courseId; }, 1500);
        return true;
      } else if (r.status === 401) {
        showNotification('Please log in to enroll', 'error');
        setTimeout(function() { window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname); }, 1500);
        return false;
      } else {
        var err = await r.json().catch(function() { return {}; });
        showNotification(err.message || 'Failed to enroll', 'error');
        return false;
      }
    } catch (e) {
      showNotification('Failed to enroll', 'error');
      return false;
    }
  }

  // Show notification
  function showNotification(message, type) {
    type = type || 'info';
    var existing = document.querySelector('.notification');
    if (existing) existing.remove();

    var notification = document.createElement('div');
    notification.className = 'notification notification-' + type;
    notification.innerHTML = '<span>' + (type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ') + '</span> ' + message;

    var bgColor = type === 'success' ? 'rgba(16, 185, 129, 0.95)' :
                  type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(99, 102, 241, 0.95)';

    notification.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 1rem 1.5rem; border-radius: 8px; z-index: 10000; display: flex; align-items: center; gap: 0.5rem; animation: slideIn 0.3s ease; font-weight: 500; background: ' + bgColor + '; color: white; box-shadow: 0 10px 25px rgba(0,0,0,0.3);';

    document.body.appendChild(notification);

    setTimeout(function() {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(function() { notification.remove(); }, 300);
    }, 3000);
  }

  // Add notification animation styles
  if (!document.getElementById('notification-styles')) {
    var style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
    document.head.appendChild(style);
  }

  // User menu dropdown
  function initUserMenu() {
    var btn = document.getElementById('userMenuBtn');
    var dropdown = document.getElementById('userDropdown');
    if (btn && dropdown) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('active');
      });
      document.addEventListener('click', function() {
        dropdown.classList.remove('active');
      });
    }

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('access_token');
        document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/logout';
      });
    }
  }

  // Initialize add to cart buttons
  function initAddToCart() {
    document.querySelectorAll('[data-add-product]').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        await addToCart('product', this.dataset.addProduct);
      });
    });

    document.querySelectorAll('[data-add-course]').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        await addToCart('course', this.dataset.addCourse);
      });
    });

    document.querySelectorAll('[data-enroll-course]').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        await enrollFreeCourse(this.dataset.enrollCourse);
      });
    });
  }

  // Initialize
  function init() {
    initUserMenu();
    updateCartCount();
    initAddToCart();
  }

  // Expose functions globally
  window.addToCart = addToCart;
  window.updateCartCount = updateCartCount;
  window.enrollFreeCourse = enrollFreeCourse;
  window.showNotification = showNotification;
  window.checkAuth = checkAuth;
  window.getAuthHeaders = getAuthHeaders;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();