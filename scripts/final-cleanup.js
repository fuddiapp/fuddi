import fs from 'fs';
import path from 'path';

console.log('🧹 LIMPIEZA FINAL ANTES DE SUBIR A GITHUB\n');

// Archivos que deben eliminarse completamente
const filesToDelete = [
  // Archivos .env y relacionados
  '.env',
  '.env.local',
  '.env.bak',
  '.env.backup',
  '.env.temp',
  '.env.template',
  
  // Scripts con credenciales sensibles
  'scripts/check-menu-reservations.js',
  'scripts/check-promotions.js',
  'scripts/check-redemptions-data.js',
  'scripts/check-database-status.js',
  'scripts/check-redemptions-simple.js',
  'scripts/create-simple-test-data.js',
  'scripts/cleanup-old-reservations.js',
  'scripts/clean-old-menus.js',
  'scripts/cleanup-now.js',
  'scripts/migrate-followed-businesses.js',
  'scripts/update-menu-reservations-table.js',
  'scripts/test-reservations-display.js',
  'scripts/test-reservation.js',
  'scripts/test-menu-cleanup.js',
  'scripts/test-followers-count.js',
  'scripts/setup-migration.js',
  'scripts/run-migration-with-password.js',
  'scripts/run-migration-simple.js',
  'scripts/generate-client-test-data.js',
  'scripts/execute-cleanup-now.js',
  'scripts/disable-rls-temporarily.js',
  'scripts/debug-client-data.js',
  'scripts/create-test-data.js',
  'scripts/create-test-data-simple.js',
  'scripts/create-test-data-fixed.js',
  'scripts/create-test-reservation.js',
  'scripts/urgent-security-cleanup.js',
  'scripts/final-cleanup.js',
  
  // Archivos de documentación interna
  'LIMPIEZA_AUTOMATICA_SIMPLE.md',
  'SOLUCION_COMPLETA_MENUS_DIA.md',
  'DAILY_MENU_CLEANUP_SOLUTION.md',
  'DAILY_REDEMPTION_CHANGES.md',
  'MENU_CLEANUP_SOLUTION.md',
  'MIGRATION_SUMMARY.md',
  'DAILY_MENU_CLEANUP.md'
];

console.log('🗑️ Eliminando archivos sensibles...');
let deletedCount = 0;

filesToDelete.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Eliminado: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`❌ Error eliminando ${file}:`, error.message);
    }
  }
});

// Verificar que no queden archivos .env
console.log('\n🔍 Verificando que no queden archivos .env...');
const envFiles = ['.env', '.env.local', '.env.bak', '.env.backup', '.env.temp'];
envFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`❌ ADVERTENCIA: ${file} aún existe - ELIMÍNALO MANUALMENTE`);
  } else {
    console.log(`✅ ${file} no existe (correcto)`);
  }
});

console.log(`\n📊 Resumen:`);
console.log(`- Archivos eliminados: ${deletedCount}`);
console.log(`- Archivos .env verificados: ${envFiles.length}`);

console.log('\n🛡️ ARCHIVOS SEGUROS para subir a GitHub:');
const safeFiles = [
  'src/',
  'public/',
  'package.json',
  'package-lock.json',
  'vite.config.ts',
  'tsconfig.json',
  'tsconfig.app.json',
  'tsconfig.node.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'eslint.config.js',
  'components.json',
  'index.html',
  'README.md',
  'netlify.toml',
  'env.example',
  '.gitignore',
  'scripts/auto-cleanup-daily-menus.js',
  'scripts/setup-storage.js'
];

safeFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  }
});

console.log('\n🎯 INSTRUCCIONES PARA SUBIR A GITHUB:');
console.log('1. ✅ Verifica que NO haya archivos .env en la carpeta');
console.log('2. ✅ Abre GitHub.com y crea un nuevo repositorio');
console.log('3. ✅ Arrastra la carpeta Fuddi.cl completa');
console.log('4. ✅ Verifica que solo se suban los archivos seguros');

console.log('\n🚨 IMPORTANTE:');
console.log('- NO subas archivos .env bajo ninguna circunstancia');
console.log('- Si ves archivos .env, elimínalos manualmente antes de subir');
console.log('- Solo sube el código de la aplicación, no scripts de desarrollo');

console.log('\n🚀 ¡Tu proyecto está listo para subir a GitHub!'); 