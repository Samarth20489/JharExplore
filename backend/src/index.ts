import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { env } from './config/env';
import { logger } from './config/logger';

const PORT = env.PORT;

app.listen(PORT, () => {
  logger.info(`🚀 JharExplore API server running on port ${PORT}`);
  logger.info(`📍 Environment: ${env.NODE_ENV}`);
  logger.info(`🌐 API Base: http://localhost:${PORT}/api/v1`);
});
