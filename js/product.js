import { addToCart, updateCartCount, getCart, saveCart } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  let product;
  let products;
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('item');

  const qtyEl = document.getElementById('cart-quantity');
  const incBtn = document.getElementById('increase-qty');
  const decBtn = document.getElementById('decrease-qty');
  const prevLink = document.getElementById('prev-product');
  const nextLink = document.getElementById('next-product');

  function currentQuantity() {
    const cart = getCart();
    const item = cart.find(p => p['Item No.'] === itemId);
    return item ? (item.quantity || 1) : 0;
  }

  function updateQtyDisplay(qty) {
    qtyEl.textContent = qty;
  }

  function changeQuantity(action) {
    const cart = getCart();
    const idx = cart.findIndex(p => p['Item No.'] === itemId);
    let qty = 0;

    if (idx === -1) {
      if (action === 'increase') {
        product.quantity = 1;
        cart.push(product);
        qty = 1;
      }
    } else {
      qty = cart[idx].quantity || 1;
      if (action === 'increase') {
        qty += 1;
        cart[idx].quantity = qty;
      } else {
        qty = Math.max(0, qty - 1);
        if (qty === 0) {
          cart.splice(idx, 1);
        } else {
          cart[idx].quantity = qty;
        }
      }
    }

    saveCart(cart);
    updateCartCount();
    updateQtyDisplay(qty);
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

      titleEl.textContent         = product["Item Description"];
      idEl.textContent            = product["Item No."];
      descEl.textContent          = product["Item Description"];
      stockQuantityEl.textContent = product["In Stock"];
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

      updateQtyDisplay(currentQuantity());

    })
    .catch(err => {
      console.error('Error loading product:', err);
      document.getElementById('product-title')
              .textContent = 'Error loading product';
    });

  const addToCartBtn = document.getElementById('add-to-cart');
  const feedback     = document.getElementById('cart-feedback');

  addToCartBtn.addEventListener('click', () => {
    if (!product) return;
    const result = addToCart(product);

    updateCartCount();
    updateQtyDisplay(currentQuantity());

    if (result.added) {
      feedback.textContent = '✅ Added to cart!';
    } else if (result.updated) {
      feedback.textContent = '➕ Quantity updated!';
    } else {
      feedback.textContent = 'Cart unchanged.';
    }

    setTimeout(() => feedback.textContent = '', 2000);
  });

  incBtn.addEventListener('click', () => {
    if (product) changeQuantity('increase');
  });

  decBtn.addEventListener('click', () => {
    if (product) changeQuantity('decrease');
  });
});

