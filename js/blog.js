import { setCurrentYear } from './utils.js';
import { updateCartCount } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  updateCartCount();
});
