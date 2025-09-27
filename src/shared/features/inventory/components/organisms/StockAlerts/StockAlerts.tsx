import React from 'react';
import { AlertTriangle, Package, Clock, X } from 'lucide-react';
import { StockAlert } from '../../../types';

interface StockAlertsProps {
  alerts: StockAlert[];
  onDismiss?: (materialId: string) => void;
  loading?: boolean;
  className?: string;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  alerts,
  onDismiss,
  loading = false,
  className = ''
}) => {
  const getAlertIcon = (alertType: StockAlert['alertType']) => {
    switch (alertType) {
      case 'out_of_stock':
        return Package;
      case 'low_stock':
        return AlertTriangle;
      case 'expired':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const getAlertColor = (severity: StockAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-600'
        };
    }
  };

  const getAlertMessage = (alert: StockAlert) => {
    switch (alert.alertType) {
      case 'out_of_stock':
        return 'Material sem estoque';
      case 'low_stock':
        return `Estoque baixo (${alert.currentStock}/${alert.minStockLevel})`;
      case 'expired':
        return 'Material com validade vencida';
      default:
        return 'Alerta de estoque';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Alertas de Estoque</h2>
              <p className="text-sm text-gray-500">
                {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} ativo{alerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {alerts.filter(a => a.severity === 'critical').length} crítico{alerts.filter(a => a.severity === 'critical').length !== 1 ? 's' : ''}
              </span>
              <span className="text-sm text-gray-500">•</span>
              <span className="text-sm text-gray-500">
                {alerts.filter(a => a.severity === 'warning').length} aviso{alerts.filter(a => a.severity === 'warning').length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum alerta ativo
            </h3>
            <p className="text-gray-500">
              Todos os materiais estão com estoque adequado.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.alertType);
              const colors = getAlertColor(alert.severity);

              return (
                <div
                  key={alert.materialId}
                  className={`flex items-center justify-between p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${colors.bg}`}>
                      <Icon className={`w-5 h-5 ${colors.icon}`} />
                    </div>
                    
                    <div>
                      <h4 className={`font-medium ${colors.text}`}>
                        {alert.materialName}
                      </h4>
                      <p className={`text-sm ${colors.text} opacity-80`}>
                        {getAlertMessage(alert)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.alertType === 'low_stock' && (
                      <div className="text-right">
                        <div className={`text-sm font-medium ${colors.text}`}>
                          {alert.currentStock} unidades
                        </div>
                        <div className={`text-xs ${colors.text} opacity-60`}>
                          Mín: {alert.minStockLevel}
                        </div>
                      </div>
                    )}

                    {onDismiss && (
                      <button
                        onClick={() => onDismiss(alert.materialId)}
                        className={`p-1 rounded-md hover:bg-white hover:bg-opacity-50 transition-colors ${colors.text}`}
                        title="Dispensar alerta"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resumo por severidade */}
      {alerts.length > 0 && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-red-50 rounded-lg p-3 border border-red-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-red-700">Críticos</span>
                <span className="text-lg font-bold text-red-900">
                  {alerts.filter(a => a.severity === 'critical').length}
                </span>
              </div>
            </div>
            
            <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-yellow-700">Avisos</span>
                <span className="text-lg font-bold text-yellow-900">
                  {alerts.filter(a => a.severity === 'warning').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};