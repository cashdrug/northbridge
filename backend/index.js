import express from 'express';
import cors from 'cors';
import session from 'express-session';
import pool from './db.js';
import router from './routes/users.routes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { exportToHTML } from './controllers/panel-admin.js';
import { authenticateAdmin, checkSession, logoutAdmin } from './middleware/auth.js';
import 'dotenv/config';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security Middleware (be careful)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "/api/placeholder"],
      connectSrc: ["'self'", "https://ipapi.co", "https://ip-api.com"],
    }
  },
    frameguard: {
    action: 'deny'
  },
  referrerPolicy: {
    policy: 'strict-origin-when-cross-origin'
  },

  noSniff: true,
  xssFilter: true,
  hidePoweredBy: true
}));

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(cookieParser());

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'northbridge.sid',
  proxy: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  }
}));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const requiredEnvVars = ['SESSION_SECRET', 'ADMIN_PASSWORD', 'DB_USER', 'DB_HOST', 'DB_NAME', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

// Rate limiting for admin routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per 15 minutes
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api', apiLimiter);

app.use(express.static(path.join(__dirname, '../frontend'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1d' : 0,
  etag: true,
  lastModified: true
}));

// Route handlers
app.get(['/', '/index.html'], (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/privacy-policy.html'));
});

app.get('/terms-of-use', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/terms-of-use.html'));
});

app.get('/admin-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin-login.html'));
});

app.post("/admin-login",
  apiLimiter,
  (req, res) => {
    authenticateAdmin(req, res, () => {
      res.json({ success: true });
    });
  }
);

app.get('/admin-logout', checkSession, logoutAdmin);
app.post('/admin-logout', checkSession, logoutAdmin);

app.get('/admin', checkSession, (req, res) => {
  exportToHTML(req, res);
});

// Health check endpoint for production monitoring
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// User routes
app.use('/api', router);

// Error Handling
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.url} from IP: ${req.ip}`);
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Server error:', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

app.listen(PORT, () =>
  console.log(`App started on ${PORT}`)
);