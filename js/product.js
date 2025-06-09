import { addToCart, updateCartCount, getCart, saveCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  let product;
  let products;
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('item');

  const qtyField = document.getElementById('cart-quantity-field');
  const feedback = document.getElementById('cart-feedback');
  const prevLink = document.getElementById('prev-product');
  const nextLink = document.getElementById('next-product');

  function currentQuantity() {
    const cart = getCart();
    const item = cart.find(p => p['Item No.'] === itemId);
    return item ? (item.quantity || 1) : 0;
  }

  function setProductQuantity(newQty) {
    const cart = getCart();
    const idx  = cart.findIndex(p => p['Item No.'] === itemId);

    if (newQty <= 0) {
      if (idx !== -1) cart.splice(idx, 1);
    } else {
      if (idx === -1) {
        product.quantity = newQty;
        cart.push(product);
      } else {
        cart[idx].quantity = newQty;
      }
    }

    saveCart(cart);
    updateCartCount();
  }

  fetch('data/products.json')
    .then(res => res.json())
    .then(data => {
      products = data;
      product = products.find(p => p["Item No."] === itemId);

      const titleEl            = document.getElementById('product-title');
      const idEl               = document.getElementById('product-id');
      const descEl             = document.getElementById('product-description');
      const priceEl            = document.getElementById('product-price');
      const stockQuantityEl    = document.getElementById('product-stock-quantity');
      const groupEl            = document.getElementById('product-group');
      const img                = document.getElementById('product-image');

      if (!product) {
        titleEl.textContent = 'Product Not Found';
        return;
      }

      const stockQty = parseInt(product["In Stock"], 10);

      titleEl.textContent         = product["Item Description"];
      idEl.textContent            = product["Item No."];
      descEl.textContent          = product["Item Description"];
      stockQuantityEl.textContent = stockQty;
      groupEl.textContent         = product["Item Group"];
      priceEl.textContent = product["U Base Price"] != null
        ? `$${product["U Base Price"].toFixed(2)}`
        : 'Contact us';

      img.src    = `images/${product['Item No.']}_720x720.webp`;
      img.alt    = product["Item Description"];
      img.onerror = () => img.src = 'images/placeholder.webp';

      const index = products.findIndex(p => p['Item No.'] === itemId);
      if (index > 0) {
        prevLink.href = `product.html?item=${products[index - 1]['Item No.']}`;
      } else {
        prevLink.style.visibility = 'hidden';
      }
      if (index < products.length - 1) {
        nextLink.href = `product.html?item=${products[index + 1]['Item No.']}`;
      } else {
        nextLink.style.visibility = 'hidden';
      }


      qtyField.setAttribute('min', '0');
      qtyField.setAttribute('max', stockQty);
      const initialQuantity = currentQuantity()

      qtyField.value = Math.min(initialQuantity, stockQty);
    })
    .catch(err => {
      console.error('Error loading product:', err);
      document.getElementById('product-title')
              .textContent = 'Error loading product';
    });

  const addToCartBtn = document.getElementById('add-to-cart');

  addToCartBtn.addEventListener('click', () => {
    if (!product) return;
    addToCart(product);
    updateCartCount();
    const cart = getCart();
    const item = cart.find(p => p['Item No.'] === product['Item No.']);
    qtyField.value = item ? item.quantity : 0;

    // 4) clear any feedback in 2s
    setTimeout(() => feedback.textContent = '', 2000);
  });

  qtyField.addEventListener('input', e => {
    let val = parseInt(e.target.value, 10) || 0;
    const max = parseInt(e.target.max, 10);

    if (val > max) {
      // snap it back
      val = max;
      e.target.value = max;
      feedback.textContent = `Only ${max} in stock.`;
      setTimeout(() => feedback.textContent = '', 2000);
    }

    setProductQuantity(val);
  });
});

