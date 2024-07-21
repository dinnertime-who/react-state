// @ts-check

import { defineConfig } from 'tsup';
import { legacyConfig, modernConfig } from '../../scripts/tsup-config.js';

export default defineConfig([
  modernConfig({ entry: ['src/**/*.ts', 'src/**/*.tsx'] }),
  legacyConfig({ entry: ['src/**/*.ts', 'src/**/*.tsx'] }),
]);