import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, QrCode, CreditCard, Clock, MapPin, Phone, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getPromotionById, Promotion } from '@/integrations/supabase/promotions';
import { getBusinessById } from '@/integrations/supabase/businesses';
import { createPromotionRedemption, validateQRCode, checkTodayRedemption, validateFourDigitCode } from '@/integrations/supabase/promotion-redemptions';
import { useAuth } from '@/contexts/AuthContext';
import { isBusinessOpen } from '@/lib/utils';
import QRScanner from '@/components/ui/qr-scanner';
import RedemptionSuccess from '@/components/ui/redemption-success';

interface Business {
  id: string;
  business_name: string;
  description?: string;
  address?: string;
  phone?: string;
  logo_url?: string;
  cover_url?: string;
  opening_time?: string;
  closing_time?: string;
}

// Tipo que extiende Promotion para incluir los datos del negocio del JOIN
interface PromotionWithBusiness extends Promotion {
  businesses?: {
    id: string;
    business_name: string;
    address: string;
    category: string;
    description?: string;
    opening_time: string;
    closing_time: string;
    logo_url?: string;
    created_at: string;
  };
}

const PromotionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [promotion, setPromotion] = useState<PromotionWithBusiness | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [redemptionDialogOpen, setRedemptionDialogOpen] = useState(false);
  const [redemptionMethod, setRedemptionMethod] = useState<'code' | 'qr'>('code');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutos
  const [countdownActive, setCountdownActive] = useState(false);
  const [redemptionLoading, setRedemptionLoading] = useState(false);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [hasRedeemedToday, setHasRedeemedToday] = useState(false);

  useEffect(() => {
    const loadPromotionDetails = async () => {
      if (!id) {
        console.log('No promotionId provided');
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading promotion with ID:', id);
        const promotionData = await getPromotionById(id);
        console.log('Promotion data received:', promotionData);
        
        if (promotionData) {
          setPromotion(promotionData as PromotionWithBusiness);
          // Si la promoción incluye datos del negocio, usarlos directamente
          if ((promotionData as PromotionWithBusiness).businesses) {
            setBusiness((promotionData as PromotionWithBusiness).businesses!);
          } else {
            // Fallback: cargar negocio por separado
            console.log('Loading business with ID:', promotionData.business_id);
            const businessData = await getBusinessById(promotionData.business_id);
            console.log('Business data received:', businessData);
            setBusiness(businessData);
          }
        } else {
          console.log('No promotion data found');
          toast({
            title: "Promoción no encontrada",
            description: "La promoción que buscas no existe",
            variant: "destructive",
          });
        }
      } catch (error: unknown) {
        console.error('Error loading promotion:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar la promoción",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPromotionDetails();
  }, [id]);

  // Verificar si el usuario ya canjeó esta promoción hoy
  useEffect(() => {
    const checkTodayRedemption = async () => {
      if (!user || !promotion) return;
      
      try {
        const hasRedeemed = await checkTodayRedemption(promotion.id, user.id);
        setHasRedeemedToday(hasRedeemed);
      } catch (error) {
        console.error('Error checking today redemption:', error);
      }
    };

    checkTodayRedemption();
  }, [user, promotion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (countdownActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCountdownActive(false);
            setRedemptionDialogOpen(false);
            toast({
              title: "Tiempo agotado",
              description: "El tiempo para canjear la promoción ha expirado",
              variant: "destructive",
            });
            return 120;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdownActive, countdown]);

  const handleRedeemClick = () => {
    if (!user) {
      toast({
        title: "Inicia sesión",
        description: "Debes iniciar sesión para canjear promociones",
        variant: "destructive",
      });
      return;
    }

    setRedemptionDialogOpen(true);
    setCountdownActive(true);
    setCountdown(120);
  };

  const handleRedeemPromotion = async () => {
    if (!promotion || !user) return;

    setRedemptionLoading(true);
    
    try {
      // Verificar si el cliente ya canjeó esta promoción hoy
      const hasRedeemedToday = await checkTodayRedemption(promotion.id, user.id);
      if (hasRedeemedToday) {
        toast({
          title: "Ya canjeaste esta promoción hoy",
          description: "Puedes volver a canjear esta promoción mañana",
          variant: "destructive",
        });
        return;
      }

      // Si es método código, verificar formato del código
      if (redemptionMethod === 'code') {
        if (!code.trim() || code.length !== 4 || !/^\d{4}$/.test(code)) {
          toast({
            title: "Código inválido",
            description: "Debes ingresar un código de exactamente 4 dígitos",
            variant: "destructive",
          });
          return;
        }
        
        console.log('Código de 4 dígitos válido:', code, 'para negocio:', promotion.business_id);
      }

      // Si es método QR, validar el código QR
      if (redemptionMethod === 'qr') {
        if (!code.trim()) {
          toast({
            title: "Código QR requerido",
            description: "Debes ingresar el código QR para canjear la promoción",
            variant: "destructive",
          });
          return;
        }
        
        const isValidQR = await validateQRCode(code, promotion.business_id);
        if (!isValidQR) {
          toast({
            title: "Código QR inválido",
            description: "El código QR no es válido para este negocio",
            variant: "destructive",
          });
          return;
        }
      }

      // Crear el canje
      await createPromotionRedemption({
        promotion_id: promotion.id,
        client_id: user.id,
        business_id: promotion.business_id,
        redemption_method: redemptionMethod,
        code_used: code,
        redemption_amount: promotion.discounted_price,
      });

      // Recargar la promoción para obtener el contador actualizado
      if (promotion) {
        const updatedPromotion = await getPromotionById(promotion.id);
        if (updatedPromotion) {
          setPromotion(updatedPromotion);
        }
      }

      // Mostrar modal de éxito en lugar de toast
      setSuccessDialogOpen(true);
      setRedemptionDialogOpen(false);
      setCountdownActive(false);
      setCode('');
    } catch (error: unknown) {
      console.error('Error redeeming promotion:', error);
      toast({
        title: "Error",
        description: "No se pudo canjear la promoción. Verifica el código e intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setRedemptionLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Función para manejar el escaneo de QR
  const handleQRScan = (qrCode: string) => {
    setCode(qrCode);
    setQrScannerOpen(false);
    toast({
      title: "Código QR detectado",
      description: "El código QR ha sido escaneado correctamente",
    });
  };

  // Función para manejar el cierre del modal de éxito
  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    // No navegar al inicio, permanecer en la página para ver el contador actualizado
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuddi-purple mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando promoción...</p>
        </div>
      </div>
    );
  }

  if (!promotion || !business) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Promoción no encontrada</h2>
          <p className="text-gray-600 mb-4">La promoción que buscas no existe o ha sido eliminada</p>
          <Button onClick={() => navigate('/client')}>Volver al inicio</Button>
        </div>
      </div>
    );
  }

  const discount = promotion.original_price ? promotion.original_price - promotion.discounted_price : 0;
  const discountPercentage = promotion.original_price ? Math.round((discount / promotion.original_price) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">{promotion.title}</h1>
              <p className="text-sm text-gray-600">{business.business_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen de la promoción */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
              {promotion.image_url ? (
                <img
                  src={promotion.image_url}
                  alt={promotion.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-fuddi-purple/10 to-purple-600/10">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 text-fuddi-purple/40 mx-auto mb-2" />
                    <p className="text-gray-500">Sin imagen</p>
                  </div>
                </div>
              )}
            </div>

            {/* Información del negocio */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  {business.logo_url ? (
                    <img
                      src={business.logo_url}
                      alt={business.business_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-fuddi-purple/10 flex items-center justify-center">
                      <span className="text-fuddi-purple font-semibold text-lg">
                        {business.business_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{business.business_name}</h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <div className={`w-2 h-2 rounded-full ${isBusinessOpen(business.opening_time, business.closing_time) ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span>{isBusinessOpen(business.opening_time, business.closing_time) ? 'Abierto' : 'Cerrado'}</span>
                    </div>
                  </div>
                </div>
                
                {business.address && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4" />
                    <span>{business.address}</span>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{business.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalles de la promoción */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{promotion.title}</h1>
              <p className="text-gray-600 text-lg leading-relaxed">{promotion.description}</p>
              

            </div>

            {/* Categorías */}
            <div className="flex flex-wrap gap-2">
              {promotion.categories.map((category) => (
                <Badge key={category} variant="secondary" className="bg-fuddi-purple/10 text-fuddi-purple">
                  {category}
                </Badge>
              ))}
            </div>

            {/* Precios */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-fuddi-purple">
                  ${promotion.discounted_price.toLocaleString()}
                </span>
                {promotion.original_price && (
                  <span className="text-xl text-gray-500 line-through">
                    ${promotion.original_price.toLocaleString()}
                  </span>
                )}
              </div>
              
              {discount > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-sm">
                    -{discountPercentage}%
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Ahorras ${discount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Botón de canje */}
            <div className="pt-4">
              <Button
                onClick={handleRedeemClick}
                size="lg"
                className="w-full h-14 text-lg font-semibold bg-fuddi-purple hover:bg-fuddi-purple/90"
                disabled={!isBusinessOpen(business.opening_time, business.closing_time) || hasRedeemedToday}
              >
                <QrCode className="h-5 w-5 mr-2" />
                {hasRedeemedToday ? 'Promoción Canjeada' : 'Canjear Promoción'}
              </Button>
              
              {!isBusinessOpen(business.opening_time, business.closing_time) && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  El negocio está cerrado. Solo puedes canjear promociones cuando esté abierto.
                </p>
              )}
              
              {hasRedeemedToday && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Ya canjeaste esta promoción hoy. Puedes volver a canjearla mañana.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de canje */}
      <Dialog open={redemptionDialogOpen} onOpenChange={setRedemptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Canjear Promoción</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Contador */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-fuddi-purple" />
                <span className="text-lg font-semibold">Tiempo restante</span>
              </div>
              <div className="text-3xl font-bold text-fuddi-purple">
                {formatTime(countdown)}
              </div>
            </div>

            {/* Método de canje */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={redemptionMethod === 'code' ? 'default' : 'outline'}
                  onClick={() => setRedemptionMethod('code')}
                  className="flex-1"
                >
                  Código
                </Button>
                <Button
                  variant={redemptionMethod === 'qr' ? 'default' : 'outline'}
                  onClick={() => setRedemptionMethod('qr')}
                  className="flex-1"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR
                </Button>
              </div>

              {redemptionMethod === 'code' ? (
                <div className="space-y-2">
                  <Label htmlFor="code">Código de 4 dígitos</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="1234"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="text-center text-2xl font-mono tracking-widest"
                  />
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="bg-gray-100 rounded-lg p-6">
                    <QrCode className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 mb-4">
                      Escanea el código QR en la caja del negocio
                    </p>
                    <Button
                      onClick={() => setQrScannerOpen(true)}
                      className="bg-fuddi-purple hover:bg-fuddi-purple/90"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Escanear QR
                    </Button>
                  </div>
                  <div className="text-sm text-gray-500">
                    O ingresa el código manualmente:
                  </div>
                  <Input
                    type="text"
                    placeholder="Ingresa el código del QR"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="text-center"
                  />
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRedemptionDialogOpen(false);
                  setCountdownActive(false);
                  setCode('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRedeemPromotion}
                disabled={!code.trim() || redemptionLoading}
                className="flex-1 bg-fuddi-purple hover:bg-fuddi-purple/90"
              >
                {redemptionLoading ? 'Canjeando...' : 'Confirmar Canje'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Escáner QR */}
      <QRScanner
        isOpen={qrScannerOpen}
        onClose={() => setQrScannerOpen(false)}
        onScan={handleQRScan}
      />

      {/* Modal de éxito de canje */}
      <RedemptionSuccess
        isOpen={successDialogOpen}
        onClose={handleSuccessClose}
        promotionName={promotion?.title || 'Promoción'}
        businessName={business?.business_name || 'Negocio'}
        redemptionAmount={promotion?.discounted_price || 0}
      />
    </div>
  );
};

export default PromotionDetailPage; 