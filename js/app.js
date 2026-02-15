import { setCurrentYear } from './utils.js';
import { updateCartCount } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  updateCartCount();
});

fetch('/api/products.json')
  .then(res => res.json())
  .then(data => {
    const products = data.products;
    const carousel = document.querySelector('.product-grid');
    const slider = document.getElementById('item-slider');

    products.forEach(product => {
      const item = document.createElement('div');
      item.className = 'product-grid__item';
      item.innerHTML = `
        <a href="product.html?item=${product['item_code']}" class="product-grid__item-content" tabindex="0">
          <div class="product-grid__item-image-wrapper">
            <img src="images/${product['item_code']}/processed/medium/${product['item_code']}.webp"
                 alt="${product['item_name']}"
                 onerror="this.onerror=null; this.src='images/placeholder.webp';"
                 class="product-grid__item-image">

            <div class="product-grid__item-top-left">
              <div class="product-grid__item-sku">${product['item_code']}</div>
            </div>

            <div class="product-grid__item-top-right">
              <div class="product-grid__item-name">${product['item_name']}</div>
              <div class="product-grid__item-name">Length by Width: ${product['item_length_by_width']}</div>
              <div class="product-grid__item-name">Thickness: ${product['item_thickness']}</div>
              <div class="product-grid__item-name">UoM: ${product['unit_of_measurement']}</div>
              <div class="product-grid__item-name">Quantity in Stock: ${product['available_quantity']}</div>
              <div class="product-grid__item-name">Price per Unit: $${product['item_price']}</div>
            </div>
          </div>
        </a>
      `;
      carousel.appendChild(item);
    });
 })
 .catch(err => console.error('Error loading products:', err));

const toggleButton = document.getElementById('toggle-theme');
const icon = toggleButton.querySelector('.material-symbols-outlined');
let theme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
toggleButton.setAttribute('aria-label', theme === 'dark' ? 'Light Mode' : 'Dark Mode');

toggleButton.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  icon.textContent = theme === 'dark' ? 'light_mode' : 'dark_mode';
  toggleButton.setAttribute('aria-label', theme === 'dark' ? 'Light Mode' : 'Dark Mode');
  localStorage.setItem('theme', theme);
});
