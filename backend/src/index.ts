import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

import path from 'path';
import kebayaRoutes from './routes/kebaya';
import customerRoutes from './routes/customer';
import rentalRoutes from './routes/rental';
import eventRoutes from './routes/event';
import dashboardRoutes from './routes/dashboard';
import reportsRoutes from './routes/reports';
import configRoutes from './routes/config';
import auditRoutes from './routes/audit';
import { startCronJobs } from './cron';

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../../public/uploads')));

app.use('/api/kebayas', kebayaRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/config', configRoutes);
app.use('/api/audit', auditRoutes);

startCronJobs();

// Database Connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kebaya-linda';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.send('Kebaya Linda API is running');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
