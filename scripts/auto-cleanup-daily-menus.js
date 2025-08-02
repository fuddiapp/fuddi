import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Función principal para limpiar automáticamente los menús del día expirados
 */
async function autoCleanupDailyMenus() {
  try {
    console.log('🧹 Iniciando limpieza automática de menús del día...');
    
    // Obtener la fecha actual
    const today = new Date().toISOString().split('T')[0];
    console.log(`📅 Fecha actual: ${today}`);
    
    // Obtener todos los menús que no son de la fecha actual
    const { data: oldMenus, error: fetchError } = await supabase
      .from('menus_dia')
      .select('id, menu_date, nombre_menu, business_id, dia')
      .neq('menu_date', today);

    if (fetchError) {
      console.error('❌ Error al obtener menús antiguos:', fetchError);
      return;
    }

    if (!oldMenus || oldMenus.length === 0) {
      console.log('✅ No hay menús antiguos para eliminar');
      return;
    }

    console.log(`📊 Encontrados ${oldMenus.length} menús antiguos:`);
    oldMenus.forEach(menu => {
      console.log(`   - ID: ${menu.id}, Fecha: ${menu.menu_date}, Día: ${menu.dia}, Nombre: ${menu.nombre_menu || 'Sin nombre'}`);
    });

    // Eliminar los menús antiguos
    const { error: deleteError } = await supabase
      .from('menus_dia')
      .delete()
      .neq('menu_date', today);

    if (deleteError) {
      console.error('❌ Error al eliminar menús antiguos:', deleteError);
      return;
    }

    console.log(`✅ Se eliminaron ${oldMenus.length} menús antiguos exitosamente`);
    
    // También limpiar reservas antiguas
    await cleanupOldReservations();
    
    console.log('🎉 Limpieza automática completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza automática:', error);
  }
}

/**
 * Función para limpiar reservas antiguas
 */
async function cleanupOldReservations() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Obtener reservas antiguas
    const { data: oldReservations, error: fetchError } = await supabase
      .from('menu_reservations')
      .select('id, reservation_date, menu_name, client_name')
      .neq('reservation_date', today);

    if (fetchError) {
      console.error('❌ Error al obtener reservas antiguas:', fetchError);
      return;
    }

    if (!oldReservations || oldReservations.length === 0) {
      console.log('✅ No hay reservas antiguas para eliminar');
      return;
    }

    console.log(`📊 Encontradas ${oldReservations.length} reservas antiguas`);

    // Eliminar las reservas antiguas
    const { error: deleteError } = await supabase
      .from('menu_reservations')
      .delete()
      .neq('reservation_date', today);

    if (deleteError) {
      console.error('❌ Error al eliminar reservas antiguas:', deleteError);
      return;
    }

    console.log(`✅ Se eliminaron ${oldReservations.length} reservas antiguas exitosamente`);
    
  } catch (error) {
    console.error('❌ Error durante la limpieza de reservas:', error);
  }
}

/**
 * Función para verificar el estado de los menús
 */
async function checkMenuStatus() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    console.log('\n📋 Estado actual de los menús:');
    
    // Contar menús actuales
    const { count: currentMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true })
      .eq('menu_date', today);
    
    // Contar menús totales
    const { count: totalMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true });
    
    // Contar menús expirados
    const { count: expiredMenus } = await supabase
      .from('menus_dia')
      .select('*', { count: 'exact', head: true })
      .neq('menu_date', today);
    
    console.log(`   - Menús vigentes hoy: ${currentMenus || 0}`);
    console.log(`   - Menús totales: ${totalMenus || 0}`);
    console.log(`   - Menús expirados: ${expiredMenus || 0}`);
    
    if (expiredMenus > 0) {
      console.log('⚠️  Hay menús expirados que deberían ser eliminados');
    } else {
      console.log('✅ No hay menús expirados');
    }
    
  } catch (error) {
    console.error('❌ Error al verificar estado de menús:', error);
  }
}

// Ejecutar la función principal
async function main() {
  console.log('🚀 Iniciando script de limpieza automática de menús del día');
  console.log('=' .repeat(60));
  
  // Verificar estado antes de la limpieza
  await checkMenuStatus();
  
  console.log('\n' + '=' .repeat(60));
  
  // Ejecutar limpieza
  await autoCleanupDailyMenus();
  
  console.log('\n' + '=' .repeat(60));
  
  // Verificar estado después de la limpieza
  await checkMenuStatus();
  
  console.log('\n✨ Script completado');
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { autoCleanupDailyMenus, cleanupOldReservations, checkMenuStatus }; 