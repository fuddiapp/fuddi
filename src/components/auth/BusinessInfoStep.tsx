
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from 'react-router-dom';

interface BusinessInfoStepProps {
  onComplete: (businessInfo: BusinessInfo) => void;
  businessName: string;
}

interface BusinessInfo {
  businessType: string;
  address: string;
  commune: string;
  logo?: File;
}

const BusinessInfoStep = ({ onComplete, businessName }: BusinessInfoStepProps) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessType: '',
    address: '',
    commune: '',
    logo: undefined as File | undefined,
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const businessTypes = [
    { value: 'restaurante', label: 'Restaurante' },
    { value: 'cafeteria', label: 'Cafetería' },
    { value: 'casino', label: 'Casino' },
    { value: 'food-truck', label: 'Food Truck' },
    { value: 'pasteleria', label: 'Pastelería' },
  ];

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, logo: 'Por favor selecciona una imagen válida (PNG o JPG)' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, logo: 'La imagen debe ser menor a 5MB' }));
        return;
      }
      setLogo(file);
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.logo;
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessType) {
      newErrors.businessType = 'El rubro del negocio es requerido';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }
    if (!formData.commune.trim()) {
      newErrors.commune = 'La comuna es requerida';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    setTimeout(() => {
      const businessInfo: BusinessInfo = {
        ...formData,
        logo: logo || undefined,
      };
      onComplete(businessInfo);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Información del Negocio
        </CardTitle>
        <CardDescription>
          Completa los datos de tu negocio "{businessName}" para finalizar el registro
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessType">Rubro del Negocio</Label>
            <Select value={formData.businessType} onValueChange={(value) => handleChange('businessType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el rubro de tu negocio" />
              </SelectTrigger>
              <SelectContent>
                {businessTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.businessType && (
              <p className="text-sm text-destructive">{errors.businessType}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              name="address"
              placeholder="Dirección de tu negocio"
              value={formData.address}
              onChange={e => handleChange('address', e.target.value)}
            />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="commune">Comuna</Label>
            <Input
              id="commune"
              name="commune"
              placeholder="Comuna de tu negocio"
              value={formData.commune}
              onChange={e => handleChange('commune', e.target.value)}
            />
            {errors.commune && (
              <p className="text-sm text-destructive">{errors.commune}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo del Negocio (opcional)</Label>
            <Input
              id="logo"
              name="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
            {errors.logo && (
              <p className="text-sm text-destructive">{errors.logo}</p>
            )}
          </div>
          <Button type="submit" className="bg-fuddi-purple hover:bg-fuddi-purple-light" disabled={isLoading}>
            {isLoading ? 'Guardando...' : 'Finalizar Registro'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BusinessInfoStep;
