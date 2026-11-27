#!/usr/bin/env node
// Führt alle Tests einschließlich der Template-Tests aus. Nur für das Template selbst gedacht.
import { spawnSync } from 'node:child_process';

const ergebnis = spawnSync(process.execPath, ['--test', 'tools/**/*.test.mjs'], {
  stdio: 'inherit',
  env: { ...process.env, TEMPLATE_PRUEFUNG: '1' },
});
process.exit(ergebnis.status ?? 1);
