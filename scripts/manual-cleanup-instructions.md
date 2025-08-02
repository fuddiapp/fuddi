# Instrucciones para Limpiar Manualmente la Caché

## 🔍 Problema Identificado

Los menús del día que ves en el frontend están en **caché del navegador**, no en la base de datos. Por eso:
- Los scripts no pueden ver los datos (no están autenticados)
- Los menús antiguos siguen apareciendo
- La eliminación manual no funciona correctamente

## 🛠️ Solución Manual

### Opción 1: Desde la Consola del Navegador

1. **Abre las herramientas de desarrollador** (F12)
2. **Ve a la pestaña "Console"**
3. **Ejecuta estos comandos uno por uno:**

```javascript
// 1. Verificar qué hay en localStorage
console.log('LocalStorage actual:', localStorage);

// 2. Limpiar datos relacionados con menús
localStorage.removeItem('fuddi-menus');
localStorage.removeItem('fuddi-user');
localStorage.removeItem('fuddi-business');
localStorage.removeItem('fuddi-daily-menus');

// 3. Limpiar sessionStorage
sessionStorage.clear();

// 4. Verificar que se limpió
console.log('LocalStorage después de limpiar:', localStorage);

// 5. Forzar recarga completa
window.location.reload(true);
```

### Opción 2: Desde las Herramientas de Desarrollador

1. **Abre las herramientas de desarrollador** (F12)
2. **Ve a la pestaña "Application"** (o "Aplicación")
3. **En el panel izquierdo, busca "Storage"**
4. **Limpia cada sección:**
   - **Local Storage** → Click derecho → Clear
   - **Session Storage** → Click derecho → Clear
   - **IndexedDB** → Click derecho → Clear
5. **Recarga la página** con Ctrl+F5

### Opción 3: Recarga Completa del Navegador

1. **Cierra completamente el navegador**
2. **Abre el navegador nuevamente**
3. **Ve a la aplicación**
4. **Usa el botón "Actualizar"** en el dashboard

## 🔧 Verificación

Después de limpiar la caché:

1. **Verifica que no hay menús antiguos** en el dashboard
2. **Usa el botón "Actualizar"** si es necesario
3. **Crea un nuevo menú** para verificar que funciona correctamente

## 🚨 Si el Problema Persiste

Si después de limpiar la caché sigues viendo menús antiguos:

1. **Verifica que estás en la página correcta** (http://localhost:8080)
2. **Asegúrate de que limpiaste toda la caché**
3. **Intenta en modo incógnito** para verificar
4. **Contacta al desarrollador** con los logs de la consola

## 📝 Logs Útiles

Para debuggear, ejecuta en la consola:

```javascript
// Verificar datos de Supabase en el frontend
console.log('Supabase client:', window.supabase);

// Verificar estado de autenticación
console.log('Usuario actual:', localStorage.getItem('fuddi-user'));

// Verificar menús en caché
console.log('Menús en caché:', localStorage.getItem('fuddi-menus'));
```

## 🎯 Resultado Esperado

Después de la limpieza:
- ✅ No verás menús de días anteriores
- ✅ El dashboard se actualizará automáticamente
- ✅ Solo se mostrarán menús del día actual
- ✅ La eliminación manual funcionará correctamente 