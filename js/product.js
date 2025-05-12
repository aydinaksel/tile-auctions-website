document.addEventListener('DOMContentLoaded', () => {
  let product;
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('item');

  fetch('data/products.json')
    .then(res => res.json())
    .then(products => {
      product = products.find(p => p["Item No."] === itemId);

      const titleEl = document.getElementById('product-title');
      const idEl    = document.getElementById('product-id');
      const descEl  = document.getElementById('product-description');
      const priceEl = document.getElementById('product-price');
      const stockQuantityEl = document.getElementById('product-stock-quantity');
      const groupEl = document.getElementById('product-group');
      const img     = document.getElementById('product-image');

      if (!product) {
        titleEl.textContent = 'Product Not Found';
        return;
      }

      titleEl.textContent = product["Item Description"];
      idEl.textContent    = product["Item No."];
      descEl.textContent  = product["Item Description"];
      stockQuantityEl.textContent  = product["In Stock"];
      descEl.textContent  = product["Item Description"];
      groupEl.textContent = product["Item Group"];
      priceEl.textContent = product["U Base Price"] != null
        ? `$${product["U Base Price"].toFixed(2)}`
        : 'Contact us';

      img.src = `images/${product['Item No.']}_720x720.webp`;
      img.alt = product["Item Description"];
      img.onerror = () => img.src = 'images/placeholder.webp';

      // Footer year
      document.getElementById('currentYear').textContent = new Date().getFullYear();
    })
    .catch(err => {
      console.error('Error loading product:', err);
      document.getElementById('product-title').textContent = 'Error loading product';
    });

  const addToCartBtn = document.getElementById('add-to-cart');
  const feedback     = document.getElementById('cart-feedback');

  addToCartBtn.addEventListener('click', () => {
    if (!product) return;
    const result = addToCart(product);
    feedback.textContent = result.updated
      ? 'Quantity updated in cart!'
      : result.added
        ? 'Added to cart!'
        : 'Cart unchanged.';
  });
});
