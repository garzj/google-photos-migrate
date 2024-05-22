interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
}

const env: Env = process.env as object as Env;

env.NODE_ENV ??= 'production';

export { env };
