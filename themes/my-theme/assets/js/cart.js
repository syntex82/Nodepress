/**
 * Cart JavaScript
 * Handles cart functionality for products and courses
 */

(function() {
  'use strict';

  const API_BASE = '/api/shop/cart';

  // Initialize cart on page load
  document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
  });

  // Load cart items
  async function loadCart() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');

    if (!cartItems) return;

    try {
      const response = await fetch(API_BASE, {
        credentials: 'include',
        headers: getAuthHeaders()
      });

      if (!response.ok) throw new Error('Failed to load cart');

      const cart = await response.json();

      if (!cart.items || cart.items.length === 0) {
        if (cartContent) cartContent.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        return;
      }

      if (cartContent) cartContent.style.display = 'grid';
      if (emptyCart) emptyCart.style.display = 'none';

      renderCartItems(cart.items);
      updateSummary(cart);
    } catch (error) {
      console.error('Error loading cart:', error);
      cartItems.innerHTML = '<p class="error">Failed to load cart. Please refresh the page.</p>';
    }
  }

  // Render cart items
  function renderCartItems(items) {
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    cartItems.innerHTML = items.map(item => {
      const isCourse = item.type === 'COURSE';
      const image = item.product?.images?.[0] || item.course?.thumbnail || '/placeholder.jpg';
      const title = item.product?.name || item.course?.title || 'Unknown Item';
      const price = item.product?.price || item.course?.price || 0;

      return `
        <div class="cart-item" data-item-id="${item.id}">
          <img src="${image}" alt="${title}" class="cart-item-image">
          <div class="cart-item-details">
            <div class="cart-item-title">${title}</div>
            <div class="cart-item-type">${isCourse ? 'Course' : 'Product'}</div>
            <div class="cart-item-price">$${parseFloat(price).toFixed(2)}</div>
          </div>
          <div class="cart-item-actions">
            ${!isCourse ? `
              <div class="quantity-control">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
              </div>
            ` : ''}
            <button class="remove-btn" onclick="removeItem('${item.id}')">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update cart summary
  function updateSummary(cart) {
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product?.price || item.course?.price || 0;
      return sum + (parseFloat(price) * item.quantity);
    }, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
  }

  // Update quantity
  window.updateQuantity = async function(itemId, newQuantity) {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      await fetch(`${API_BASE}/item/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ quantity: newQuantity }),
        credentials: 'include'
      });
      loadCart();
      updateCartCount();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  // Remove item
  window.removeItem = async function(itemId) {
    try {
      await fetch(`${API_BASE}/item/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      loadCart();
      updateCartCount();
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  // Update cart count in header
  async function updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (!cartCount) return;

    try {
      const response = await fetch(API_BASE, {
        credentials: 'include',
        headers: getAuthHeaders()
      });
      const cart = await response.json();
      const count = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      
      if (count > 0) {
        cartCount.textContent = count;
        cartCount.style.display = 'flex';
      } else {
        cartCount.style.display = 'none';
      }
    } catch (error) {
      cartCount.style.display = 'none';
    }
  }

  // Get auth headers
  function getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  // Expose for global use
  window.updateCartCount = updateCartCount;
})();

