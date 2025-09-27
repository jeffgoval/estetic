// Exemplos de uso dos componentes criados
import React from 'react';
import {
  Button,
  Input,
  Card,
  Text,
  Badge,
  Avatar,
  Icon,
  Spinner,
  DatePicker,
  Dropdown,
  FormField,
  Pagination,
  SearchBox,
  StatusIndicator,
  Calendar,
  DataTable,
  Form,
  Modal,
  DashboardLayout,
} from '../components';

import { 
  useAppStore,
  usePatientsStore,
  useAppointmentsStore,
  useProfessionalsStore,
  useMaterialsStore,
  useUIStore,
} from '../stores';

import {
  useApi,
  useDebounce,
  useLocalStorage,
  usePagination,
} from '../hooks';

import {
  formatters,
  validators,
  schemas,
} from '../utils';

import { APP_CONFIG } from '../config';

// Exemplo de uso dos componentes atoms
export const AtomsExample: React.FC = () => {
  return (
    <Card>
      <Text variant="h3">Componentes Atoms</Text>
      
      <div className="space-y-4 mt-4">
        <Button variant="default">Botão Primário</Button>
        <Button variant="secondary">Botão Secundário</Button>
        <Button variant="ghost">Botão Ghost</Button>
        
        <Input placeholder="Digite algo..." />
        
        <Badge variant="success">Sucesso</Badge>
        <Badge variant="error">Erro</Badge>
        
        <Avatar src="" alt="Usuario" />
        
        <Icon name="Calendar" size={24} />
        
        <Spinner size="md" />
      </div>
    </Card>
  );
};

// Exemplo de uso dos componentes molecules
export const MoleculesExample: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState('');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  return (
    <Card>
      <Text variant="h3">Componentes Molecules</Text>
      
      <div className="space-y-4 mt-4">
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          label="Data de Nascimento"
        />
        
        <SearchBox
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Buscar pacientes..."
        />
        
        <StatusIndicator
          status="success"
          label="Ativo"
        />
        
        <Pagination
          currentPage={currentPage}
          totalPages={10}
          onPageChange={setCurrentPage}
        />
      </div>
    </Card>
  );
};

// Exemplo de uso dos stores
export const StoresExample: React.FC = () => {
  const { user, tenant } = useAppStore();
  const { patients, loading } = usePatientsStore();
  const { showSuccessToast, showErrorToast } = useUIStore();

  return (
    <Card>
      <Text variant="h3">Exemplo de Stores</Text>
      
      <div className="space-y-2 mt-4">
        <Text>Usuário: {user?.displayName || 'Não logado'}</Text>
        <Text>Clínica: {tenant?.name || 'Não selecionada'}</Text>
        <Text>Pacientes: {patients.length}</Text>
        <Text>Carregando: {loading ? 'Sim' : 'Não'}</Text>
        
        <div className="space-x-2">
          <Button onClick={() => showSuccessToast('Sucesso!')}>
            Toast Sucesso
          </Button>
          <Button onClick={() => showErrorToast('Erro!')}>
            Toast Erro
          </Button>
        </div>
      </div>
    </Card>
  );
};

// Exemplo de uso dos hooks
export const HooksExample: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [savedData, setSavedData] = useLocalStorage('example-data', { count: 0 });
  
  const pagination = usePagination({
    totalItems: 100,
    itemsPerPage: 10,
    currentPage: 1,
  });

  const api = useApi();

  return (
    <Card>
      <Text variant="h3">Exemplo de Hooks</Text>
      
      <div className="space-y-2 mt-4">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Busca com debounce..."
        />
        <Text>Busca debounced: {debouncedSearch}</Text>
        
        <Text>Dados salvos: {JSON.stringify(savedData)}</Text>
        <Button onClick={() => setSavedData({ count: savedData.count + 1 })}>
          Incrementar
        </Button>
        
        <Text>Total de páginas: {pagination.totalPages}</Text>
        <Text>Página atual: {pagination.visibleRange.start}-{pagination.visibleRange.end}</Text>
      </div>
    </Card>
  );
};

// Exemplo de uso dos utilitários
export const UtilitiesExample: React.FC = () => {
  const sampleDate = new Date();
  const samplePrice = 150.50;
  const samplePhone = '11999887766';

  return (
    <Card>
      <Text variant="h3">Exemplo de Utilitários</Text>
      
      <div className="space-y-2 mt-4">
        <Text>Data formatada: {formatters.date(sampleDate)}</Text>
        <Text>Preço formatado: {formatters.currency(samplePrice)}</Text>
        <Text>Telefone formatado: {formatters.phone(samplePhone)}</Text>
        <Text>Tempo relativo: {formatters.relativeTime(sampleDate)}</Text>
        
        <Text>Configuração da app: {APP_CONFIG.name}</Text>
        <Text>Duração padrão: {APP_CONFIG.appointment.defaultDuration} min</Text>
      </div>
    </Card>
  );
};

// Exemplo completo de uso
export const CompleteExample: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <Text variant="h1">Exemplos de Uso da Estrutura</Text>
      
      <AtomsExample />
      <MoleculesExample />
      <StoresExample />
      <HooksExample />
      <UtilitiesExample />
    </div>
  );
};