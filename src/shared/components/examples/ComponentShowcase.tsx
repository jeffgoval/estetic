import React, { useState } from 'react';
import {
  Button,
  Input,
  Card,
  Text,
  Icon,
  Avatar,
  Badge,
  Spinner,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../atoms';
import {
  Modal,
  DataTable,
  Form,
  Chart,
  Header,
  Sidebar,
} from '../organisms';
import {
  SimpleLayout,
  AppShell,
} from '../templates';
import { ThemeProvider } from '../../contexts';
import { Plus, Users, Calendar, Settings } from 'lucide-react';

// Exemplo de uso dos componentes
export const ComponentShowcase: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Dados de exemplo para a tabela
  const sampleData = [
    { id: 1, name: 'João Silva', email: 'joao@email.com', status: 'Ativo' },
    { id: 2, name: 'Maria Santos', email: 'maria@email.com', status: 'Inativo' },
  ];

  const tableColumns = [
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'email', header: 'Email', sortable: true },
    { key: 'status', header: 'Status', render: (item: any) => (
      <Badge variant={item.status === 'Ativo' ? 'success' : 'secondary'}>
        {item.status}
      </Badge>
    )},
  ];

  // Itens da sidebar
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'Home' as const, active: true },
    { id: 'users', label: 'Usuários', icon: 'Users' as const, badge: '5' },
    { id: 'calendar', label: 'Agenda', icon: 'Calendar' as const },
    { id: 'settings', label: 'Configurações', icon: 'Settings' as const },
  ];

  const user = {
    name: 'Dr. João Silva',
    email: 'joao@clinica.com',
    avatar: undefined,
  };

  return (
    <ThemeProvider>
      <SimpleLayout
        title="Showcase de Componentes"
        subtitle="Demonstração dos componentes da biblioteca"
        breadcrumbs={[
          { label: 'Home' },
          { label: 'Componentes' },
          { label: 'Showcase' },
        ]}
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <Icon icon={Plus} size="sm" />
            Novo Item
          </Button>
        }
        sidebar={
          <Sidebar
            items={sidebarItems}
            user={user}
            onUserMenuClick={() => console.log('Configurações')}
            onLogout={() => console.log('Logout')}
          />
        }
      >
        <div className="space-y-8">
          {/* Seção de Botões */}
          <Card>
            <div className="space-y-4">
              <Text variant="h3" weight="semibold">Botões</Text>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primário</Button>
                <Button variant="secondary">Secundário</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destrutivo</Button>
                <Button loading>Carregando</Button>
              </div>
            </div>
          </Card>

          {/* Seção de Inputs */}
          <Card>
            <div className="space-y-4">
              <Text variant="h3" weight="semibold">Inputs</Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nome" placeholder="Digite seu nome" />
                <Input label="Email" type="email" placeholder="seu@email.com" />
                <Input label="Com erro" error="Este campo é obrigatório" />
                <Input label="Com ajuda" helperText="Texto de ajuda" />
              </div>
            </div>
          </Card>

          {/* Seção de Estados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <LoadingState message="Carregando dados..." />
            </Card>
            <Card>
              <EmptyState
                title="Nenhum item encontrado"
                description="Não há itens para exibir no momento"
                action={{
                  label: 'Adicionar Item',
                  onClick: () => console.log('Adicionar'),
                }}
              />
            </Card>
            <Card>
              <ErrorState
                message="Erro ao carregar os dados"
                retry={{
                  onClick: () => console.log('Retry'),
                }}
              />
            </Card>
          </div>

          {/* Seção de Tabela */}
          <Card>
            <div className="space-y-4">
              <Text variant="h3" weight="semibold">Tabela de Dados</Text>
              <DataTable
                data={sampleData}
                columns={tableColumns}
                loading={loading}
                onRowClick={(item) => console.log('Clicou em:', item)}
              />
              <Button
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 2000);
                }}
                variant="outline"
                size="sm"
              >
                Simular Loading
              </Button>
            </div>
          </Card>

          {/* Seção de Chart */}
          <Chart
            title="Gráfico de Exemplo"
            description="Demonstração do componente Chart"
            headerActions={
              <Button variant="outline" size="sm">
                Exportar
              </Button>
            }
          >
            <div className="h-64 flex items-center justify-center bg-neutral-50 rounded">
              <Text color="muted">Aqui seria renderizado um gráfico</Text>
            </div>
          </Chart>
        </div>

        {/* Modal de exemplo */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Modal de Exemplo"
          size="md"
        >
          <div className="space-y-4">
            <Text>Este é um exemplo de modal.</Text>
            <div className="flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Confirmar
              </Button>
            </div>
          </div>
        </Modal>
      </SimpleLayout>
    </ThemeProvider>
  );
};