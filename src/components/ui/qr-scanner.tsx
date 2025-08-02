import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsQR from 'jsqr';

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose, isOpen }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [isSupported, setIsSupported] = useState(true);

  // Verificar si el navegador soporta getUserMedia
  useEffect(() => {
    console.log('🔍 Verificando soporte de cámara...');
    console.log('navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('navigator.mediaDevices.getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    console.log('HTTPS:', window.location.protocol === 'https:');
    console.log('Localhost:', window.location.hostname === 'localhost');
    
    // Verificar soporte básico
    if (!navigator.mediaDevices) {
      console.log('❌ navigator.mediaDevices no está disponible');
      setIsSupported(false);
      setError('Tu navegador no soporta el acceso a la cámara (mediaDevices no disponible)');
      return;
    }
    
    if (!navigator.mediaDevices.getUserMedia) {
      console.log('❌ getUserMedia no está disponible');
      setIsSupported(false);
      setError('Tu navegador no soporta getUserMedia');
      return;
    }
    
    // Verificar si estamos en HTTPS o localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.log('❌ No estamos en HTTPS o localhost');
      setIsSupported(false);
      setError('La cámara requiere HTTPS (excepto en localhost)');
      return;
    }
    
    console.log('✅ Soporte de cámara verificado correctamente');
    setIsSupported(true);
  }, []);

  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      setError(null);
      console.log('🎥 Iniciando cámara...');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('La cámara no está disponible en este dispositivo');
      }

      // Intentar diferentes configuraciones de cámara
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      console.log('📹 Solicitando acceso a cámara con constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Acceso a cámara concedido');
      
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Esperar a que el video esté listo
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('📺 Video metadata cargado');
              resolve(true);
            };
            videoRef.current.onerror = () => {
              console.error('❌ Error en video element');
              resolve(false);
            };
          }
        });
        
        await videoRef.current.play();
        console.log('▶️ Video iniciado correctamente');
        setIsScanning(true);
        startQRDetection();
      }
    } catch (err) {
      console.error('❌ Error al iniciar cámara:', err);
      
      // Manejar errores específicos
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('Acceso a cámara denegado. Por favor, permite el acceso a la cámara.');
        } else if (err.name === 'NotFoundError') {
          setError('No se encontró ninguna cámara en el dispositivo.');
        } else if (err.name === 'NotSupportedError') {
          setError('La configuración de cámara no es soportada.');
        } else if (err.name === 'NotReadableError') {
          setError('La cámara está siendo usada por otra aplicación.');
        } else {
          setError(`Error al acceder a la cámara: ${err.message}`);
        }
      } else {
        setError('Error inesperado al acceder a la cámara');
      }
      
      setIsScanning(false);
    }
  };

  // Función para detener la cámara
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Función para cambiar entre cámara frontal y trasera
  const switchCamera = async () => {
    stopCamera();
    setFacingMode(facingMode === 'environment' ? 'user' : 'environment');
    setTimeout(() => startCamera(), 100);
  };

  // Función para detectar códigos QR usando jsQR
  const startQRDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scanFrame = () => {
      if (!isScanning || !video.videoWidth || !video.videoHeight) {
        if (isScanning) {
          requestAnimationFrame(scanFrame);
        }
        return;
      }

      // Configurar canvas
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar frame de video en canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Obtener datos de imagen
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Detectar QR usando jsQR
      detectQRCode(imageData);

      // Continuar escaneando
      requestAnimationFrame(scanFrame);
    };

    scanFrame();
  };

  // Función para detectar QR usando jsQR
  const detectQRCode = (imageData: ImageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        console.log('Código QR detectado:', code.data);
        onScan(code.data);
        stopCamera();
      }
    } catch (error) {
      console.error('Error al detectar QR:', error);
    }
  };

  // Efectos para manejar la apertura/cierre del escáner
  useEffect(() => {
    if (isOpen && isSupported) {
      startCamera();
    } else if (!isOpen) {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode, isSupported]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Escanear Código QR</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!isSupported ? (
            <div className="text-center space-y-4">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
              <p className="text-red-600 font-medium">Cámara no disponible</p>
              <p className="text-sm text-gray-600">
                Tu navegador no soporta el acceso a la cámara. 
                Puedes ingresar el código manualmente.
              </p>
              <Button onClick={onClose} className="w-full">
                Entendido
              </Button>
            </div>
          ) : (
            <>
              {/* Área de video */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  playsInline
                  muted
                />
                
                {/* Overlay de escaneo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white rounded-lg w-48 h-48 relative">
                    {/* Esquinas del marco de escaneo */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-blue-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-blue-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-blue-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-blue-500"></div>
                  </div>
                </div>

                {/* Canvas oculto para procesamiento */}
                <canvas
                  ref={canvasRef}
                  className="hidden"
                />
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                </div>
              )}

              {/* Controles */}
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchCamera}
                  disabled={!isScanning}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Cambiar Cámara
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    stopCamera();
                    startCamera();
                  }}
                  disabled={!isScanning}
                >
                  <Camera className="h-4 w-4 mr-1" />
                  Reiniciar
                </Button>
              </div>

              {/* Instrucciones */}
              <div className="text-center text-sm text-gray-600">
                <p>Coloca el código QR dentro del marco</p>
                <p className="text-xs mt-1">La cámara se activará automáticamente</p>
              </div>

              {/* Botón de cerrar */}
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
              >
                Cancelar
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner; 