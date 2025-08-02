# Configuración del Bucket de Storage de Supabase

Este documento explica cómo configurar el bucket de storage de Supabase necesario para que las promociones funcionen correctamente.

## Problema

Si ves el error "No se pudo configurar el bucket de promociones", significa que el bucket de storage no está configurado correctamente en tu proyecto de Supabase.

## Solución

### Opción 1: Script Automatizado (Recomendado)

Ejecuta el script de configuración:

```bash
npm run setup-storage
```

Este script te guiará paso a paso para configurar el bucket.

### Opción 2: Configuración Manual

#### Paso 1: Acceder al Dashboard de Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **Storage**

#### Paso 2: Crear el Bucket

1. Haz clic en **"Create a new bucket"**
2. Configura el bucket con estos parámetros:
   - **Name**: `promotions`
   - **Public bucket**: ✅ Activado
   - **File size limit**: `5MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/gif`
3. Haz clic en **"Create bucket"**

#### Paso 3: Configurar Políticas de Seguridad

Después de crear el bucket, ejecuta este comando para aplicar las políticas de seguridad:

```bash
supabase db push
```

Esto aplicará las siguientes políticas:
- Permitir subir archivos al bucket de promociones
- Permitir ver archivos del bucket de promociones
- Permitir actualizar archivos del bucket de promociones
- Permitir eliminar archivos del bucket de promociones

## Verificación

Para verificar que todo está configurado correctamente:

1. Intenta crear una nueva promoción con una imagen
2. Si no hay errores, el bucket está configurado correctamente
3. Si ves la alerta de configuración de storage, sigue los pasos anteriores

## Estructura del Bucket

Los archivos se almacenarán en la siguiente estructura:

```
promotions/
├── [uuid1].jpg
├── [uuid2].png
└── [uuid3].webp
```

Cada archivo tendrá un nombre único generado automáticamente.

## Troubleshooting

### Error: "Bucket already exists"

Si ves este error, significa que el bucket ya existe pero puede tener configuraciones incorrectas:

1. Ve al dashboard de Supabase
2. Navega a Storage
3. Encuentra el bucket "promotions"
4. Verifica que esté configurado como público
5. Verifica los tipos MIME permitidos

### Error: "Permission denied"

Si ves errores de permisos:

1. Verifica que las políticas de RLS estén habilitadas
2. Ejecuta `supabase db push` para aplicar las políticas
3. Verifica que el bucket sea público

### Error: "File size limit exceeded"

Si ves este error:

1. Ve al dashboard de Supabase
2. Navega a Storage
3. Selecciona el bucket "promotions"
4. Aumenta el límite de tamaño de archivo a 5MB o más

## Configuración Avanzada

### Tipos de Archivo Permitidos

Los siguientes tipos de archivo están permitidos:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/gif`

### Límite de Tamaño

El límite predeterminado es 5MB por archivo. Puedes ajustarlo en el dashboard de Supabase.

### Políticas de Seguridad

Las políticas permiten:
- Subir archivos (INSERT)
- Ver archivos (SELECT)
- Actualizar archivos (UPDATE)
- Eliminar archivos (DELETE)

Todas las operaciones son públicas para el bucket de promociones.

## Soporte

Si tienes problemas con la configuración:

1. Verifica que tu proyecto de Supabase esté activo
2. Verifica que tengas permisos de administrador
3. Revisa los logs de la consola del navegador para más detalles
4. Contacta al soporte técnico si el problema persiste 