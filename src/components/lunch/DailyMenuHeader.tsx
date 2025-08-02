import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface DailyMenuHeaderProps {
  className?: string;
}

export const DailyMenuHeader: React.FC<DailyMenuHeaderProps> = ({ className = '' }) => {
  const getCurrentDay = () => {
    const today = new Date();
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return dayNames[today.getDay()];
  };

  const getDayEmoji = (day: string) => {
    const emojis: { [key: string]: string } = {
      'Lunes': '🌅',
      'Martes': '🌤️',
      'Miércoles': '☀️',
      'Jueves': '🌞',
      'Viernes': '🎉',
      'Sábado': '🎊',
      'Domingo': '😴'
    };
    return emojis[day] || '🍽️';
  };

  const getDayMessage = (day: string) => {
    const messages: { [key: string]: string } = {
      'Lunes': '¡Comienza la semana con energía!',
      'Martes': '¡Seguimos con el buen ánimo!',
      'Miércoles': '¡Mitad de semana, mitad de diversión!',
      'Jueves': '¡Casi viernes, pero ya tenemos deliciosas opciones!',
      'Viernes': '¡Viernes de fiesta! Celebra con nuestras opciones',
      'Sábado': '¡Sábado de relax y buenos sabores!',
      'Domingo': '¡Domingo de descanso y delicias!'
    };
    return messages[day] || 'Descubre las deliciosas opciones que tenemos preparadas para ti hoy';
  };

  const currentDay = getCurrentDay();
  const dayEmoji = getDayEmoji(currentDay);

  return (
    <Card className={`bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 shadow-sm ${className}`}>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <span className="text-2xl">{dayEmoji}</span>
          <h2 className="text-xl font-semibold text-gray-800">
            Menú del día {currentDay}
          </h2>
          <span className="text-2xl">{dayEmoji}</span>
        </div>
        <p className="text-gray-600 text-sm">
          {getDayMessage(currentDay)}
        </p>
      </CardContent>
    </Card>
  );
}; 