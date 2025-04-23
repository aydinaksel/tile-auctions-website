fetch('data/products.json')
  .then(res => res.json())
  .then(products => {
    const container = document.querySelector('.product-carousel');
    const slider = document.getElementById('item-slider');

    products.forEach((product) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'product-container';

      //const name = document.createElement('div');
      //name.className = 'product-name';
      //name.textContent = product['Item Description'];

      const card = document.createElement('a');
      card.className = 'product-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('href', `product.html?item=${product["Item No."]}`);
      card.innerHTML = `
        <div class="product__wrapper">
          <div class="product-name">${product['Item Description']}</div>
          <span class="sku-overlay">${product['Item No.']}</span>
          <img src="images/${product['Item No.']}_720x720.webp"
               alt="${product['Item No.']}"
               onerror="this.onerror=null;this.src='images/placeholder.webp';">
          <md-filled-button>Add to Cart</md-filled-button>
        </div>
      `;

      //const button = document.createElement('md-filled-button');
      //button.textContent = 'Add to Cart';

      //wrapper.appendChild(name);
      wrapper.appendChild(card);
      //wrapper.appendChild(button);

      container.appendChild(wrapper);
    });

    const cards = document.querySelectorAll('.product-card');

    const updateSliderPages = () => {
      const itemWidth = cards[0]?.offsetWidth || 400;
      const containerWidth = container.offsetWidth;
      const itemsPerPage = Math.floor(containerWidth / itemWidth) || 1;
      const totalPages = Math.ceil(cards.length / itemsPerPage);

      slider.min = 0;
      slider.max = totalPages - 1;

      slider.oninput = () => {
        const scrollAmount = itemWidth * itemsPerPage;
        container.scrollTo({
          left: slider.value * scrollAmount,
          behavior: 'smooth',
        });
      };
    };

    updateSliderPages();
    window.addEventListener('resize', updateSliderPages);
  })
  .catch(err => {
    console.error('Error loading products:', err);
  });

document.getElementById('currentYear').textContent = new Date().getFullYear();

const toggleThemeButton = document.getElementById('toggle-theme');
const themeIcon = toggleThemeButton.querySelector('.material-symbols-outlined');

let currentTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', currentTheme);
themeIcon.textContent = currentTheme === 'dark' ? 'light_mode' : 'dark_mode';
toggleThemeButton.setAttribute('aria-label', currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode');

toggleThemeButton.onclick = () => {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);

  themeIcon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
  toggleThemeButton.setAttribute('aria-label', newTheme === 'dark' ? 'Light Mode' : 'Dark Mode');

  requestAnimationFrame(() => {
    localStorage.setItem('theme', newTheme);
  });
};
