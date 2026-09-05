import { qrcodegen } from './vendor/qrcodegen.js';
import { escapeHTML, safeURL } from './catalog.js';

// No remote QR service: the pixels encode the same official Apple link as the card.
export function createAppQR(url, name) {
  const destination = safeURL(url, ['apps.apple.com']);
  if (!destination || destination.length > 2048) throw new Error('Invalid App Store QR destination');
  const code = qrcodegen.QrCode.encodeText(destination, qrcodegen.QrCode.Ecc.MEDIUM);
  const border = 4; // Full four-module quiet zone on every side, never cropped or branded over.
  const size = code.size + border * 2;
  const modules = [];
  for (let y = 0; y < code.size; y++) {
    for (let x = 0; x < code.size; x++) {
      if (code.getModule(x, y)) modules.push(`M${x + border},${y + border}h1v1h-1z`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size * 4}" height="${size * 4}" role="img" aria-label="${escapeHTML(`QR code for ${name} on the App Store`)}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${modules.join('')}" fill="#000"/></svg>`;
}

export function setAppFlipped(card, flipped) {
  const front = card.querySelector('.app-front');
  const back = card.querySelector('.app-back');
  const show = card.querySelector('[data-show-qr]');
  const hide = card.querySelector('[data-hide-qr]');
  if (flipped) {
    const target = card.querySelector('[data-qr-image]');
    if (!target.firstElementChild) {
      target.innerHTML = createAppQR(card.querySelector('.app-primary-link').href, card.querySelector('h3').textContent);
    }
  }
  const active = flipped ? back : front;
  const inactive = flipped ? front : back;
  active.inert = false;
  active.removeAttribute('aria-hidden');
  show.setAttribute('aria-expanded', String(flipped));
  card.classList.toggle('is-flipped', flipped);
  // Move focus before hiding its former parent from assistive technology.
  (flipped ? hide : show).focus({ preventScroll: true });
  inactive.inert = true;
  inactive.setAttribute('aria-hidden', 'true');
}

export function enableAppFlips(grid, onInteract = () => {}) {
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-show-qr], [data-hide-qr]');
    if (!button || !grid.contains(button)) return;
    onInteract();
    setAppFlipped(button.closest('.app-card'), button.hasAttribute('data-show-qr'));
  });
  grid.addEventListener('keydown', event => {
    const card = event.target.closest('.app-card.is-flipped');
    if (event.key !== 'Escape' || !card) return;
    event.preventDefault();
    setAppFlipped(card, false);
  });
}
