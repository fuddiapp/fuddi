import fs from 'fs';
import path from 'path';

const filesToRemove = [
  // Archivos en la raíz con credenciales hardcodeadas
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
  
  // Archivos de documentación
  'LIMPIEZA_AUTOMATICA_SIMPLE.md',
  'SOLUCION_COMPLETA_MENUS_DIA.md',
  'DAILY_MENU_CLEANUP_SOLUTION.md',
  'DAILY_REDEMPTION_CHANGES.md',
  'MENU_CLEANUP_SOLUTION.md',
  'MIGRATION_SUMMARY.md',
  'DAILY_MENU_CLEANUP.md',
  
  // Scripts con credenciales sensibles
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
  'scripts/urgent-security-cleanup.js'
];

console.log('🧹 Limpiando archivos de desarrollo...');

filesToRemove.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Eliminado: ${file}`);
    } catch (error) {
      console.log(`❌ Error eliminando ${file}:`, error.message);
    }
  } else {
    console.log(`⚠️ No encontrado: ${file}`);
  }
});

console.log('✅ Limpieza completada'); 