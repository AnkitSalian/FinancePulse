import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import accountRoutes from './routes/accounts';
import budgetRoutes from './routes/budgets';
import dashboardRoutes from './routes/dashboard';
import pulseRoutes from './routes/pulse';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/pulse', pulseRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FinancePulse server running on port ${PORT}`);
});

export default app;
