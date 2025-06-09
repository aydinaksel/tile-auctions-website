const API_URL = "https://ix4l6l8y36.execute-api.eu-west-1.amazonaws.com/production/api/create-payment-intent";
let products = [];

export function loadProducts() {
  return fetch('data/products.json')
    .then(response => response.json())
    .then(data => { products = data; })
    .catch(error => console.error('Error loading product data:', error));
}

export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(p => p["Item No."] === product["Item No."]);

  const maxQty = parseInt(product["In Stock"], 10) || 0;
  if (maxQty <= 0) {
    // nothing to add if out of stock
    return { error: 'Out of stock' };
  }

  if (existing) {
    // bump straight to the maximum
    existing.quantity = maxQty;
    saveCart(cart);
    return { updated: true };
  } else {
    // add with full stock quantity
    product.quantity = maxQty;
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
  cartCountBadge.textContent = cartCount > 9999 ? '9999+' : cartCount;
  cartCountBadge.setAttribute('data-count', cartCount);
}

function renderCart() {
  const cart = getCart();
  const list = document.getElementById('cart-list');
  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = `<p>Your cart is empty.</p>`;
    return;
  }

  cart.forEach((item, index) => {
    const productData = products.find(p => p['Item No.'] === item['Item No.']);
    const stockQuantity = productData ? parseInt(productData['In Stock'], 10) : Infinity;

    const listItem = document.createElement('md-list-item');
    listItem.type = 'text';

    // Headline: product description
    const head = document.createElement('a');
    head.slot = 'headline';
    head.href = `product.html?item=${item['Item No.']}`;
    head.textContent = item['Item Description'];
    listItem.append(head);

    // Supporting text: SKU
    const sup = document.createElement('div');
    sup.slot = 'supporting-text';
    sup.textContent = `SKU: ${item['Item No.']}`;
    listItem.append(sup);

    const itemImage = document.createElement('img');
    itemImage.slot = 'start';
    itemImage.style = 'width: 56px';
    itemImage.src = `images/${item['Item No.']}_720x720.webp`;
    listItem.append(itemImage);

    const trail = document.createElement('div');
    trail.slot = 'trailing-supporting-text';
    const qtyField = document.createElement('md-outlined-text-field');
    qtyField.type = 'number';
    qtyField.min = '1';
    qtyField.max = String(stockQuantity);;
    qtyField.step = '1';
    qtyField.value = String(Math.min(item.quantity || 1, stockQuantity));
    qtyField.setAttribute('aria-label', 'Quantity');

    qtyField.addEventListener('change', e => {
      let newQty = parseInt(e.target.value, 10) || 1;
      if (newQty > stockQuantity) {
        newQty = stockQuantity;
        e.target.value = stockQuantity;

        // CHANGED: inline feedback
        const fb = document.createElement('div');
        fb.className = 'quantity-feedback';
        fb.textContent = `Only ${stockQuantity} in stock.`;
        listItem.append(fb);
        setTimeout(() => fb.remove(), 2000);
      }
      updateQuantity(index, newQty);
    });

    trail.append(qtyField);
    listItem.append(trail);

    const clearButton = document.createElement('md-icon-button');
    clearButton.slot = 'end';
    clearButton.classList.add('remove-btn');
    clearButton.dataset.index = index;
    clearButton.innerHTML = `<md-icon>delete</md-icon>`;
    listItem.append(clearButton);

    list.append(listItem);
    if (index < cart.length - 1) {
      list.append(document.createElement('md-divider'));
    }
  });
}

// Handlers
function updateQuantity(index, newQtyOrAction) {
  const cart = getCart();
  const current = cart[index].quantity || 1;

  cart[index].quantity = typeof newQtyOrAction === 'number'
    ? Math.max(1, newQtyOrAction)
    : (newQtyOrAction === 'increase' ? current + 1 : Math.max(1, current - 1));

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

document.addEventListener('DOMContentLoaded', async () => {
  if (!window.location.pathname.endsWith('/cart.html')) return;

  await loadProducts();
  updateCartCount();
  renderCart();

  const listEl = document.getElementById('cart-list');
  listEl.addEventListener('click', e => {
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

      window.location.href = "https://aydinaksel.github.io/tile-auctions-website/checkout.html";
  });
});
