import { addToCart, updateCartCount, getCart, saveCart } from './cart.js';

const FIELDS = [
  { key: 'item_code', label: 'SKU' },
  { key: 'item_name', label: 'Description' },
  { key: 'item_material_group', label: 'Item Group' },
  { key: 'item_length_by_width', label: 'Length × Width' },
  { key: 'item_thickness', label: 'Thickness' },
  { key: 'unit_of_measurement', label: 'Unit of Measurement' },
  { key: 'item_country_of_origin', label: 'Country of Origin' },
  { key: 'available_quantity', label: 'Stock Quantity' },
  { key: 'item_price', label: 'Price' },
];

function renderDetailTable(tableId, product) {
  console.log('Rendering detail table for:', product);
  const tbody = document.querySelector(`#${tableId} tbody`);
  const frag = document.createDocumentFragment();
  FIELDS.forEach(({ key, label }) => {
    const tr = document.createElement('tr');
    const value = product[key] ?? 'N/A';
    tr.innerHTML = `
      <th scope="row">${label}:</th>
      <td>${value}</td>
    `;
    frag.appendChild(tr);
  });
  tbody.replaceChildren(frag);
}

function currentQuantity(itemId) {
  const cart = getCart();
  console.log(`Current cart contents:`, cart);
  const entry = cart.find(p => p.item_code === itemId);
  return entry ? entry.quantity : 0;
}

function setProductQuantity(product, newQuantity) {
  console.log(`Setting quantity for ${product.item_code} to`, newQuantity);
  const cart = getCart();
  const index = cart.findIndex(p => p.item_code === product.item_code);
  if (newQuantity <= 0) {
    if (index !== -1) {
      console.log('Removing product from cart');
      cart.splice(index, 1);
    }
  } else {
    if (index === -1) {
      console.log('Adding new product to cart with qty', newQuantity);
      product.quantity = newQuantity;
      cart.push(product);
    } else {
      console.log('Updating existing product qty to', newQuantity);
      cart[index].quantity = newQuantity;
    }
  }
  saveCart(cart);
  updateCartCount();
  console.log('Cart after update:', cart);
}

async function loadProduct(itemId) {
  console.log('loadProduct() called with', itemId);
  try {
    const response = await fetch("/api/products.json");
    console.log('Fetched /api/products.json, status:', response.status);
    const data = await response.json();
    console.log('JSON parsed:', data);
    const product = data.products.find(p => p.item_code === itemId);
    console.log('Found product:', product);
    if (!product) {
      document.getElementById("product-title").textContent = "Product Not Found";
      return null;
    }
    return product;
  } catch (err) {
    console.error("Error loading product:", err);
    document.getElementById("product-title").textContent = "Error loading product";
    return null;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM fully loaded');
  updateCartCount();

  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('item');
  console.log('URL item parameter:', itemId);
  if (!itemId) {
    document.getElementById('product-title').textContent = 'Invalid product ID';
    return;
  }

  let products = [];
  let product = null;

  try {
    console.log('Fetching products list...');
    const response = await fetch("/api/products.json");
    console.log('Products fetch status:', response.status);
    const data = await response.json();
    console.log('Products JSON:', data);
    products = data.products;
    console.log('Total products:', products.length);
    product = products.find(p => p.item_code === itemId);
    console.log('Matched product:', product);
    if (!product) {
      document.getElementById("product-title").textContent = "Product Not Found";
      return;
    }
  } catch (err) {
    console.error("Error loading product:", err);
    document.getElementById("product-title").textContent = "Error loading product";
    return;
  }

  renderDetailTable('product-info', product);

  console.log('Setting page title to:', product.item_name);
  document.getElementById('product-title').textContent = product.item_name;

  const img = document.getElementById('product-image');
  img.src = `images/${product.item_code}/processed/medium/${product.item_code}.webp`;
  img.alt = product.item_name;
  img.onerror = () => { 
    console.warn('Image load failed, using placeholder');
    img.src = 'images/placeholder.webp'; 
  };

  // Prev/Next navigation
  const index = products.findIndex(p => p.item_code === itemId);
  console.log('Current product index in list:', index);
  const prevLink = document.getElementById('prev-product');
  const nextLink = document.getElementById('next-product');
  if (index > 0) {
    prevLink.href = `product.html?item=${products[index - 1].item_code}`;
    console.log('Prev link set to', prevLink.href);
  } else {
    prevLink.style.visibility = 'hidden';
    console.log('No prev product; hiding prev link');
  }
  if (index < products.length - 1) {
    nextLink.href = `product.html?item=${products[index + 1].item_code}`;
    console.log('Next link set to', nextLink.href);
  } else {
    nextLink.style.visibility = 'hidden';
    console.log('No next product; hiding next link');
  }

  // Quantity controls
  const qtyField = document.getElementById('cart-quantity-field');
  const feedback = document.getElementById('cart-feedback');
  qtyField.max = product.available_quantity;
  console.log('Max quantity set to', qtyField.max);
  const initialQty = currentQuantity(itemId);
  qtyField.value = Math.min(initialQty, product.available_quantity);
  console.log('Initial qty field value:', qtyField.value);

  // Add to cart
  document.getElementById('add-to-cart').addEventListener('click', () => {
    console.log('Add to cart clicked');
    addToCart(product);
    updateCartCount();
    const updatedQty = currentQuantity(itemId);
    qtyField.value = updatedQty;
    console.log('Quantity after add:', updatedQty);
    setTimeout(() => { feedback.textContent = ''; }, 2000);
  });

  // Quantity input
  qtyField.addEventListener('input', (e) => {
    console.log('Quantity input changed to', e.target.value);
    let val = parseInt(e.target.value, 10) || 0;
    const max = parseInt(e.target.max, 10);
    if (val > max) {
      val = max;
      e.target.value = max;
      feedback.textContent = `Only ${max} in stock.`;
      console.log(`User tried to exceed stock; reset to ${max}`);
      setTimeout(() => { feedback.textContent = ''; }, 2000);
    }
    setProductQuantity(product, val);
  });
});
