import fs from 'fs';
import path from 'path';

function showMigration(migrationFile) {
  try {
    console.log(`📄 Migración: ${migrationFile}`);
    console.log('='.repeat(80));
    
    const sql = fs.readFileSync(migrationFile, 'utf8');
    console.log(sql);
    console.log('='.repeat(80));
    console.log('');
    
    return true;
  } catch (error) {
    console.error(`Error leyendo migración ${migrationFile}:`, error.message);
    return false;
  }
}

function showMigrations() {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const migrationFiles = [
    '20250724000000_create_menu_reservations_table.sql',
    '20250724010000_add_allow_reservations_to_menus_dia.sql'
  ];
  
  console.log('🚀 MIGRACIONES PENDIENTES');
  console.log('');
  console.log('📝 INSTRUCCIONES:');
  console.log('1. Ve a: https://supabase.com/dashboard/project/kroclpxgulgrezbxjhnt/sql');
  console.log('2. Copia y pega cada migración en el SQL Editor');
  console.log('3. Ejecuta cada migración en orden');
  console.log('4. Verifica que las tablas se crearon correctamente');
  console.log('');
  console.log('🔗 Enlace directo al SQL Editor:');
  console.log('https://supabase.com/dashboard/project/kroclpxgulgrezbxjhnt/sql');
  console.log('');
  
  for (const migrationFile of migrationFiles) {
    const filePath = path.join(migrationsDir, migrationFile);
    if (fs.existsSync(filePath)) {
      showMigration(filePath);
    } else {
      console.error(`❌ Archivo de migración no encontrado: ${migrationFile}`);
    }
  }
  
  console.log('✅ Después de ejecutar las migraciones:');
  console.log('   - Los menús se podrán crear sin errores 400');
  console.log('   - El switch de reservas funcionará');
  console.log('   - El sistema de reservas estará activo');
  console.log('   - Los clientes podrán reservar menús');
  console.log('   - Los negocios verán las reservas en su dashboard');
}

showMigrations(); 