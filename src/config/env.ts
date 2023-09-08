try {
  const dotenv = require('dotenv');
  dotenv.config();
} catch {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

process.env.NODE_ENV ??= 'production';

export {};
