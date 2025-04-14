// Load products and populate homepage or product page
fetch('data/products.json')
  .then(res => res.json())
  .then(products => {
    if (document.getElementById('product-grid')) {
      // Homepage grid
      const grid = document.getElementById('product-grid');
      products.forEach(prod => {
        const box = document.createElement('div');
        box.className = 'product-box';
        box.innerHTML = `
          <h3>${prod["Item Description"]}</h3>
          <p><strong>Price:</strong> $${prod["Minimum Sales Price"]}</p>
          <p><strong>In Stock:</strong> ${prod["In Stock"]}</p>
          <p><strong>Size:</strong> ${prod["Item Description"].match(/\d+x\d+/) || 'N/A'}</p>
        `;
        box.onclick = () => {
          window.location.href = `product.html?item=${prod["Item No."]}`;
        };
        grid.appendChild(box);
      });
    }

    // Product detail page
    if (document.getElementById('product-detail')) {
      const urlParams = new URLSearchParams(window.location.search);
      const itemNo = urlParams.get('item');
      const product = products.find(p => p["Item No."] === itemNo);
      if (!product) return;

      const container = document.getElementById('product-detail');
      container.innerHTML = `
        <button class="back-btn" onclick="window.history.back()">← Back</button>
        <div class="product-image-section">
          <img src="images/${itemNo}.webp" alt="${product["Item Description"]}" onerror="this.src='images/placeholder.jpg'" />
        </div>
        <div class="product-info-section">
          <h2>${product["Item Description"]}</h2>
          <p><strong>Price:</strong> $${product["Minimum Sales Price"]}</p>
          <p><strong>Stock:</strong> ${product["In Stock"]}</p>
          <p><strong>Item No:</strong> ${itemNo}</p>
          <p><strong>Stock Type:</strong> ${product["Stock Type"]}</p>
          <p><strong>Units per Crate:</strong> ${product["Units per Crate"]}</p>
          <p><strong>Pieces per Crate:</strong> ${product["Pieces per Crate"]}</p>
          <p><strong>Barcode:</strong> ${product["Bar Code"]}</p>
          <button class="purchase-btn">Purchase</button>
        </div>
      `;
    }
  });

// Dark mode toggle logic
const toggleThemeButton = document.getElementById('toggle-theme');
const currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
toggleThemeButton.textContent = currentTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';

toggleThemeButton.onclick = () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  toggleThemeBtn.textContent = newTheme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode';
};
