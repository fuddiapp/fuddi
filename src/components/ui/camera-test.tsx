import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

const CameraTest: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Verificar soporte
    console.log('🔍 Verificando soporte de cámara...');
    console.log('navigator.mediaDevices:', !!navigator.mediaDevices);
    console.log('navigator.mediaDevices.getUserMedia:', !!navigator.mediaDevices?.getUserMedia);
    console.log('HTTPS:', window.location.protocol === 'https:');
    console.log('Localhost:', window.location.hostname === 'localhost');
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      setError('Navegador no soporta getUserMedia');
      return;
    }
    
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setIsSupported(false);
      setError('Requiere HTTPS (excepto localhost)');
      return;
    }
    
    setIsSupported(true);
  }, []);

  const startCamera = async () => {
    try {
      setError(null);
      console.log('🎥 Iniciando cámara de prueba...');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsStreaming(true);
        console.log('✅ Cámara iniciada correctamente');
      }
    } catch (err) {
      console.error('❌ Error en cámara de prueba:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  if (isSupported === null) {
    return <div>Verificando soporte...</div>;
  }

  if (isSupported === false) {
    return (
      <div className="p-4 border rounded">
        <h3 className="font-bold text-red-600">Cámara no soportada</h3>
        <p className="text-sm text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded space-y-4">
      <h3 className="font-bold text-green-600">Cámara soportada ✅</h3>
      
      <div className="space-y-2">
        <Button 
          onClick={isStreaming ? stopCamera : startCamera}
          variant={isStreaming ? "destructive" : "default"}
        >
          <Camera className="h-4 w-4 mr-2" />
          {isStreaming ? 'Detener Cámara' : 'Iniciar Cámara'}
        </Button>
        
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
      
      {isStreaming && (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-48 object-cover rounded border"
            playsInline
            muted
          />
        </div>
      )}
    </div>
  );
};

export default CameraTest; 