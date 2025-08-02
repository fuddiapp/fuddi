import React from 'react';
import { Bell, Gift, Clock, MapPin, X, Sparkles, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatPriceCLP } from '@/lib/formatters';

interface NotificationPromotion {
  id: string;
  title: string;
  description: string;
  originalPrice: number;
  currentPrice: number;
  discountPercentage: number;
  businessName: string;
  businessAddress: string;
  image: string;
  category: string;
  createdAt: string;
  isNew: boolean;
}

interface NotificationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notifications: NotificationPromotion[];
  onPromotionClick: (promotion: NotificationPromotion) => void;
}

const NotificationsDialog: React.FC<NotificationsDialogProps> = ({
  open,
  onOpenChange,
  notifications,
  onPromotionClick,
}) => {
  const newNotifications = notifications.filter(n => n.isNew);
  const recentNotifications = notifications.filter(n => !n.isNew);

  const getMotivationalMessage = () => {
    const messages = [
      "¡Tus negocios favoritos tienen sorpresas para ti! 🎉",
      "Nuevas ofertas esperando por ti 🍕✨",
      "¡No te pierdas estas increíbles promociones! 💫",
      "Tus seguidos han preparado algo especial 🎁",
      "¡Es hora de descubrir nuevas delicias! 🌟",
      "Ofertas frescas de tus lugares favoritos 🥘",
      "¡Mira qué han preparado para ti! 🍽️",
      "Nuevas promociones que te van a encantar 💖"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)}h`;
    return `Hace ${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-bold">
              <Bell className="h-5 w-5 text-fuddi-purple" />
              Notificaciones
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Mensaje motivacional */}
          {notifications.length > 0 && (
            <div className="bg-gradient-to-r from-fuddi-purple/10 to-purple-500/10 rounded-lg p-4 border border-fuddi-purple/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-fuddi-purple" />
                <span className="text-sm font-medium text-fuddi-purple">¡Nuevas ofertas!</span>
              </div>
              <p className="text-sm text-gray-700">{getMotivationalMessage()}</p>
            </div>
          )}

          {/* Nuevas notificaciones */}
          {newNotifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">Nuevo</Badge>
                Recién llegadas
              </h3>
              {newNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-fuddi-purple"
                  onClick={() => onPromotionClick(notification)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={notification.image} 
                          alt={notification.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            -{notification.discountPercentage}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                          {notification.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Heart className="h-3 w-3" />
                            <span className="line-clamp-1">{notification.businessName}</span>
                          </div>
                          <span className="text-sm font-bold text-fuddi-purple">
                            {formatPriceCLP(notification.currentPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Notificaciones recientes */}
          {recentNotifications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-900">Recientes</h3>
              {recentNotifications.map((notification) => (
                <Card 
                  key={notification.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => onPromotionClick(notification)}
                >
                  <CardContent className="p-3">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={notification.image} 
                          alt={notification.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                            {notification.title}
                          </h4>
                          <Badge className="text-xs bg-orange-100 text-orange-700">
                            -{notification.discountPercentage}%
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-1 mb-1">
                          {notification.businessName}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                          <span className="text-sm font-bold text-fuddi-purple">
                            {formatPriceCLP(notification.currentPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Estado vacío */}
          {notifications.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay notificaciones
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Cuando los negocios que sigues publiquen nuevas promociones, aparecerán aquí.
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Entendido
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="flex-shrink-0 pt-4 border-t border-gray-200">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full text-gray-600 hover:text-fuddi-purple"
              onClick={() => onOpenChange(false)}
            >
              Ver todas las promociones
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsDialog; 