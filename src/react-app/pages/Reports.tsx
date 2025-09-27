import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { PermissionGate } from '@/react-app/components/ProtectedRoute';
import { PERMISSIONS } from '@/shared/permissions';
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Package,
  Target,
  Download,
  ChevronDown,
  Smile,
  Clock,
  MessageSquare,
  Bot,
  Eye,
  User,
  FileText,
  ExternalLink
} from 'lucide-react';

interface RevenueData {
  period: string;
  revenue: number;
  appointments: number;
  patients: number;
}

interface ProfessionalPerformance {
  id: number;
  name: string;
  appointments: number;
  revenue: number;
}

interface ProcedureData {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

interface LeadData {
  stage: string;
  count: number;
  conversionRate: number;
}

interface KPIData {
  totalRevenue: number;
  monthlyGrowth: number;
  totalAppointments: number;
  appointmentGrowth: number;
  totalPatients: number;
  patientGrowth: number;
  avgTicket: number;
  ticketGrowth: number;
  leadConversion: number;
  conversionGrowth: number;
  whatsappMessages: number;
  aiResponses: number;
  inventoryItems: number;
  lowStockItems: number;
}

interface InventoryAlert {
  id: number;
  material_name: string;
  current_stock: number;
  min_stock_level: number;
  alert_type: string;
}

interface AIPerformanceData {
  intentsDetected: number;
  autoSchedules: number;
  totalConversations: number;
  avgResponseTime: string;
}

interface TopIntentData {
  intent: string;
  count: number;
  percentage: number;
}

interface InventoryMovement {
  category: string;
  entradas: number;
  saidas: number;
}

interface TopUsedItem {
  name: string;
  usage: number;
  percentage: number;
}

export default function Reports() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Real data from APIs
  const [kpiData, setKpiData] = useState<KPIData | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [professionalPerformance, setProfessionalPerformance] = useState<ProfessionalPerformance[]>([]);
  const [procedureData, setProcedureData] = useState<ProcedureData[]>([]);
  const [leadData, setLeadData] = useState<LeadData[]>([]);
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [aiPerformance, setAIPerformance] = useState<AIPerformanceData | null>(null);
  const [topIntents, setTopIntents] = useState<TopIntentData[]>([]);
  const [inventoryMovement, setInventoryMovement] = useState<InventoryMovement[]>([]);
  const [topUsedItems, setTopUsedItems] = useState<TopUsedItem[]>([]);

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      fetchReportsData();
    }
  }, [user, dateRange]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      // Fetch all report data concurrently
      const [
        overviewStats,
        revenueTrend,
        professionalStats,
        procedureStats,
        salesFunnel,
        lowStockAlerts,
        aiStats,
        intentStats,
        movementStats,
        usageStats
      ] = await Promise.all([
        fetch('/api/reports/overview-stats').then(res => res.ok ? res.json() : null),
        fetch('/api/reports/revenue-trend').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/professional-performance').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/procedure-stats').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/sales-funnel').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/inventory-alerts').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/ai-performance').then(res => res.ok ? res.json() : null),
        fetch('/api/reports/top-intents').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/inventory-movement').then(res => res.ok ? res.json() : []),
        fetch('/api/reports/top-used-items').then(res => res.ok ? res.json() : [])
      ]);

      setKpiData(overviewStats);
      setRevenueData(revenueTrend);
      setProfessionalPerformance(professionalStats);
      setProcedureData(procedureStats);
      setLeadData(salesFunnel);
      setInventoryAlerts(lowStockAlerts);
      setAIPerformance(aiStats);
      setTopIntents(intentStats);
      setInventoryMovement(movementStats);
      setTopUsedItems(usageStats);
    } catch (error) {
      console.error('Error fetching reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-emerald-600' : 'text-red-600';
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? '↗' : '↘';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart, permission: PERMISSIONS.REPORTS_VIEW_ALL },
    { id: 'financial', name: 'Financeiro', icon: DollarSign, permission: PERMISSIONS.REPORTS_FINANCIAL },
    { id: 'performance', name: 'Performance', icon: TrendingUp, permission: PERMISSIONS.REPORTS_VIEW_ALL },
    { id: 'procedures', name: 'Procedimentos', icon: FileText, permission: PERMISSIONS.REPORTS_VIEW_ALL },
    { id: 'leads', name: 'Leads & IA', icon: Bot, permission: PERMISSIONS.AI_LEADS_VIEW },
    { id: 'inventory', name: 'Estoque', icon: Package, permission: PERMISSIONS.INVENTORY_VIEW }
  ];

  const dateRanges = [
    { value: '7d', label: 'Últimos 7 dias' },
    { value: '30d', label: 'Últimos 30 dias' },
    { value: '90d', label: 'Últimos 3 meses' },
    { value: '12m', label: 'Último ano' },
    { value: 'custom', label: 'Período personalizado' }
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Receita Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? formatCurrency(kpiData.totalRevenue) : '--'}
              </p>
              <p className={`text-sm ${kpiData ? getGrowthColor(kpiData.monthlyGrowth) : 'text-gray-400'} flex items-center`}>
                <span className="mr-1">{kpiData ? getGrowthIcon(kpiData.monthlyGrowth) : '--'}</span>
                {kpiData ? formatPercent(kpiData.monthlyGrowth) : '--'} vs. período anterior
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Procedimentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? kpiData.totalAppointments.toLocaleString() : '--'}
              </p>
              <p className={`text-sm ${kpiData ? getGrowthColor(kpiData.appointmentGrowth) : 'text-gray-400'} flex items-center`}>
                <span className="mr-1">{kpiData ? getGrowthIcon(kpiData.appointmentGrowth) : '--'}</span>
                {kpiData ? formatPercent(kpiData.appointmentGrowth) : '--'} vs. período anterior
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? kpiData.totalPatients.toLocaleString() : '--'}
              </p>
              <p className={`text-sm ${kpiData ? getGrowthColor(kpiData.patientGrowth) : 'text-gray-400'} flex items-center`}>
                <span className="mr-1">{kpiData ? getGrowthIcon(kpiData.patientGrowth) : '--'}</span>
                {kpiData ? formatPercent(kpiData.patientGrowth) : '--'} vs. período anterior
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? formatCurrency(kpiData.avgTicket) : '--'}
              </p>
              <p className={`text-sm ${kpiData ? getGrowthColor(kpiData.ticketGrowth) : 'text-gray-400'} flex items-center`}>
                <span className="mr-1">{kpiData ? getGrowthIcon(kpiData.ticketGrowth) : '--'}</span>
                {kpiData ? formatPercent(kpiData.ticketGrowth) : '--'} vs. período anterior
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Evolução da Receita</h3>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>

        {/* Appointments vs Patients */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Procedimentos vs Clientes</h3>
          </div>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="appointments" stroke="#3B82F6" strokeWidth={2} name="Procedimentos" />
                <Line type="monotone" dataKey="patients" stroke="#10B981" strokeWidth={2} name="Clientes" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 mb-1">Receita Total</p>
              <p className="text-3xl font-bold">
                {kpiData ? formatCurrency(kpiData.totalRevenue) : '--'}
              </p>
              <p className="text-sm text-blue-100 mt-2">
                {kpiData ? `${formatPercent(kpiData.monthlyGrowth)} este período` : '--'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 mb-1">Ticket Médio</p>
              <p className="text-3xl font-bold">
                {kpiData ? formatCurrency(kpiData.avgTicket) : '--'}
              </p>
              <p className="text-sm text-emerald-100 mt-2">Por procedimento</p>
            </div>
            <Target className="w-8 h-8 text-emerald-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-1">Total de Procedimentos</p>
              <p className="text-3xl font-bold">
                {kpiData ? kpiData.totalAppointments : '--'}
              </p>
              <p className="text-sm text-orange-100 mt-2">No período selecionado</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Financial Charts */}
      <div className="grid lg:grid-cols-1 gap-6">
        {/* Monthly Revenue Breakdown */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Receita por Período</h3>
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              <p>Nenhum dado disponível para o período selecionado</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue by Procedure */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Receita por Procedimento</h3>
        {procedureData.length > 0 ? (
          <div className="space-y-4">
            {procedureData.map((procedure, procedureIndex) => (
              <div key={`reports-procedure-summary-${procedure.name}-${procedureIndex}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[procedureIndex % COLORS.length] }}></div>
                  <span className="font-medium text-gray-900">{procedure.name}</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="text-sm text-gray-600">{procedure.count} realizados</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(procedure.revenue)}</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ 
                        backgroundColor: COLORS[procedureIndex % COLORS.length], 
                        width: `${procedure.percentage}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-12">{procedure.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum procedimento encontrado para o período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Professional Performance Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {professionalPerformance.length > 0 ? professionalPerformance.map((professional, profIndex) => (
          <div key={`reports-performance-professional-${professional.id}-${profIndex}`} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {professional.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{professional.name}</h4>
                  <p className="text-sm text-gray-600">Profissional</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-lg font-semibold text-emerald-600">Ativo</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-1">Procedimentos</p>
                <p className="text-xl font-bold text-blue-700">{professional.appointments}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <p className="text-sm text-emerald-600 mb-1">Receita</p>
                <p className="text-xl font-bold text-emerald-700">{formatCurrency(professional.revenue)}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Ticket médio:</span>
                <span className="font-medium">
                  {professional.appointments > 0 ? formatCurrency(professional.revenue / professional.appointments) : '--'}
                </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 text-center text-gray-500 py-8">
            <p>Nenhum profissional encontrado com dados para o período selecionado</p>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      {professionalPerformance.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Comparativo de Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={professionalPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="appointments" fill="#3B82F6" name="Procedimentos" />
              <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Receita (R$)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Additional Metrics */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Taxa de Ocupação</h4>
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">N/A</p>
          <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Satisfação</h4>
            <Smile className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">N/A</p>
          <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Retenção</h4>
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">N/A</p>
          <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
        </div>
      </div>
    </div>
  );

  const renderProceduresTab = () => (
    <div className="space-y-6">
      {/* Procedure Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise de Procedimentos</h3>
        {procedureData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={procedureData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" name="Quantidade" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Nenhum procedimento encontrado para o período selecionado</p>
          </div>
        )}
      </div>

      {/* Procedure Details Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Detalhamento por Procedimento</h3>
          <PermissionGate requiredPermissions={[PERMISSIONS.REPORTS_EXPORT]}>
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </PermissionGate>
        </div>
        
        {procedureData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Procedimento</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Quantidade</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Receita</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Ticket Médio</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">% do Total</th>
                </tr>
              </thead>
              <tbody>
                {procedureData.map((procedure, tableIndex) => (
                  <tr key={`reports-procedures-detail-table-${procedure.name}-${tableIndex}`} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[tableIndex % COLORS.length] }}></div>
                        <span className="font-medium text-gray-900">{procedure.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{procedure.count}</td>
                    <td className="py-3 px-4 font-medium text-gray-900">{formatCurrency(procedure.revenue)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {procedure.count > 0 ? formatCurrency(procedure.revenue / procedure.count) : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full"
                            style={{ 
                              backgroundColor: COLORS[tableIndex % COLORS.length], 
                              width: `${procedure.percentage}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{procedure.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum procedimento encontrado para o período selecionado</p>
          </div>
        )}
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Tendências de Procedimentos</h3>
        {revenueData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="appointments" stroke="#3B82F6" name="Total de Procedimentos" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeadsTab = () => (
    <div className="space-y-6">
      {/* Leads KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Conversão</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? `${kpiData.leadConversion}%` : '--'}
              </p>
              <p className={`text-sm ${kpiData ? getGrowthColor(kpiData.conversionGrowth) : 'text-gray-400'} flex items-center mt-1`}>
                <span className="mr-1">{kpiData ? getGrowthIcon(kpiData.conversionGrowth) : '--'}</span>
                {kpiData ? formatPercent(kpiData.conversionGrowth) : '--'}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Mensagens WhatsApp</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? kpiData.whatsappMessages : '--'}
              </p>
              <p className="text-sm text-gray-600 mt-1">No período</p>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Respostas IA</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? kpiData.aiResponses : '--'}
              </p>
              <p className="text-sm text-emerald-600 mt-1">
                {kpiData && kpiData.whatsappMessages > 0 
                  ? `${Math.round((kpiData.aiResponses / kpiData.whatsappMessages) * 100)}% automatizadas`
                  : '--'
                }
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Bot className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tempo Médio Resposta</p>
              <p className="text-2xl font-bold text-gray-900">
                {aiPerformance ? aiPerformance.avgResponseTime : 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-xl">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Sales Funnel */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Funil de Conversão</h3>
        {leadData.length > 0 ? (
          <div className="space-y-4">
            {leadData.map((stage, stageIndex) => (
              <div key={`reports-sales-funnel-stage-${stageIndex}`} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{stage.stage}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">{stage.count} leads</span>
                    <span className="text-sm font-medium text-gray-900">{stage.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600"
                    style={{ width: `${stage.conversionRate}%` }}
                  ></div>
                </div>
                {stageIndex < leadData.length - 1 && (
                  <div className="absolute right-0 top-8 text-xs text-gray-500">
                    -{(leadData[stageIndex].count - leadData[stageIndex + 1].count)} leads
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum dado de leads disponível para o período selecionado</p>
          </div>
        )}
      </div>

      {/* AI Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance da IA</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-900">Intenções Detectadas</span>
              <span className="text-lg font-bold text-blue-700">
                {aiPerformance ? aiPerformance.intentsDetected : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
              <span className="text-sm font-medium text-emerald-900">Agendamentos Automáticos</span>
              <span className="text-lg font-bold text-emerald-700">
                {aiPerformance ? aiPerformance.autoSchedules : '--'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <span className="text-sm font-medium text-orange-900">Total de Conversas</span>
              <span className="text-lg font-bold text-orange-700">
                {aiPerformance ? aiPerformance.totalConversations : '--'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Principais Intenções</h3>
          {topIntents.length > 0 ? (
            <div className="space-y-3">
              {topIntents.map((item, intentIdx) => (
                <div key={`reports-top-intent-${intentIdx}-${item.intent}`} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{item.intent}</span>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${Math.min(100, item.percentage * 2.8)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-8">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Nenhuma intenção detectada no período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderInventoryTab = () => (
    <div className="space-y-6">
      {/* Inventory KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total de Itens</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpiData ? kpiData.inventoryItems : '--'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Em estoque</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">
                {kpiData ? kpiData.lowStockItems : '--'}
              </p>
              <p className="text-sm text-red-600 mt-1">Requer atenção</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl">
              <Eye className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Valor do Estoque</p>
              <p className="text-2xl font-bold text-gray-900">N/A</p>
              <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Taxa de Giro</p>
              <p className="text-2xl font-bold text-gray-900">N/A</p>
              <p className="text-sm text-gray-600 mt-1">Dados indisponíveis</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Alertas de Estoque Baixo</h3>
          <button 
            onClick={() => navigate('/estoque')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            <span>Gerenciar estoque</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
        {inventoryAlerts.length > 0 ? (
          <div className="space-y-3">
            {inventoryAlerts.map((item) => (
              <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${
                item.alert_type === 'critical' ? 'bg-red-50 border border-red-200' : 'bg-orange-50 border border-orange-200'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.alert_type === 'critical' ? 'bg-red-500' : 'bg-orange-500'
                  }`}></div>
                  <span className="font-medium text-gray-900">{item.material_name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {item.current_stock} de {item.min_stock_level} mínimo
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum alerta de estoque baixo no momento</p>
          </div>
        )}
      </div>

      {/* Inventory Movement */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Movimentação de Estoque</h3>
        {inventoryMovement.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={inventoryMovement}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="entradas" fill="#10B981" name="Entradas" />
              <Bar dataKey="saidas" fill="#EF4444" name="Saídas" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            <p>Nenhuma movimentação de estoque no período selecionado</p>
          </div>
        )}
      </div>

      {/* Top Used Items */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Itens Mais Utilizados</h3>
        {topUsedItems.length > 0 ? (
          <div className="space-y-4">
            {topUsedItems.map((item, usageItemIndex) => (
              <div key={`reports-inventory-used-${item.name}-${usageItemIndex}`} className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{item.name}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{item.usage} unidades</span>
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-600"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700 w-8">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Nenhum item utilizado no período selecionado</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="animate-pulse text-blue-600">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Relatórios Avançados</h1>
              <p className="text-gray-600 mt-1">Analytics completos e dashboard da sua clínica</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              {/* Date Range Selector */}
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {dateRanges.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              {/* Export Button */}
              <PermissionGate requiredPermissions={[PERMISSIONS.REPORTS_EXPORT]}>
                <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  <Download className="w-4 h-4" />
                  <span>Exportar PDF</span>
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <PermissionGate key={tab.id} requiredPermissions={[tab.permission]} fallback={null}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                </PermissionGate>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'financial' && renderFinancialTab()}
            {activeTab === 'performance' && renderPerformanceTab()}
            {activeTab === 'procedures' && renderProceduresTab()}
            {activeTab === 'leads' && renderLeadsTab()}
            {activeTab === 'inventory' && renderInventoryTab()}
          </>
        )}
      </div>
    </Layout>
  );
}
