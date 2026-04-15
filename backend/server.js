require('dotenv').config();
const express     = require('express');
const cors        = require('cors');
const rateLimit   = require('express-rate-limit');
const connectDB   = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

connectDB();

const app = express();

// ── CORS (manual headers — most reliable) ────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://studenthub2.vercel.app', 
];

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // ── Fix: Cross-Origin-Opener-Policy blocks Google Sign-In's postMessage ──
  // Without this header, the browser blocks window.postMessage from the Google
  // OAuth popup, causing the "COOP policy would block the window.postMessage"
  // console errors. 'same-origin-allow-popups' lets Google's popup communicate
  // back to our page while still providing reasonable security.
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,                             // raised: 100 auth attempts per 15 min per IP
  skip: (req) => req.method === 'OPTIONS',
  standardHeaders: true,               // returns RateLimit-* headers so the client knows
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests — please wait a few minutes and try again.' },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  skip: (req) => req.method === 'OPTIONS',
});

app.use('/api/auth', authLimiter);
app.use('/api',      apiLimiter);

app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

app.use('/api/auth',        require('./routes/auth'));
app.use('/api/students',    require('./routes/students'));
app.use('/api/attendance',  require('./routes/attendance'));
app.use('/api/results',     require('./routes/results'));
app.use('/api/notes',       require('./routes/notes'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/quiz',        require('./routes/quiz'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`));
