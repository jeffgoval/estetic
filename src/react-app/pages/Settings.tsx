import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import Layout from '@/react-app/components/Layout';
import { useTheme } from '@/react-app/hooks/useTheme';
import { 
  Building2, 
  Clock, 
  Bell, 
  Palette,
  Save,
  Phone,
  Mail,
  MapPin,
  Globe
} from 'lucide-react';

interface ClinicSettings {
  name: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  logo_url: string;
  primary_color: string;
  secondary_color: string;
}

interface WorkingHours {
  [key: string]: {
    enabled: boolean;
    start: string;
    end: string;
    break_start?: string;
    break_end?: string;
  };
}

interface NotificationSettings {
  email_reminders: boolean;
  sms_reminders: boolean;
  appointment_confirmations: boolean;
  waiting_list_notifications: boolean;
  stock_alerts: boolean;
  reminder_hours_before: number;
}

export default function Settings() {
  const { user, isPending } = useAuth();
  const { theme, updateTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  

  // Settings state
  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    name: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    logo_url: '',
    primary_color: '#3B82F6',
    secondary_color: '#10B981'
  });

  // Theme settings state
  const [themeSettings, setThemeSettings] = useState({
    primary_color: '#3B82F6',
    secondary_color: '#10B981',
    success_color: '#059669',
    error_color: '#DC2626',
    warning_color: '#D97706',
    info_color: '#0891B2',
    background_color: '#F9FAFB',
    card_background: '#FFFFFF',
    text_primary: '#111827',
    text_secondary: '#6B7280',
    border_color: '#E5E7EB',
    logo_url: '',
    clinic_name: 'Suavizar'
  });

  const [workingHours, setWorkingHours] = useState<WorkingHours>({
    monday: { enabled: true, start: '08:00', end: '18:00' },
    tuesday: { enabled: true, start: '08:00', end: '18:00' },
    wednesday: { enabled: true, start: '08:00', end: '18:00' },
    thursday: { enabled: true, start: '08:00', end: '18:00' },
    friday: { enabled: true, start: '08:00', end: '18:00' },
    saturday: { enabled: false, start: '08:00', end: '12:00' },
    sunday: { enabled: false, start: '08:00', end: '12:00' }
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    email_reminders: true,
    sms_reminders: false,
    appointment_confirmations: true,
    waiting_list_notifications: true,
    stock_alerts: true,
    reminder_hours_before: 24
  });

  useEffect(() => {
    if (!isPending && !user) {
      navigate('/');
    }
  }, [user, isPending, navigate]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  useEffect(() => {
    if (theme) {
      setThemeSettings({
        primary_color: theme.primary_color,
        secondary_color: theme.secondary_color,
        success_color: theme.success_color,
        error_color: theme.error_color,
        warning_color: theme.warning_color,
        info_color: theme.info_color,
        background_color: theme.background_color,
        card_background: theme.card_background,
        text_primary: theme.text_primary,
        text_secondary: theme.text_secondary,
        border_color: theme.border_color,
        logo_url: theme.logo_url || '',
        clinic_name: theme.clinic_name
      });
    }
  }, [theme]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/tenant/settings', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.clinic) {
          setClinicSettings({
            ...data.clinic,
            logo_url: data.clinic.logo_url || ''
          });
        }
        
        if (data.working_hours) {
          setWorkingHours(data.working_hours);
        }
        
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } else {
        console.error('Failed to load settings:', response.statusText);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading settings:', error);
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const response = await fetch('/api/tenant/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          clinic: clinicSettings,
          working_hours: workingHours,
          notifications: notifications
        })
      });
      
      if (response.ok) {
        // Update the theme context with the new clinic name to sync with sidebar
        if (clinicSettings.name && updateTheme) {
          await updateTheme({ clinic_name: clinicSettings.name });
        }
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        const errorData = await response.json();
        console.error('Error saving settings:', errorData.error);
        // You could show an error message to the user here
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      // You could show an error message to the user here
    } finally {
      setSaving(false);
    }
  };

  const saveThemeSettings = async () => {
    try {
      setSaving(true);
      
      await updateTheme(themeSettings);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving theme:', error);
    } finally {
      setSaving(false);
    }
  };

  

  const handleThemeColorChange = (colorKey: string, value: string) => {
    const newTheme = { ...themeSettings, [colorKey]: value };
    setThemeSettings(newTheme);
    // Apply immediately for live preview
    updateTheme({ [colorKey]: value });
  };

  

  const getDayName = (key: string) => {
    const days: { [key: string]: string } = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return days[key] || key;
  };

  const tabs = [
    { id: 'general', name: 'Geral', icon: Building2 },
    { id: 'hours', name: 'Horários', icon: Clock },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'appearance', name: 'Aparência', icon: Palette }
  ];

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
              <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
              <p className="text-gray-600">Gerencie as configurações da sua clínica</p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          </div>

          {/* Success message */}
          {showSuccess && (
            <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-emerald-800 text-sm">✓ Configurações salvas com sucesso!</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <nav className="space-y-1 p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-gradient-primary text-white shadow-lg'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      style={activeTab === tab.id ? {
                        boxShadow: '0 10px 25px rgba(var(--color-primary-rgb), 0.25)'
                      } : {}}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando configurações...</p>
                </div>
              ) : (
                <>
                  {/* General Settings */}
                  {activeTab === 'general' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações Gerais</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome da Clínica
                            </label>
                            <input
                              type="text"
                              value={clinicSettings.name}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, name: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefone
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="tel"
                                value={clinicSettings.phone}
                                onChange={(e) => setClinicSettings({ ...clinicSettings, phone: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="(11) 99999-9999"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="email"
                                value={clinicSettings.email}
                                onChange={(e) => setClinicSettings({ ...clinicSettings, email: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="contato@clínica.com"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Website
                            </label>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                              <input
                                type="url"
                                value={clinicSettings.website}
                                onChange={(e) => setClinicSettings({ ...clinicSettings, website: e.target.value })}
                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="https://www.clínica.com"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Endereço
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <textarea
                              rows={3}
                              value={clinicSettings.address}
                              onChange={(e) => setClinicSettings({ ...clinicSettings, address: e.target.value })}
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Rua, número, bairro, cidade, CEP"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Working Hours */}
                  {activeTab === 'hours' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Horários de Funcionamento</h3>
                        <div className="space-y-4">
                          {Object.entries(workingHours).map(([day, hours]) => (
                            <div key={day} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3 mb-3">
                                <input
                                  type="checkbox"
                                  checked={hours.enabled}
                                  onChange={(e) => setWorkingHours({
                                    ...workingHours,
                                    [day]: { ...hours, enabled: e.target.checked }
                                  })}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-sm font-medium text-gray-900 w-24">
                                  {getDayName(day)}
                                </span>
                              </div>
                              
                              {hours.enabled ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                                  {/* Horário de funcionamento */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Horário de funcionamento
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="time"
                                        value={hours.start}
                                        onChange={(e) => setWorkingHours({
                                          ...workingHours,
                                          [day]: { ...hours, start: e.target.value }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                      <span className="text-gray-500 text-sm">às</span>
                                      <input
                                        type="time"
                                        value={hours.end}
                                        onChange={(e) => setWorkingHours({
                                          ...workingHours,
                                          [day]: { ...hours, end: e.target.value }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                    </div>
                                  </div>

                                  {/* Horário de almoço */}
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Horário do almoço (opcional)
                                    </label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="time"
                                        value={hours.break_start || ''}
                                        onChange={(e) => setWorkingHours({
                                          ...workingHours,
                                          [day]: { ...hours, break_start: e.target.value }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Início"
                                      />
                                      <span className="text-gray-500 text-sm">às</span>
                                      <input
                                        type="time"
                                        value={hours.break_end || ''}
                                        onChange={(e) => setWorkingHours({
                                          ...workingHours,
                                          [day]: { ...hours, break_end: e.target.value }
                                        })}
                                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Fim"
                                      />
                                    </div>
                                    {(hours.break_start || hours.break_end) && (
                                      <div className="mt-1 flex items-center">
                                        <button
                                          type="button"
                                          onClick={() => setWorkingHours({
                                            ...workingHours,
                                            [day]: { ...hours, break_start: '', break_end: '' }
                                          })}
                                          className="text-xs text-red-600 hover:text-red-800"
                                        >
                                          Remover horário de almoço
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="ml-7">
                                  <span className="text-sm text-gray-500">Fechado</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-start space-x-3">
                            <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
                            <div>
                              <h4 className="text-sm font-medium text-blue-900">Dica sobre horários de almoço</h4>
                              <p className="text-sm text-blue-700 mt-1">
                                O horário de almoço é usado pelo sistema para não permitir agendamentos durante esse período. 
                                Se não definido, a clínica aceita agendamentos durante todo o horário de funcionamento.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {activeTab === 'notifications' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferências de Notificação</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Lembretes por email</h4>
                              <p className="text-sm text-gray-500">Enviar lembretes de consultas por email</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.email_reminders}
                                onChange={(e) => setNotifications({ ...notifications, email_reminders: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Lembretes por SMS</h4>
                              <p className="text-sm text-gray-500">Enviar lembretes de consultas por SMS</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.sms_reminders}
                                onChange={(e) => setNotifications({ ...notifications, sms_reminders: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Confirmações de agendamento</h4>
                              <p className="text-sm text-gray-500">Solicitar confirmação de presença</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.appointment_confirmations}
                                onChange={(e) => setNotifications({ ...notifications, appointment_confirmations: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Notificações da lista de espera</h4>
                              <p className="text-sm text-gray-500">Avisar sobre vagas disponíveis</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.waiting_list_notifications}
                                onChange={(e) => setNotifications({ ...notifications, waiting_list_notifications: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Alertas de estoque</h4>
                              <p className="text-sm text-gray-500">Avisos sobre estoque baixo</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={notifications.stock_alerts}
                                onChange={(e) => setNotifications({ ...notifications, stock_alerts: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>

                          <div className="p-4 bg-gray-50 rounded-lg">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Enviar lembretes com antecedência de:
                            </label>
                            <select
                              value={notifications.reminder_hours_before}
                              onChange={(e) => setNotifications({ ...notifications, reminder_hours_before: parseInt(e.target.value) })}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={1}>1 hora</option>
                              <option value={2}>2 horas</option>
                              <option value={6}>6 horas</option>
                              <option value={12}>12 horas</option>
                              <option value={24}>24 horas</option>
                              <option value={48}>48 horas</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Appearance */}
                  {activeTab === 'appearance' && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Personalização Visual</h3>
                        
                        

                        {/* Color Palette */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Primary Colors */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Cores Principais</h5>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cor primária
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.primary_color}
                                  onChange={(e) => handleThemeColorChange('primary_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.primary_color}
                                  onChange={(e) => handleThemeColorChange('primary_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cor secundária
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.secondary_color}
                                  onChange={(e) => handleThemeColorChange('secondary_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.secondary_color}
                                  onChange={(e) => handleThemeColorChange('secondary_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Status Colors */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Cores de Status</h5>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sucesso
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.success_color}
                                  onChange={(e) => handleThemeColorChange('success_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.success_color}
                                  onChange={(e) => handleThemeColorChange('success_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Erro
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.error_color}
                                  onChange={(e) => handleThemeColorChange('error_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.error_color}
                                  onChange={(e) => handleThemeColorChange('error_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Aviso
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.warning_color}
                                  onChange={(e) => handleThemeColorChange('warning_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.warning_color}
                                  onChange={(e) => handleThemeColorChange('warning_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Informação
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.info_color}
                                  onChange={(e) => handleThemeColorChange('info_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.info_color}
                                  onChange={(e) => handleThemeColorChange('info_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Interface Colors */}
                          <div className="space-y-4">
                            <h5 className="font-medium text-gray-900">Cores da Interface</h5>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fundo
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.background_color}
                                  onChange={(e) => handleThemeColorChange('background_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.background_color}
                                  onChange={(e) => handleThemeColorChange('background_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fundo de cards
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.card_background}
                                  onChange={(e) => handleThemeColorChange('card_background', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.card_background}
                                  onChange={(e) => handleThemeColorChange('card_background', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto principal
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.text_primary}
                                  onChange={(e) => handleThemeColorChange('text_primary', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.text_primary}
                                  onChange={(e) => handleThemeColorChange('text_primary', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Texto secundário
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.text_secondary}
                                  onChange={(e) => handleThemeColorChange('text_secondary', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.text_secondary}
                                  onChange={(e) => handleThemeColorChange('text_secondary', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bordas
                              </label>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="color"
                                  value={themeSettings.border_color}
                                  onChange={(e) => handleThemeColorChange('border_color', e.target.value)}
                                  className="w-12 h-10 rounded-lg border border-gray-300 cursor-pointer appearance-none bg-transparent"
                                  style={{ 
                                    minWidth: '48px',
                                    minHeight: '40px',
                                    padding: '2px'
                                  }}
                                />
                                <input
                                  type="text"
                                  value={themeSettings.border_color}
                                  onChange={(e) => handleThemeColorChange('border_color', e.target.value)}
                                  className="w-24 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        

                        {/* Save Theme Button */}
                        <div className="flex justify-end mt-6">
                          <button
                            onClick={saveThemeSettings}
                            disabled={saving}
                            className="btn-primary px-6 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                          >
                            {saving ? 'Salvando...' : 'Salvar Tema'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
