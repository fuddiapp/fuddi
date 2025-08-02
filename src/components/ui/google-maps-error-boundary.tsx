import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';
import { FallbackAddressInput } from './fallback-address-input';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  onSelectAddress?: (address: string, lat: number, lng: number, placeId?: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showIcon?: boolean;
  variant?: 'default' | 'compact';
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class GoogleMapsErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Google Maps Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    // Recargar la página para intentar cargar Google Maps nuevamente
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Si tenemos las props necesarias, mostrar el componente de fallback
      if (this.props.value !== undefined && this.props.onChange) {
        return (
          <FallbackAddressInput
            value={this.props.value}
            onChange={this.props.onChange}
            onSelectAddress={this.props.onSelectAddress}
            placeholder={this.props.placeholder}
            disabled={this.props.disabled}
            showIcon={this.props.showIcon}
            variant={this.props.variant}
          />
        );
      }

      return (
        <div className="flex flex-col items-center justify-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-yellow-600 mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Error al cargar Google Maps
          </h3>
          <p className="text-yellow-700 text-center mb-4">
            No se pudo cargar el servicio de mapas. Esto puede deberse a problemas de conexión o configuración.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={this.handleRetry}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 