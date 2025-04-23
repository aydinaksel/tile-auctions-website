export function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

export function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(p => p["Item No."] === product["Item No."]);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
    saveCart(cart);
    return { updated: true };
  } else {
    product.quantity = 1;
    cart.push(product);
    saveCart(cart);
    return { added: true };
  }
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
}
