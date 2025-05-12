fetch('../data/products.json')
  .then(res => res.json())
  .then(products => {
    const carousel = document.querySelector('.product-grid');
    const slider = document.getElementById('item-slider');

    products.forEach(product => {
      const item = document.createElement('div');
      item.className = 'product-grid__item';
      item.innerHTML = `
        <a href="product.html?item=${product['Item No.']}" class="product-grid__item-content" tabindex="0">
          <div class="product-grid__item-image-wrapper">
            <img src="../images/${product['Item No.']}_720x720.webp"
                 alt="${product['Item Description']}"
                 onerror="this.onerror=null; this.src='../images/placeholder.webp';"
                 class="product-grid__item-image">
            <div class="product-grid__item-sku">${product['Item No.']}</div>
            <div class="product-grid__item-name">${product['Item Description']}</div>
          </div>
          <button class="button product-grid__item-button">Add to Cart</button>
        </a>
      `;
      carousel.appendChild(item);
    });
 })
 .catch(err => console.error('Error loading products:', err));

// Update footer year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Theme toggle
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
