const { execSync } = require('node:child_process');

function isLinuxX64() {
  return process.platform === 'linux' && process.arch === 'x64';
}

function hasNativeRollup() {
  try {
    require.resolve('@rollup/rollup-linux-x64-gnu');
    return true;
  } catch {
    return false;
  }
}

function getRollupVersion() {
  try {
    return require('rollup/package.json').version;
  } catch {
    return '';
  }
}

if (!isLinuxX64() || hasNativeRollup()) {
  process.exit(0);
}

const rollupVersion = getRollupVersion();

if (!rollupVersion) {
  console.warn('No se pudo detectar la version de Rollup. Se omite la reparacion nativa.');
  process.exit(0);
}

console.log(`Instalando @rollup/rollup-linux-x64-gnu@${rollupVersion} para este build...`);
execSync(`npm install --no-save --no-package-lock @rollup/rollup-linux-x64-gnu@${rollupVersion}`, {
  stdio: 'inherit',
});
