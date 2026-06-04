const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorHandler = require('./middleware/errorHandler');
const configureStaticFiles = require('./utils/staticFiles');

// Routes
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const assessmentRoutes = require('./routes/assessment');
const recommendationRoutes = require('./routes/recommendations');
const enterpriseRoutes = require('./routes/enterprises');
const vacancyRoutes = require('./routes/vacancies');
const tourRoutes = require('./routes/tours');
const applicationRoutes = require('./routes/applications');
const enterprisePrivateRoutes = require('./routes/enterprise');
const adminRoutes = require('./routes/admin');
const messageRoutes = require('./routes/messages');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: env.frontendUrl,
  credentials: true,
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
configureStaticFiles(app);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// API routes
const apiPrefix = '/api/v1';

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/profile`, profileRoutes);
app.use(`${apiPrefix}/assessment`, assessmentRoutes);
app.use(`${apiPrefix}/recommendations`, recommendationRoutes);
app.use(`${apiPrefix}/enterprises`, enterpriseRoutes);
app.use(`${apiPrefix}/vacancies`, vacancyRoutes);
app.use(`${apiPrefix}/tours`, tourRoutes);
app.use(`${apiPrefix}/applications`, applicationRoutes);
app.use(`${apiPrefix}/enterprise`, enterprisePrivateRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/messages`, messageRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use(errorHandler);

module.exports = app;
