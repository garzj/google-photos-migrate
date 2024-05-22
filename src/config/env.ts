interface Env {
  NODE_ENV: 'development' | 'production' | 'test';
}

const _env = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');
  dotenv.config({ processEnv: _env });
} catch {}
const env: Env = _env as Env;

env.NODE_ENV ??= 'production';

export { env };
