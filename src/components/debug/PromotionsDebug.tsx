import React from 'react';

interface DebugPromotion {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number;
  image_url?: string;
  business_id: string;
  business_name?: string;
  distance?: number;
  canjes?: number;
  categories: string[];
}

interface PromotionsDebugProps {
  promotions: DebugPromotion[];
  convertedPromotions: DebugPromotion[];
}

const PromotionsDebug: React.FC<PromotionsDebugProps> = ({ promotions, convertedPromotions }) => {
  return (
    <div className="bg-yellow-100 p-4 rounded-lg mb-4">
      <h3 className="font-bold text-yellow-800 mb-2">🔍 Debug Info</h3>
      <div className="text-sm text-yellow-700 space-y-2">
        <p><strong>Promociones originales:</strong> {promotions.length}</p>
        <p><strong>Promociones convertidas:</strong> {convertedPromotions.length}</p>
        
        {convertedPromotions.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Primera promoción convertida:</p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(convertedPromotions[0], null, 2)}
            </pre>
          </div>
        )}
        
        {promotions.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Primera promoción original:</p>
            <pre className="bg-white p-2 rounded text-xs overflow-auto">
              {JSON.stringify(promotions[0], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromotionsDebug; 