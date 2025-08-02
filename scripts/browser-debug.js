// Script para ejecutar en la consola del navegador (F12 → Console)
// Copia y pega este código en la consola del navegador

console.log('🔍 Debuggeando desde el navegador...');
console.log('=' .repeat(60));

// 1. Verificar autenticación
console.log('\n🔐 Verificando autenticación...');
const userData = localStorage.getItem('fuddi-user');
if (userData) {
  try {
    const user = JSON.parse(userData);
    console.log('   ✅ Usuario autenticado:', user);
  } catch (error) {
    console.log('   ❌ Error al parsear datos del usuario:', error);
  }
} else {
  console.log('   ❌ No hay usuario autenticado');
}

// 2. Verificar localStorage
console.log('\n📋 Verificando localStorage...');
const localStorageKeys = Object.keys(localStorage);
console.log('   📊 Claves en localStorage:', localStorageKeys);

// Buscar claves relacionadas con menús
const menuKeys = localStorageKeys.filter(key => 
  key.toLowerCase().includes('menu') || 
  key.toLowerCase().includes('fuddi')
);
console.log('   📊 Claves relacionadas con menús:', menuKeys);

// 3. Verificar datos de menús en localStorage
console.log('\n📋 Verificando datos de menús en localStorage...');
menuKeys.forEach(key => {
  const data = localStorage.getItem(key);
  console.log(`   📊 ${key}:`, data);
});

// 4. Verificar si hay acceso al objeto supabase
console.log('\n📋 Verificando acceso a Supabase...');
if (typeof window.supabase !== 'undefined') {
  console.log('   ✅ Objeto supabase disponible');
  
  // Intentar consultar menús directamente
  console.log('\n📋 Consultando menús desde el navegador...');
  
  const today = new Date().toISOString().split('T')[0];
  console.log('   📅 Fecha actual:', today);
  
  // Consulta del dashboard
  window.supabase
    .from('menus_dia')
    .select('*')
    .eq('menu_date', today)
    .then(({ data, error }) => {
      if (error) {
        console.log('   ❌ Error en consulta del dashboard:', error);
      } else {
        console.log(`   📊 Menús del dashboard: ${data?.length || 0}`);
        if (data && data.length > 0) {
          data.forEach((menu, index) => {
            console.log(`      ${index + 1}. ${menu.nombre_menu || 'Sin nombre'} - ${menu.menu_date} (${menu.dia})`);
          });
        }
      }
    });
    
  // Consulta sin filtros
  window.supabase
    .from('menus_dia')
    .select('*')
    .then(({ data, error }) => {
      if (error) {
        console.log('   ❌ Error en consulta sin filtros:', error);
      } else {
        console.log(`   📊 Todos los menús: ${data?.length || 0}`);
        if (data && data.length > 0) {
          data.forEach((menu, index) => {
            console.log(`      ${index + 1}. ${menu.nombre_menu || 'Sin nombre'} - ${menu.menu_date} (${menu.dia})`);
          });
        }
      }
    });
    
} else {
  console.log('   ❌ Objeto supabase no disponible');
  console.log('   💡 Esto puede indicar que la aplicación no está cargada correctamente');
}

// 5. Verificar estado de la aplicación
console.log('\n📋 Verificando estado de la aplicación...');
console.log('   📊 URL actual:', window.location.href);
console.log('   📊 Título de la página:', document.title);

// 6. Buscar elementos de menús en el DOM
console.log('\n📋 Verificando elementos de menús en el DOM...');
const menuElements = document.querySelectorAll('[class*="menu"], [id*="menu"]');
console.log(`   📊 Elementos con "menu" en clase o ID: ${menuElements.length}`);

// 7. Instrucciones para limpiar caché
console.log('\n💡 Instrucciones para limpiar caché:');
console.log('   1. Ejecuta: localStorage.clear(); sessionStorage.clear();');
console.log('   2. Recarga la página: window.location.reload(true);');
console.log('   3. O usa el botón "Actualizar" en el dashboard');

// 8. Función para limpiar caché
window.clearFuddiCache = function() {
  console.log('🧹 Limpiando caché de Fuddi...');
  localStorage.clear();
  sessionStorage.clear();
  console.log('✅ Caché limpiada');
  console.log('🔄 Recargando página...');
  window.location.reload(true);
};

console.log('\n🎯 Para limpiar caché, ejecuta: clearFuddiCache()');
console.log('🎯 Debug completado'); 