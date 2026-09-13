const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.route');
const devisRoutes = require('./modules/devis/devis.route');
const dashboardRoutes = require('./modules/dashboard/dashboard.route');
const notFound = require('./middlewares/notFound.middleware');
const errorHandler = require('./middlewares/errorHandler.middleware');

const app = express();

// Nécessaire derrière un reverse proxy (nginx) pour que req.ip et le
// rate-limiter voient la vraie IP du visiteur, pas celle du proxy.
app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
if (env.env !== 'test') app.use(morgan(env.env === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/devis', devisRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
