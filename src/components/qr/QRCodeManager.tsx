
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Eye, EyeOff, Copy, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QRCodeData {
  id: string;
  business_id: string;
  qr_code_data: string;
  four_digit_code: string;
  status: string;
  created_at: string;
}

const QRCodeManager = () => {
  const [currentQrCode, setCurrentQrCode] = useState<QRCodeData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Obtener el ID del negocio del usuario autenticado
  const getBusinessId = () => {
    if (!user || user.type !== 'business') {
      throw new Error('Usuario no autorizado o no es un negocio');
    }
    return user.id;
  };

  const generateFourDigitCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const businessId = getBusinessId();
      
      // Primero, desactivar cualquier código QR activo existente para este negocio
      if (currentQrCode) {
        await supabase
          .from('business_qr_codes')
          .update({ status: 'inactive' })
          .eq('business_id', businessId)
          .eq('status', 'active');
      }
      
      const fourDigitCode = generateFourDigitCode();
      
      // Crear los datos del código QR (URL que redirigiría a la app móvil)
      const qrCodeData = `https://fuddi.app/redeem/${businessId}/${fourDigitCode}`;

      const { data, error } = await supabase
        .from('business_qr_codes')
        .insert({
          business_id: businessId,
          qr_code_data: qrCodeData,
          four_digit_code: fourDigitCode,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Error al insertar código QR:', error);
        throw new Error(`Error al generar código QR: ${error.message}`);
      }

      setCurrentQrCode(data);
      setShowConfirmDialog(false);
      
      // Abrir el código QR en una nueva pestaña después de la generación
      setTimeout(() => viewQRCodeInNewTab(data), 500);
      
      toast({
        title: "¡Código QR Generado!",
        description: "Tu nuevo código QR ha sido creado y se ha abierto en una nueva pestaña.",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo generar el código QR. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentQRCode = async () => {
    try {
      const businessId = getBusinessId();
      const { data, error } = await supabase
        .from('business_qr_codes')
        .select('*')
        .eq('business_id', businessId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error al cargar código QR:', error);
        throw error;
      }
      
      setCurrentQrCode(data);
    } catch (error) {
      console.error('Error loading QR code:', error);
      // No mostrar error si simplemente no hay códigos activos
    }
  };

  React.useEffect(() => {
    if (user && user.type === 'business') {
    loadCurrentQRCode();
    }
  }, [user]);

  const toggleCodeVisibility = () => {
    setShowCode(prev => !prev);
  };

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
      toast({
        title: "¡Código Copiado!",
        description: "El código de 4 dígitos ha sido copiado al portapapeles.",
      });
    } catch (error) {
      toast({
        title: "Error al Copiar",
        description: "No se pudo copiar el código al portapapeles.",
        variant: "destructive"
      });
    }
  };

  const downloadQRCode = (qrCode: QRCodeData) => {
    const svg = document.getElementById(`qr-${qrCode.id}`) as any;
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const link = document.createElement('a');
        link.download = `QR-Code-${qrCode.four_digit_code}.png`;
        link.href = canvas.toDataURL();
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const deactivateQRCode = async () => {
    if (!currentQrCode) return;
    
    try {
      const { error } = await supabase
        .from('business_qr_codes')
        .update({ status: 'inactive' })
        .eq('id', currentQrCode.id);

      if (error) throw error;

      setCurrentQrCode(null);

      toast({
        title: "Código QR Desactivado",
        description: "El código QR ha sido desactivado exitosamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo desactivar el código QR.",
        variant: "destructive"
      });
    }
  };

  const viewQRCodeInNewTab = (qrCode: QRCodeData) => {
    const newWindow = window.open('', '_blank', 'width=600,height=700,scrollbars=yes,resizable=yes');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Código QR - ${qrCode.four_digit_code}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .container {
              background: white;
              border-radius: 20px;
              padding: 60px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.1);
              max-width: 400px;
            }
            .qr-code {
              margin: 30px 0;
              display: flex;
              justify-content: center;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              background: #f8f9ff;
              padding: 20px 30px;
              border-radius: 15px;
              margin: 20px 0;
              letter-spacing: 8px;
            }
            .title {
              color: #333;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .status {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 500;
              background: #10b981;
              color: white;
              margin: 20px 0;
            }
            .date {
              color: #999;
              font-size: 14px;
              margin-top: 30px;
            }
            .print-btn {
              background: #667eea;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 8px;
              font-size: 16px;
              cursor: pointer;
              margin-top: 20px;
            }
            .print-btn:hover {
              background: #5a67d8;
            }
            @media print {
              body { background: white; }
              .container { box-shadow: none; }
              .print-btn { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="title">Código QR Fuddi</div>
            <div class="subtitle">Escanea o ingresa el código para redimir</div>
            <div class="qr-code">
              <svg width="200" height="200" id="qr-display"></svg>
            </div>
            <div class="code">${qrCode.four_digit_code}</div>
            <div class="status">Activo</div>
            <div class="date">Creado: ${new Date(qrCode.created_at).toLocaleDateString('es-ES')}</div>
            <button class="print-btn" onclick="window.print()">Imprimir</button>
          </div>
          <script src="https://unpkg.com/qrcode-generator@1.4.4/qrcode.js"></script>
          <script>
            var qr = qrcode(0, 'M');
            qr.addData('${qrCode.qr_code_data}');
            qr.make();
            document.getElementById('qr-display').innerHTML = qr.createSvgTag(8, 0);
          </script>
        </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  const handleGenerateClick = () => {
    if (currentQrCode) {
      setShowConfirmDialog(true);
    } else {
      generateQRCode();
    }
  };

  // Verificar si el usuario es un negocio
  if (!user || user.type !== 'business') {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Solo los negocios pueden generar códigos QR.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Generador de Código QR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Genera un código QR único para tu negocio que los clientes pueden escanear para redimir promociones.
            {currentQrCode && " Solo puedes tener un código QR activo a la vez."}
          </p>
          
          <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
            <AlertDialogTrigger asChild>
              <Button 
                onClick={handleGenerateClick}
                disabled={isLoading}
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <QrCode className="mr-2 h-4 w-4" />
                {isLoading ? 'Generando...' : currentQrCode ? 'Generar Nuevo QR' : 'Generar QR'}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Confirmar Generación de Nuevo QR
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Estás a punto de eliminar tu código QR actual y generar uno nuevo. 
                  El código QR anterior dejará de funcionar inmediatamente. ¿Deseas continuar?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={generateQRCode} disabled={isLoading}>
                  {isLoading ? 'Generando...' : 'Sí, Generar Nuevo'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {currentQrCode && (
        <Card>
          <CardHeader>
            <CardTitle>Tu Código QR Activo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Card className="p-6 max-w-sm">
                <div className="text-center space-y-4">
                  {/* QR Code */}
                  <div className="flex justify-center">
                    <QRCodeSVG
                      id={`qr-${currentQrCode.id}`}
                      value={currentQrCode.qr_code_data}
                      size={150}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  
                  {/* 4-Digit Code */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Código de 4 dígitos:</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-xl font-mono bg-muted px-3 py-1 rounded">
                        {showCode ? currentQrCode.four_digit_code : '••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleCodeVisibility}
                      >
                        {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(currentQrCode.four_digit_code)}
                      >
                        {copiedCode === currentQrCode.four_digit_code ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex justify-center">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Activo
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewQRCodeInNewTab(currentQrCode)}
                      className="border-purple-200 text-purple-600 hover:bg-purple-50"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadQRCode(currentQrCode)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Descargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deactivateQRCode}
                    >
                      Desactivar
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QRCodeManager;
