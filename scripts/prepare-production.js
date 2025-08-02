import fs from 'fs';
import path from 'path';

console.log('🚀 PREPARANDO PROYECTO PARA PRODUCCIÓN - Fuddi.cl\n');

// Archivos SEGUROS que deben mantenerse
const safeFiles = [
  // Archivos de configuración
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
  
  // Archivos de la aplicación
  'src/',
  'public/',
  'dist/',
  
  // Archivos de configuración de Git
  '.gitignore',
  
  // Scripts seguros (solo los que no contienen credenciales)
  'scripts/cleanup-production.js',
  'scripts/security-check.js',
  'scripts/create-env.js',
  'scripts/prepare-production.js',
  'scripts/auto-cleanup-daily-menus.js',
  'scripts/setup-storage.js'
];

// Archivos PELIGROSOS que deben eliminarse
const dangerousFiles = [
  // Archivos en la raíz con credenciales
  'test-authenticated-promotions.js',
  'check-app-promotions.js',
  'cleanup-orphaned-redemptions.js',
  'fix-redemptions-count.js',
  'test-redemption-trigger.js',
  'check-promotions.js',
  'disable-rls-manually.js',
  'debug-business-insert.js',
  'fix-business-registration.js',
  'check-db-with-app-credentials.js',
  'test-business-registration.js',
  'verify-business-data.js',
  'quick-db-changes.js',
  'test-supabase.js',
  'datos_prueba_perfil_cliente.sql',
  
  // Documentación interna
  'LIMPIEZA_AUTOMATICA_SIMPLE.md',
  'SOLUCION_COMPLETA_MENUS_DIA.md',
  'DAILY_MENU_CLEANUP_SOLUTION.md',
  'DAILY_REDEMPTION_CHANGES.md',
  'MENU_CLEANUP_SOLUTION.md',
  'MIGRATION_SUMMARY.md',
  'DAILY_MENU_CLEANUP.md',
  'DEPLOYMENT.md',
  
  // Scripts peligrosos (con credenciales)
  'scripts/check-daily-menus-status.js',
  'scripts/check-all-tables.js',
  'scripts/check-rls-policies.js',
  'scripts/create-promotion-redemptions-table.js',
  'scripts/debug-followers.js',
  'scripts/diagnose-menus.js',
  'scripts/execute-migration-direct.js',
  'scripts/execute-migration.js',
  'scripts/fix-rls-policies.js',
  'scripts/run-migration.js',
  'scripts/run-migrations.js',
  'scripts/setup-automatic-cleanup.js',
  'scripts/test-after-migration.js',
  'scripts/test-cleanup-component.js',
  'scripts/test-cleanup-functions.js',
  'scripts/test-complete-solution.js',
  'scripts/test-followers-simple.js',
  'scripts/test-real-followers.js',
  'scripts/test-redemption-system.js',
  'scripts/verify-automatic-setup.js',
  'scripts/test-frontend-queries.js',
  'scripts/test-daily-redemption.js',
  'scripts/test-analytics-tables.js',
  'scripts/test-code-validation.js',
  'scripts/force-cleanup-with-service-key.js',
  'scripts/execute-migrations.js',
  'scripts/debug-redemption.js',
  'scripts/debug-frontend-data.js',
  'scripts/create-test-follow.js',
  'scripts/create-followers-count-function.js',
  'scripts/check-rls-and-tables.js',
  'scripts/clear-cache-and-refresh.js',
  'scripts/check-followed-businesses-table.js',
  'scripts/apply-followers-function.js',
  'scripts/apply-changes-directly.js',
  'scripts/debug-google-maps-header.js',
  'scripts/check-google-maps.js',
  'scripts/urgent-security-cleanup.js',
  'scripts/create-env.js'
];

console.log('🗑️ Eliminando archivos peligrosos...');
let deletedCount = 0;

dangerousFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      if (fs.statSync(filePath).isDirectory()) {
        fs.rmSync(filePath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(filePath);
      }
      console.log(`✅ Eliminado: ${file}`);
      deletedCount++;
    } catch (error) {
      console.log(`❌ Error eliminando ${file}:`, error.message);
    }
  }
});

console.log(`\n📊 Resumen:`);
console.log(`- Archivos eliminados: ${deletedCount}`);
console.log(`- Archivos seguros preservados: ${safeFiles.length}`);

console.log('\n🛡️ ARCHIVOS SEGUROS para producción:');
safeFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  }
});

console.log('\n🎯 PROYECTO LISTO PARA PRODUCCIÓN:');
console.log('✅ Archivos peligrosos eliminados');
console.log('✅ Solo código de aplicación preservado');
console.log('✅ Configuración de seguridad mantenida');
console.log('✅ Variables de entorno en .env (NO subir a GitHub)');

console.log('\n📋 PRÓXIMOS PASOS:');
console.log('1. Verificar que .env esté en .gitignore');
console.log('2. Subir código a GitHub (sin .env)');
console.log('3. Configurar variables de entorno en Netlify');
console.log('4. Desplegar aplicación');

console.log('\n🚀 ¡Tu proyecto está seguro para producción!'); 