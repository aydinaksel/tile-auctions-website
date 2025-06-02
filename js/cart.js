const API_URL = "https://ix4l6l8y36.execute-api.eu-west-1.amazonaws.com/production/api/create-payment-intent";

export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(p => p["Item No."] === product["Item No."]);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    saveCart(cart);
    return { updated: true };
  } else {
    product.quantity = 1;
    cart.push(product);
    saveCart(cart);
    return { added: true };
  }
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function updateCartCount() {
  const cartCountBadge = document.getElementById('cart-count');
  if (!cartCountBadge) return;

  const cartCount = getCartCount();
  cartCountBadge.textContent = cartCount > 999 ? '999+' : cartCount;
  cartCountBadge.setAttribute('data-count', cartCount);
}

function renderCart() {
const cart = getCart();
const list = document.getElementById('cart-list');
list.innerHTML = '';

if (cart.length === 0) {
  const empty = document.createElement('p');
  empty.textContent = 'Your cart is empty.';
  list.appendChild(empty);
  return;
}

cart.forEach((item, index) => {
  const li = document.createElement('md-list-item');
  li.type = 'text';

  // Headline: product description
  const head = document.createElement('a');
  head.slot = 'headline';
  head.href = `product.html?item=${item['Item No.']}`;
  head.textContent = item['Item Description'];
  li.append(head);

  // Supporting text: SKU
  const sup = document.createElement('div');
  sup.slot = 'supporting-text';
  sup.textContent = `SKU: ${item['Item No.']}`;
  li.append(sup);

  // Trailing text: quantity controls
  const trail = document.createElement('div');
  trail.slot = 'trailing-supporting-text';
  trail.innerHTML = `
    <button class="qty-btn" data-index="${index}" data-action="decrease">−</button>
    <span class="quantity">${item.quantity || 1}</span>
    <button class="qty-btn" data-index="${index}" data-action="increase">+</button>
  `;
  li.append(trail);

  // Remove button
  const removeBtn = document.createElement('md-icon-button');
  removeBtn.slot = 'end';
  removeBtn.classList.add('remove-btn');
  removeBtn.dataset.index = index;
  removeBtn.innerHTML = `<md-icon>delete</md-icon>`;
    li.append(removeBtn);

    list.append(li);
    if (index < cart.length - 1) {
      list.append(document.createElement('md-divider'));
    }
  });
}

// Handlers
function updateQuantity(index, action) {
  const cart = getCart();
  const qty = cart[index].quantity || 1;
  cart[index].quantity = action === 'increase' ? qty + 1 : Math.max(1, qty - 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  renderCart();
  updateCartCount();
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.pathname.endsWith('/cart.html')) return;

  updateCartCount();
  renderCart();

  const listEl = document.getElementById('cart-list');
  listEl.addEventListener('click', e => {
    // Quantity buttons
    const btn = e.target.closest('button.qty-btn');
    if (btn) {
      updateQuantity(+btn.dataset.index, btn.dataset.action);
      return;
    }
    // Remove icon button
    const rm = e.target.closest('md-icon-button.remove-btn');
    if (rm) {
      removeItem(+rm.dataset.index);
    }
  });

  const clearCartButton = document.getElementById('clear-cart');
  if (clearCartButton) {
    clearCartButton.addEventListener('click', () => {
      localStorage.removeItem('cart');

      updateCartCount();
      renderCart();
    });
  }

  const checkoutButton = document.getElementById('go-to-checkout');
  checkoutButton.addEventListener("click", async () => {
      const rawCart = localStorage.getItem("cart") || "[]";
      const cart = JSON.parse(rawCart);

      const items = cart.map(item => ({
        price_id: item["stripe_price_id"], 
        quantity: item.quantity
      }));

      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items })
      });

      const { client_secret: clientSecret, payment_intent_id: paymentIntentId } = await resp.json();

      sessionStorage.setItem("stripeClientSecret", clientSecret);
      sessionStorage.setItem("paymentIntentId", paymentIntentId);

      window.location.href = "https://aydinaksel.github.io/tile-auctions-website/";
  });
});
