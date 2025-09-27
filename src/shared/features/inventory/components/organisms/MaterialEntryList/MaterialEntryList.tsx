import React from 'react';
import { Calendar, User, FileText, Package } from 'lucide-react';
import { MaterialEntry } from '../../../types';
import { EntryTypeBadge } from '../../atoms/EntryTypeBadge';

interface MaterialEntryListProps {
  entries: MaterialEntry[];
  loading?: boolean;
  showMaterial?: boolean;
  className?: string;
}

export const MaterialEntryList: React.FC<MaterialEntryListProps> = ({
  entries,
  loading = false,
  showMaterial = true,
  className = ''
}) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
        <div className="p-6 border-b border-gray-200">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-gray-200 rounded-lg"></div>
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Movimentações</h2>
            <p className="text-sm text-gray-500">Histórico de entradas e saídas</p>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="p-6">
        {entries.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma movimentação encontrada
            </h3>
            <p className="text-gray-500">
              As movimentações de entrada e saída aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                {/* Tipo */}
                <div className="flex-shrink-0 mt-1">
                  <EntryTypeBadge type={entry.entryType} />
                </div>

                {/* Conteúdo principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      {showMaterial && entry.material && (
                        <h4 className="font-medium text-gray-900 mb-1">
                          {entry.material.name}
                        </h4>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {entry.quantity} {entry.material?.unitType || 'unidades'}
                        </span>
                        
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(entry.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(entry.totalCost)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(entry.unitCost)}/un
                      </div>
                    </div>
                  </div>

                  {/* Detalhes adicionais */}
                  <div className="space-y-1">
                    {entry.supplierName && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Fornecedor:</span> {entry.supplierName}
                      </div>
                    )}
                    
                    {entry.batchNumber && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Lote:</span> {entry.batchNumber}
                      </div>
                    )}
                    
                    {entry.expiryDate && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Validade:</span>{' '}
                        {new Intl.DateTimeFormat('pt-BR').format(new Date(entry.expiryDate))}
                      </div>
                    )}
                    
                    {entry.invoiceNumber && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">NF:</span> {entry.invoiceNumber}
                      </div>
                    )}
                    
                    {entry.notes && (
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Obs:</span> {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Contador */}
        {entries.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            {entries.length} movimentação{entries.length !== 1 ? 'ões' : ''} encontrada{entries.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    </div>
  );
};