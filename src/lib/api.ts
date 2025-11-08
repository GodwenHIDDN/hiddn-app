import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const MOCK = String(import.meta.env.VITE_MOCK_MODE).toLowerCase() === 'true';

export const api = axios.create({ baseURL });

export function setAuthToken(token?: string) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('access_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('access_token');
  }
}

const existing = localStorage.getItem('access_token');
if (existing) setAuthToken(existing);

// Mock store
type Product = { id: string; title: string; price_cents: number; currency: string; image_url?: string };
type CartItem = { product_id: string; qty: number; size?: string };
type Cart = { items: CartItem[] };

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback; } catch { return fallback; }
}
function save<T>(key: string, v: T) { localStorage.setItem(key, JSON.stringify(v)); }

// Seed defaults in mock mode
if (MOCK) {
  const seeded = load<Product[]>('mock_products', []);
  if (seeded.length === 0) {
    const demo: Product[] = [
      { id: 'p1', title: 'HIDDN Logo Tee', price_cents: 1999, currency: 'EUR', image_url: 'https://picsum.photos/id/100/600/600' },
      { id: 'p2', title: 'HIDDN Hoodie', price_cents: 4999, currency: 'EUR', image_url: 'https://picsum.photos/id/101/600/600' },
      { id: 'p3', title: 'Cap Classic', price_cents: 2499, currency: 'EUR', image_url: 'https://picsum.photos/id/102/600/600' },
    ];
    save('mock_products', demo);
  }
  if (!localStorage.getItem('mock_cart')) save<Cart>('mock_cart', { items: [] });
}

// Public helpers that switch between real and mock
export async function login(email: string, password: string): Promise<{ access_token: string }>
{ if (!MOCK) { const r = await api.post('/api/v1/auth/login', { email, password }); return r.data; }
  const token = 'mock-token'; setAuthToken(token); return { access_token: token }; }

export async function getProducts(): Promise<Product[]> {
  if (!MOCK) { const r = await api.get('/api/v1/products'); return r.data; }
  return load<Product[]>('mock_products', []);
}

export async function createProduct(p: { title: string; price_cents: number; currency: string }): Promise<void> {
  if (!MOCK) { await api.post('/api/v1/products', p); return; }
  const items = load<Product[]>('mock_products', []);
  const id = 'p' + (items.length + 1);
  items.push({ id, ...p });
  save('mock_products', items);
}

export async function addToCart(product_id: string, qty = 1, size = 'M'): Promise<void> {
  if (!MOCK) { await api.post('/api/v1/cart', { product_id, qty, size }); return; }
  const cart = load<Cart>('mock_cart', { items: [] });
  cart.items.push({ product_id, qty, size });
  save('mock_cart', cart);
}

export async function getCart(): Promise<Cart> {
  if (!MOCK) { const r = await api.get('/api/v1/cart'); return r.data; }
  return load<Cart>('mock_cart', { items: [] });
}

export async function checkout(): Promise<any> {
  if (!MOCK) { const r = await api.post('/api/v1/checkout', {
    shipping_address: { line1: 'Teststr. 1', city: 'Berlin', postal_code: '10115', country: 'DE' },
    payment_method: { type: 'stripe_card', method_id: 'pm_123' },
  }); return r.data; }
  return { client_secret: 'mock_secret_123', payment_intent_id: 'pi_mock_123' };
}
