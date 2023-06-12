import * as dotenv from 'dotenv';
dotenv.config();

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

process.env.NODE_ENV ??= 'production';
