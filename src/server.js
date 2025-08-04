// ******************************************* Imports *********************************************
// import dotenv from "dotenv";
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
import providerRoutes from './routes/providerRoutes.js';
import { errorHandler } from "./middelware/errorHandler.js";
// ******************************************* Config *********************************************

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Error handler
app.use(errorHandler);

const server = http.createServer(app);

app.use(cors({ origin: 'http://localhost:5173' }));

app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));


// Routes
app.use('/api/providers', providerRoutes);

// ******************************************* Routes **********************************************

// const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  server.listen(3001, () => {
    console.log(`
              #####################################################
              🛡️  Kustom Server API is available on port 3001 🛡️
              #####################################################
            `);
  });
}).catch((err) => {
  console.error("Database connection failed:", err);
});