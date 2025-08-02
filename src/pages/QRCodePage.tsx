
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import QRCodeManager from '@/components/qr/QRCodeManager';

const QRCodePage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Códigos QR</h1>
          <p className="text-muted-foreground">
            Genera y administra códigos QR para las promociones de tu negocio
          </p>
        </div>
        
        <QRCodeManager />
      </div>
    </DashboardLayout>
  );
};

export default QRCodePage;
