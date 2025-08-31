// ******************************************* Imports *********************************************
import dotenv from "dotenv";
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { verifyRequest } from './utils/requestFunction.js';
import { verifyJWTToken } from './utils/jwtFunction.js';
import constVariable from './utils/constantVariables.js';
import connectDB from "./config/database.js"
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables
dotenv.config();

// Import routes
import providerRoutes from './routes/providerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import twilioRoutes from './routes/twilioRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import promptRoutes from './routes/promptRoutes.js';
import uploadMediaRoutes from './routes/uploadMediaRoutes.js';
import { seedInitialData } from './utils/seed.js';

import { errorHandler } from "./middelware/errorHandler.js";
import uploadRoutes from './routes/uploadRoutes.js';
import { initSocket } from './realtime/socket.js'

// ******************************************* Config *********************************************

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// CORS configuration (permissive in development)
const isProd = (process.env.NODE_ENV === 'production');
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow non-browser or same-origin
    if (!isProd) return callback(null, true); // allow all in dev
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Kustom Server API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/providers', providerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/twilio', twilioRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/uploads', uploadMediaRoutes);
app.use('/uploads', express.static('uploads'))

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

const server = http.createServer(app);

// ******************************************* Routes **********************************************

const PORT = process.env.PORT || 3000;

connectDB().then(async () => {
  try {
    if (process.env.SEED_DEFAULTS === 'true') {
      await seedInitialData();
      console.log('Default seed completed');
    }
  } catch (e) { console.error('Seed failed:', e); }
  // Initialize Socket.IO
  initSocket(server, { origin: allowedOrigins })
  server.listen(PORT, () => {
    console.log(`
              #####################################################
              🛡️  Kustom Server API is available on port ${PORT} 🛡️
              #####################################################
            `);
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
});