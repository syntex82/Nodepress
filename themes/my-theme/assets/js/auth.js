// Authentication page functionality
(function() {
  'use strict';

  function showError(form, message) {
    var existingAlert = form.parentElement.querySelector('.alert-error');
    if (existingAlert) {
      existingAlert.innerHTML = '⚠️ ' + message;
      return;
    }
    var alert = document.createElement('div');
    alert.className = 'alert alert-error';
    alert.innerHTML = '⚠️ ' + message;
    alert.style.cssText = 'padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; background: rgba(239, 68, 68, 0.1); border: 1px solid #ef4444; color: #ef4444; display: flex; align-items: center; gap: 0.5rem;';
    form.insertBefore(alert, form.firstChild);
  }

  function setLoading(btn, loading) {
    if (loading) {
      btn.classList.add('loading');
      btn.disabled = true;
    } else {
      btn.classList.remove('loading');
      btn.disabled = false;
    }
  }

  // Login Form
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      var btn = document.getElementById('submitBtn');
      var email = loginForm.querySelector('[name="email"]').value.trim();
      var pass = loginForm.querySelector('[name="password"]').value;

      if (!email || !pass) {
        e.preventDefault();
        showError(loginForm, 'Please fill in all fields');
        return;
      }

      setLoading(btn, true);
    });
  }

  // Register Form
  var regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      var btn = document.getElementById('submitBtn');
      var name = regForm.querySelector('[name="name"]').value.trim();
      var email = regForm.querySelector('[name="email"]').value.trim();
      var pass = regForm.querySelector('[name="password"]').value;
      var confirm = regForm.querySelector('[name="confirmPassword"]').value;

      if (!name || !email || !pass || !confirm) {
        e.preventDefault();
        showError(regForm, 'Please fill in all fields');
        return;
      }

      if (pass.length < 8) {
        e.preventDefault();
        showError(regForm, 'Password must be at least 8 characters');
        return;
      }

      if (pass !== confirm) {
        e.preventDefault();
        showError(regForm, 'Passwords do not match');
        return;
      }

      setLoading(btn, true);
    });
  }

  // Add visual feedback to inputs
  document.querySelectorAll('.form-input').forEach(function(input) {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    input.addEventListener('blur', function() {
      this.parentElement.classList.remove('focused');
    });
  });
})();