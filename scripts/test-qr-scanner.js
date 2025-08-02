import jsQR from 'jsqr';

console.log('🧪 Probando librería jsQR...');

// Crear datos de imagen simulados (esto es solo para verificar que la librería se importa correctamente)
const testImageData = {
  data: new Uint8ClampedArray(100 * 100 * 4), // 100x100 imagen RGBA
  width: 100,
  height: 100
};

try {
  // Intentar usar jsQR (esto debería funcionar sin errores)
  const result = jsQR(testImageData.data, testImageData.width, testImageData.height);
  
  if (result === null) {
    console.log('✅ jsQR funciona correctamente (no detectó QR en imagen de prueba, lo cual es esperado)');
  } else {
    console.log('✅ jsQR detectó un código QR:', result.data);
  }
  
  console.log('🎉 La librería jsQR está lista para usar en el escáner QR');
} catch (error) {
  console.error('❌ Error con jsQR:', error);
} 