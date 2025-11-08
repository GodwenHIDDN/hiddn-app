import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Home from './pages/Home';
import CreatorDashboard from './pages/CreatorDashboard';
import CreatorForm from './pages/CreatorForm';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import Account from './pages/Account';
import About from './pages/About';
import Settings from './pages/account/Settings';
import Orders from './pages/account/Orders';
import Returns from './pages/account/Returns';
import Notifications from './pages/account/Notifications';
import Profile from './pages/account/Profile';
import Help from './pages/account/Help';
import AddressBook from './pages/account/AddressBook';
import Plus from './pages/account/Plus';
import Deals from './pages/account/Deals';
import Loyalty from './pages/account/Loyalty';
import Brands from './pages/account/Brands';
import Sizes from './pages/account/Sizes';
import FashionProfis from './pages/account/FashionProfis';
import RecommendationSettings from './pages/account/RecommendationSettings';
import CreatorSell from './pages/creator/Sell';
import CreatorHub from './pages/creator/CreatorHub';
import CreatorProfile from './pages/creator/CreatorProfile';
import CreatorPackages from './pages/creator/CreatorPackages';
import CreatorInsights from './pages/creator/CreatorInsights';
import Navbar from './components/Navbar';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import Onboarding from './pages/Onboarding';
import OnboardingLite from './pages/OnboardingLite';
import Shorts from './pages/Shorts';
import IconMaker from './pages/IconMaker';
import CreatorTest from './pages/CreatorTest';
import OrderSuccess from './pages/OrderSuccess';
import OrderCancel from './pages/OrderCancel';
import ErrorBoundary from './components/ErrorBoundary';

const CreatorPricing = lazy(() => import('./pages/CreatorPricing'));
const Products = lazy(() => import('./pages/Products'));
const BoardsPage = lazy(() => import('./pages/BoardsPage'));
const SpotlightPage = lazy(() => import('./pages/SpotlightPage'));
const WeeklyPage = lazy(() => import('./pages/WeeklyPage'));
const WeeklySubscribe = lazy(() => import('./pages/WeeklySubscribe'));
const Checkout = lazy(() => import('./pages/Checkout'));

function AnimatedRoutes() {
  const location = useLocation();
  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return false;
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch { return false; }
  });
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;
    let mql: MediaQueryList | null = null;
    try {
      mql = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
      mql.addEventListener('change', handler);
      return () => { try { mql && mql.removeEventListener('change', handler); } catch {} };
    } catch {}
  }, []);
  // Smooth scroll-to-top on route change (non-blocking)
  useEffect(() => {
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch { window.scrollTo(0,0); }
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        role="main"
        aria-live="polite"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
        transition={{ duration: reduceMotion ? 0.18 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{ background: 'var(--bg)' }}
      >
        <Suspense fallback={null}>
        <Routes location={location}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/onboarding-lite" element={<OnboardingLite />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/products/*" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/boards/:slug" element={<BoardsPage />} />
          <Route path="/spotlight/:slug" element={<SpotlightPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
          <Route path="/weekly/subscribe" element={<WeeklySubscribe />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route path="/creator/new" element={<CreatorForm />} />
          <Route path="/creator/edit/:id" element={<CreatorForm />} />
          <Route path="/checkout/*" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/shorts" element={<Shorts />} />
          <Route path="/creator-pricing" element={<CreatorPricing />} />
          <Route path="/icon" element={<IconMaker />} />
          <Route path="/creator-test" element={<CreatorTest />} />
          <Route path="/account/settings" element={<Settings />} />
          <Route path="/account/orders" element={<Orders />} />
          <Route path="/account/returns" element={<Returns />} />
          <Route path="/account/notifications" element={<Notifications />} />
          <Route path="/account/profile" element={<Profile />} />
          <Route path="/account/help" element={<Help />} />
          <Route path="/account/address-book" element={<AddressBook />} />
          {/* New entry routes */}
          <Route path="/plus" element={<Plus />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/creator" element={<CreatorHub />} />
          <Route path="/creator/sell" element={<CreatorSell />} />
          <Route path="/creator/profile" element={<CreatorProfile />} />
          <Route path="/creator/packages" element={<CreatorPackages />} />
          <Route path="/creator/insights" element={<CreatorInsights />} />
          <Route path="/account/deals" element={<Deals />} />
          <Route path="/loyalty" element={<Loyalty />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/sizes" element={<Sizes />} />
          <Route path="/fashion-profis" element={<FashionProfis />} />
          <Route path="/recommendation-settings" element={<RecommendationSettings />} />
          <Route path="/about" element={<About />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/success" element={<OrderSuccess />} />
          <Route path="/order/cancel" element={<OrderCancel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

const SPLASH_ENABLED = false; // temporarily disable splash to avoid gate on mobile
const REENTRY_ENABLED = false; // keep re-entry splash disabled

function Frame() {
  const location = useLocation();
  const navigate = useNavigate();
  const isOnboardingRoute = location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/onboarding-lite');
  const hideChrome = isOnboardingRoute || location.pathname.startsWith('/creator-pricing');
  const isCreatorPricing = location.pathname.startsWith('/creator-pricing');
  // Enforce deep-black background on creator routes
  useEffect(() => {
    const isCreatorRoute = location.pathname.startsWith('/creator-pricing') || location.pathname.startsWith('/creator/packages');
    const html = document.documentElement;
    const body = document.body;
    if (isCreatorRoute) {
      html.classList.add('deep-black');
      body.classList.add('deep-black');
    } else {
      html.classList.remove('deep-black');
      body.classList.remove('deep-black');
    }
    return () => {
      // cleanup on unmount
      html.classList.remove('deep-black');
      body.classList.remove('deep-black');
    };
  }, [location.pathname]);
  // gate: onboarding disabled per request
  useEffect(() => {
    return;
  }, [hideChrome, navigate]);
  return (
    <>
      {!hideChrome && <Header />}
      {hideChrome ? (
        <div style={{ height: '100dvh', width: '100vw', overflow: isCreatorPricing ? 'auto' : 'hidden', background: isCreatorPricing ? '#050608' : 'var(--bg)' }}>
          {/* For creator pricing we keep normal padding; for onboarding we render raw */}
          {isCreatorPricing ? (
            <>
              <div className="page-pad">
                <AnimatedRoutes />
              </div>
              <footer style={{ padding: '12px 16px 20px', textAlign: 'center', opacity: 0.5 }}>
                Echte Menschen. Echte Ideen. HIDDN.
              </footer>
            </>
          ) : (
            // Onboarding routes: no padding, no footer, pure full-screen
            <AnimatedRoutes />
          )}
        </div>
      ) : (
        <div
          className="app-scroll"
          style={{
            background:'var(--bg)',
            paddingTop: 8,
            paddingBottom: 'calc(56px + env(safe-area-inset-bottom))'
          }}
        >
          <div className="page-pad">
            <AnimatedRoutes />
          </div>
          <footer style={{ padding: '12px 16px 20px', textAlign: 'center', opacity: 0.5 }}>
            Echte Menschen. Echte Ideen. HIDDN.
          </footer>
        </div>
      )}
      {!hideChrome && <Navbar />}
    </>
  );
}

function App() {
  const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined;
  const noSplash = !!params && (params.get('nosplash') === '1' || params.get('safe') === '1');
  const [splashDone, setSplashDone] = useState(SPLASH_ENABLED ? noSplash : true);
  const [reentryDuration, setReentryDuration] = useState<number | undefined>(undefined);
  const lastShownRef = useRef<number>(Date.now());
  const [theme, setTheme] = useState<'light' | 'myst'>('light');
  const [activePack, setActivePack] = useState<null | { id: 'free'|'boost'|'premium'|'topbrand'|'partner'; expiresAt: number }>(null);
  // Load/apply theme and react to changes from Settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hiddn_theme') as 'light' | 'myst' | null;
      if (saved) setTheme(saved);
      else { localStorage.setItem('hiddn_theme', 'light'); setTheme('light'); }
    } catch {}
    const onTheme = () => {
      try {
        const t = (localStorage.getItem('hiddn_theme') as 'light' | 'myst') || 'light';
        setTheme(t);
      } catch {}
    };
    window.addEventListener('hiddn-theme', onTheme as EventListener);
    return () => window.removeEventListener('hiddn-theme', onTheme as EventListener);
  }, []);
  // Read active creator pack for subtle theme highlight
  useEffect(() => {
    const KEY = 'hiddn_creator_pack';
    const read = () => {
      try {
        const raw = localStorage.getItem(KEY);
        setActivePack(raw ? JSON.parse(raw) : null);
      } catch { setActivePack(null); }
    };
    read();
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);
  // No forced remounts to keep load smooth

  // Re-entry splash on app foreground with debounce (disabled)
  useEffect(() => {
    if (!SPLASH_ENABLED || !REENTRY_ENABLED) return;
    const onVis = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastShownRef.current > 30000) {
          lastShownRef.current = now;
          setReentryDuration(1200);
          setSplashDone(false);
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  // Emergency Safe Mode: hard bypass all routing/UI if ?safe=1
  if (params?.get('safe') === '1') {
    return (
      <div style={{ minHeight:'100vh', background:'#0a0a0b', color:'#fff', padding:'16px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <h1 className="font-display" style={{ fontSize: 22, marginBottom: 8 }}>HIDDN – Safe Mode</h1>
          <p style={{ opacity: 0.9, marginBottom: 12 }}>Minimaler Start ohne Router, Videos und Heavy‑UI.</p>
          <div style={{ border:'1px solid rgba(255,255,255,0.16)', borderRadius: 12, overflow:'hidden' }}>
            <img alt="Poster" src="https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&auto=format&fit=crop" style={{ width:'100%', height: 180, objectFit:'cover', display:'block' }} />
            <div style={{ padding: 12 }}>
              <div style={{ fontSize: 14, opacity: 0.9 }}>Navigation</div>
              <ul style={{ marginTop: 8, lineHeight: 1.8 }}>
                <li><a href="/categories?safe=1" style={{ color:'#9AE6B4', textDecoration:'underline' }}>Kategorien</a></li>
                <li><a href="/about?safe=1" style={{ color:'#9AE6B4', textDecoration:'underline' }}>About</a></li>
                <li><a href="/?novideo=1&safe=1" style={{ color:'#9AE6B4', textDecoration:'underline' }}>Home (Poster‑first)</a></li>
              </ul>
            </div>
          </div>
          <p style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>Wenn das hier sichtbar ist, rendert die App korrekt. Dann testen: Home mit Poster‑First (kein Video).</p>
        </div>
      </div>
    );
  }

  const packTone = (() => {
    if (!activePack || activePack.id === 'free') return null;
    if (activePack.id === 'boost') return 'rgba(34,211,238,0.35)'; // cyan
    if (activePack.id === 'premium' || activePack.id === 'partner') return 'rgba(255,215,0,0.35)'; // gold
    if (activePack.id === 'topbrand') return 'rgba(255,255,255,0.28)'; // subtle white gloss
    return null;
  })();

  return (
    <BrowserRouter>
      <ErrorBoundary>
        {SPLASH_ENABLED && !splashDone && (
          <SplashScreen
            onFinish={() => {
              setSplashDone(true);
              setReentryDuration(undefined);
            }}
            durationMs={reentryDuration}
          />
        )}
        <div
          className={`min-h-screen ${theme === 'myst' ? 'theme-myst' : ''}`}
          style={{ background:'#000', ...(packTone ? { boxShadow: `0 0 0 1px ${packTone.replace('0.35','0.35')}, 0 0 24px ${packTone.replace('0.35','0.18')}` } : {}) }}
        >
          <Frame />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
export default App;
