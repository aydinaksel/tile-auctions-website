import { addToCart } from './cart.js';

let product; // Declare product in the outer scope

const params = new URLSearchParams(window.location.search);
const itemId = params.get('item');

fetch('data/products.json')
  .then(res => res.json())
  .then(products => {
    const product = products.find(p => p["Item No."] == itemId);

    if (!product) {
      document.getElementById('product-title').textContent = 'Product Not Found';
      return;
    }

    document.getElementById('product-title').textContent = product["Name"] || product["Item No."];
    document.getElementById('product-id').textContent = product["Item No."];
    document.getElementById('product-description').textContent = product["Description"] || "No description available.";
    document.getElementById('product-price').textContent = product["Price"] || "Contact us";

    const img = document.getElementById('product-image');
    img.src = `images/${product['Item No.']}_720x720.webp`;
    img.alt = product["Name"] || product["Item No."];
    img.onerror = () => img.src = 'images/placeholder.webp';
  })
  .catch(err => {
    console.error('Error loading product:', err);
    document.getElementById('product-title').textContent = 'Error loading product';
  });

const addToCartBtn = document.getElementById('add-to-cart');
const feedback = document.getElementById('cart-feedback');

addToCartBtn.addEventListener('click', () => {
  const result = addToCart(product);

  if (result.updated) {
    feedback.textContent = 'Quantity updated in cart!';
  } else if (result.added) {
    feedback.textContent = 'Added to cart!';
  }
});

document.getElementById('currentYear').textContent = new Date().getFullYear();
