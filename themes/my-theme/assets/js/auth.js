/**
 * Authentication JavaScript
 * Handles login and registration form submissions
 */

(function() {
  'use strict';

  // Login form handler
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      
      // Show loading state
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitBtn.disabled = true;

      const formData = new FormData(loginForm);
      const email = formData.get('email');
      const password = formData.get('password');

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          // Store token in localStorage for API calls
          localStorage.setItem('access_token', data.access_token);
          // Redirect
          const redirect = new URLSearchParams(window.location.search).get('redirect') || '/';
          window.location.href = redirect;
        } else {
          showError(loginForm, data.message || 'Invalid email or password');
          resetButton(submitBtn, btnText, btnLoading);
        }
      } catch (error) {
        showError(loginForm, 'An error occurred. Please try again.');
        resetButton(submitBtn, btnText, btnLoading);
      }
    });
  }

  // Register form handler
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submitBtn');
      const btnText = submitBtn.querySelector('.btn-text');
      const btnLoading = submitBtn.querySelector('.btn-loading');
      
      const formData = new FormData(registerForm);
      const name = formData.get('name');
      const email = formData.get('email');
      const password = formData.get('password');
      const confirmPassword = formData.get('confirmPassword');

      // Validate passwords match
      if (password !== confirmPassword) {
        showError(registerForm, 'Passwords do not match');
        return;
      }

      // Show loading state
      btnText.style.display = 'none';
      btnLoading.style.display = 'inline';
      submitBtn.disabled = true;

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
          credentials: 'include'
        });

        const data = await response.json();

        if (response.ok) {
          // Auto-login after registration
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
          });

          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            localStorage.setItem('access_token', loginData.access_token);
            window.location.href = '/';
          } else {
            window.location.href = '/login';
          }
        } else {
          showError(registerForm, data.message || 'Registration failed');
          resetButton(submitBtn, btnText, btnLoading);
        }
      } catch (error) {
        showError(registerForm, 'An error occurred. Please try again.');
        resetButton(submitBtn, btnText, btnLoading);
      }
    });
  }

  // User menu dropdown
  const userMenuBtn = document.getElementById('userMenuBtn');
  const userDropdown = document.getElementById('userDropdown');
  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    document.addEventListener('click', function() {
      userDropdown.classList.remove('active');
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      localStorage.removeItem('access_token');
      window.location.href = '/logout';
    });
  }

  // Helper functions
  function showError(form, message) {
    let alertEl = form.querySelector('.alert-error');
    if (!alertEl) {
      alertEl = document.createElement('div');
      alertEl.className = 'alert alert-error';
      form.insertBefore(alertEl, form.firstChild);
    }
    alertEl.textContent = message;
  }

  function resetButton(btn, text, loading) {
    text.style.display = 'inline';
    loading.style.display = 'none';
    btn.disabled = false;
  }
})();

