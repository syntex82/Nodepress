// My Account page functionality
(function() {
  var API = '/api';

  function getAuthHeaders() {
    var token = localStorage.getItem('access_token');
    return token ? { 'Authorization': 'Bearer ' + token } : {};
  }

  async function checkAuth() {
    try {
      var r = await fetch(API + '/auth/me', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { return null; }
  }

  async function loadProfile() {
    try {
      var r = await fetch(API + '/profiles/me', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) throw new Error('Failed to load profile');
      var profile = await r.json();
      document.getElementById('profileName').value = profile.displayName || profile.name || '';
      document.getElementById('profileEmail').value = profile.email || '';
      document.getElementById('profileBio').value = profile.bio || '';
    } catch (e) { console.error('Profile load error:', e); }
  }

  async function loadOrders() {
    var container = document.getElementById('ordersList');
    try {
      var r = await fetch(API + '/shop/my-orders', { credentials: 'include', headers: getAuthHeaders() });
      if (!r.ok) throw new Error('Failed to load orders');
      var data = await r.json();
      var orders = data.orders || data || [];

      if (orders.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="icon">📦</div><p>No orders yet</p><a href="/shop" class="btn btn-primary">Start Shopping</a></div>';
        return;
      }

      container.innerHTML = orders.map(function(order) {
        var statusClass = order.status === 'COMPLETED' ? 'completed' : order.status === 'CANCELLED' || order.status === 'FAILED' ? 'failed' : 'pending';
        var items = order.items || [];

        return '<div class="order-card">' +
          '<div class="order-header">' +
            '<div><div class="order-id">#' + order.orderNumber + '</div><div class="order-date">' + new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) + '</div></div>' +
            '<span class="order-status ' + statusClass + '">' + order.status + '</span>' +
          '</div>' +
          '<div class="order-items">' +
            items.map(function(item) {
              var img = item.product?.images?.[0] || item.course?.featuredImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop';
              var name = item.product?.name || item.course?.title || 'Item';
              return '<div class="order-item">' +
                '<img src="' + img + '" alt="' + name + '" class="order-item-image">' +
                '<div class="order-item-details">' +
                  '<div class="order-item-name">' + name + '</div>' +
                  '<div class="order-item-meta">Qty: ' + item.quantity + ' × $' + parseFloat(item.price || 0).toFixed(2) + '</div>' +
                '</div>' +
              '</div>';
            }).join('') +
          '</div>' +
          '<div class="order-total"><span>Total</span><span>$' + parseFloat(order.total).toFixed(2) + '</span></div>' +
        '</div>';
      }).join('');
    } catch (e) {
      container.innerHTML = '<div class="empty-state" style="color: var(--color-error);"><div class="icon">❌</div><p>Failed to load orders</p></div>';
    }
  }

  function setupTabs() {
    var links = document.querySelectorAll('.account-nav-link[data-tab]');
    var tabs = document.querySelectorAll('.tab-content');

    // Handle URL hash for deep linking
    var hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash + 'Tab')) {
      links.forEach(function(l) { l.classList.remove('active'); });
      tabs.forEach(function(t) { t.classList.remove('active'); });
      document.querySelector('[data-tab="' + hash + '"]')?.classList.add('active');
      document.getElementById(hash + 'Tab').classList.add('active');
      if (hash === 'orders') loadOrders();
    }

    links.forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var tab = this.getAttribute('data-tab');
        if (!tab) return;

        links.forEach(function(l) { l.classList.remove('active'); });
        this.classList.add('active');

        tabs.forEach(function(t) { t.classList.remove('active'); });
        document.getElementById(tab + 'Tab').classList.add('active');

        window.location.hash = tab;
        if (tab === 'orders') loadOrders();
      });
    });
  }

  function setupProfileForm() {
    var form = document.getElementById('profileForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var msg = document.getElementById('profileMessage');
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      btn.textContent = 'Saving...';
      btn.disabled = true;

      try {
        var r = await fetch(API + '/profiles/me', {
          method: 'PUT', credentials: 'include',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            displayName: document.getElementById('profileName').value,
            bio: document.getElementById('profileBio').value
          })
        });
        if (!r.ok) throw new Error('Failed to update profile');

        msg.style.display = 'block';
        msg.className = 'message success';
        msg.textContent = '✓ Profile updated successfully!';
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch (e) {
        msg.style.display = 'block';
        msg.className = 'message error';
        msg.textContent = '✗ Failed to update profile';
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  function setupPasswordForm() {
    var form = document.getElementById('passwordForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      var msg = document.getElementById('passwordMessage');
      var btn = form.querySelector('button[type="submit"]');
      var originalText = btn.textContent;

      var newPass = document.getElementById('newPassword').value;
      var confirmPass = document.getElementById('confirmPassword').value;

      if (newPass !== confirmPass) {
        msg.style.display = 'block';
        msg.className = 'message error';
        msg.textContent = '✗ Passwords do not match';
        return;
      }

      btn.textContent = 'Updating...';
      btn.disabled = true;

      try {
        var r = await fetch(API + '/auth/change-password', {
          method: 'POST', credentials: 'include',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword: document.getElementById('currentPassword').value,
            newPassword: newPass
          })
        });
        if (!r.ok) throw new Error('Failed to change password');

        msg.style.display = 'block';
        msg.className = 'message success';
        msg.textContent = '✓ Password updated successfully!';
        form.reset();
        setTimeout(function() { msg.style.display = 'none'; }, 3000);
      } catch (e) {
        msg.style.display = 'block';
        msg.className = 'message error';
        msg.textContent = '✗ Failed to change password. Check your current password.';
      } finally {
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  }

  function setupLogout() {
    var btn = document.getElementById('logoutBtn');
    if (!btn) return;

    btn.addEventListener('click', function() {
      localStorage.removeItem('access_token');
      document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/';
    });
  }

  async function init() {
    var user = await checkAuth();
    if (!user) {
      document.getElementById('accountContent').style.display = 'none';
      document.getElementById('notLoggedIn').style.display = 'block';
      return;
    }

    setupTabs();
    setupProfileForm();
    setupPasswordForm();
    setupLogout();
    loadProfile();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

