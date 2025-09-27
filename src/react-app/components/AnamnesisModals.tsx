import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Clock,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';

interface Patient {
  id: number;
  name: string;
  email?: string;
  phone?: string;
}

interface Appointment {
  id: number;
  title: string;
  start_datetime: string;
  patient_name: string;
}

interface Template {
  id: number;
  name: string;
  sections: any[];
}

// New Form Modal
interface NewFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function NewFormModal({ isOpen, onClose, onSubmit }: NewFormModalProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    appointment_id: '',
    template_id: '',
    expires_in_hours: 48
  });

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch patients
      const patientsResponse = await fetch('/api/patients');
      const patientsData = await patientsResponse.json();
      setPatients(patientsData);

      // Fetch upcoming appointments
      const appointmentsResponse = await fetch('/api/appointments?start_date=' + new Date().toISOString().split('T')[0]);
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(appointmentsData);

      // Fetch templates
      const templatesResponse = await fetch('/api/anamnesis/templates');
      const templatesData = await templatesResponse.json();
      setTemplates(templatesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      patient_id: parseInt(formData.patient_id),
      appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : undefined,
      template_id: formData.template_id ? parseInt(formData.template_id) : undefined,
      expires_in_hours: formData.expires_in_hours
    });
  };

  const handlePatientChange = (patientId: string) => {
    setFormData(prev => ({ ...prev, patient_id: patientId, appointment_id: '' }));
  };

  const patientAppointments = appointments.filter(apt => 
    apt.patient_name === patients.find(p => p.id.toString() === formData.patient_id)?.name
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Nova Anamnese Digital</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Paciente *
            </label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => handlePatientChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Selecione o paciente</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Selection (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Consulta (opcional)
            </label>
            <select
              value={formData.appointment_id}
              onChange={(e) => setFormData(prev => ({ ...prev, appointment_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!formData.patient_id}
            >
              <option value="">Selecione a consulta</option>
              {patientAppointments.map(appointment => (
                <option key={appointment.id} value={appointment.id}>
                  {appointment.title} - {new Date(appointment.start_datetime).toLocaleDateString('pt-BR')}
                </option>
              ))}
            </select>
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Template (opcional)
            </label>
            <select
              value={formData.template_id}
              onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Usar template padrão</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Tempo para expiração
            </label>
            <select
              value={formData.expires_in_hours}
              onChange={(e) => setFormData(prev => ({ ...prev, expires_in_hours: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={24}>24 horas</option>
              <option value={48}>48 horas (recomendado)</option>
              <option value={72}>72 horas</option>
              <option value={168}>7 dias</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Como funciona:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Um link único será gerado para o paciente</li>
                  <li>• Você pode enviar por e-mail ou WhatsApp</li>
                  <li>• O paciente preenchera online antes da consulta</li>
                  <li>• Alertas automáticos detectam informações críticas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.patient_id}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Gerar Formulário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Form View Modal (for viewing completed forms)
interface FormViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: any;
}

export function FormViewModal({ isOpen, onClose, form }: FormViewModalProps) {
  const [viewMode, setViewMode] = useState<'responses' | 'alerts'>('responses');

  if (!isOpen || !form) return null;

  const formData = (() => {
    try {
      return form.form_data ? JSON.parse(form.form_data) : {};
    } catch (e) {
      console.error('Error parsing form_data:', e);
      return {};
    }
  })();
  
  const alerts = (() => {
    try {
      return form.alerts_detected ? JSON.parse(form.alerts_detected) : [];
    } catch (e) {
      console.error('Error parsing alerts_detected:', e);
      return [];
    }
  })();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Anamnese - {form.patient_name}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Preenchido em {new Date(form.completed_at).toLocaleDateString('pt-BR')} às {new Date(form.completed_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('responses')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'responses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 inline mr-2" />
              Respostas ({Object.keys(formData).length})
            </button>
            <button
              onClick={() => setViewMode('alerts')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'alerts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <AlertCircle className="w-4 h-4 inline mr-2" />
              Alertas ({alerts.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {viewMode === 'responses' && (
            <div className="space-y-6">
              {Object.keys(formData).length > 0 ? (
                Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 capitalize">
                      {key.replace(/_/g, ' ')}
                    </h4>
                    <div className="text-gray-700">
                      {Array.isArray(value) ? (
                        <ul className="list-disc list-inside space-y-1">
                          {(value as string[]).map((item, itemIndex) => (
                            <li key={`list-item-${key}-${itemIndex}`}>{item}</li>
                          ))}
                        </ul>
                      ) : typeof value === 'boolean' ? (
                        <span className={`px-2 py-1 rounded text-sm ${
                          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {value ? 'Sim' : 'Não'}
                        </span>
                      ) : (
                        <p className="whitespace-pre-wrap">{String(value)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <EyeOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhuma resposta encontrada</p>
                </div>
              )}
            </div>
          )}

          {viewMode === 'alerts' && (
            <div className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert: any, index: number) => (
                  <div key={`alert-${index}-${alert.keyword || index}`} className={`border-l-4 p-4 rounded-lg ${
                    alert.alert_level === 'critical' ? 'border-red-500 bg-red-50' :
                    alert.alert_level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}>
                    <div className="flex items-start space-x-3">
                      <AlertCircle className={`w-5 h-5 mt-0.5 ${
                        alert.alert_level === 'critical' ? 'text-red-600' :
                        alert.alert_level === 'warning' ? 'text-yellow-600' :
                        'text-blue-600'
                      }`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          alert.alert_level === 'critical' ? 'text-red-900' :
                          alert.alert_level === 'warning' ? 'text-yellow-900' :
                          'text-blue-900'
                        }`}>
                          Palavra-chave detectada: "{alert.keyword}"
                        </h4>
                        {alert.alert_message && (
                          <p className={`mt-1 text-sm ${
                            alert.alert_level === 'critical' ? 'text-red-800' :
                            alert.alert_level === 'warning' ? 'text-yellow-800' :
                            'text-blue-800'
                          }`}>
                            {alert.alert_message}
                          </p>
                        )}
                        {alert.contraindications && (
                          <div className="mt-2">
                            <p className={`text-sm font-medium ${
                              alert.alert_level === 'critical' ? 'text-red-900' :
                              alert.alert_level === 'warning' ? 'text-yellow-900' :
                              'text-blue-900'
                            }`}>
                              Contraindicações:
                            </p>
                            <p className={`text-sm ${
                              alert.alert_level === 'critical' ? 'text-red-800' :
                              alert.alert_level === 'warning' ? 'text-yellow-800' :
                              'text-blue-800'
                            }`}>
                              {alert.contraindications}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum alerta detectado</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Todas as respostas estão dentro dos parâmetros normais
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-6 py-4">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Template Builder Modal (simplified version)
interface NewTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export function NewTemplateModal({ isOpen, onClose, onSubmit }: NewTemplateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_default: false
  });

  const [sections, setSections] = useState([
    {
      id: 'section1',
      title: 'Identificação',
      description: 'Dados pessoais e de contato',
      fields: [
        { id: 'nome', type: 'text', label: 'Nome completo', required: true },
        { id: 'idade', type: 'number', label: 'Idade', required: true },
        { id: 'profissao', type: 'text', label: 'Profissão', required: false }
      ]
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      sections: sections,
      is_default: formData.is_default
    });
  };

  const addSection = () => {
    const newSection = {
      id: `section${sections.length + 1}`,
      title: 'Nova Seção',
      description: '',
      fields: []
    };
    setSections([...sections, newSection]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Novo Template de Anamnese</h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Template Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Template *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ex: Anamnese Facial Completa"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descrição do template..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => setFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_default" className="text-sm text-gray-700">
                Definir como template padrão
              </label>
            </div>
          </div>

          {/* Sections Preview */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Seções do Formulário</h4>
              <button
                type="button"
                onClick={addSection}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Seção</span>
              </button>
            </div>

            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={`section-${section.id}-${index}`} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-800">{section.title}</h5>
                      <p className="text-sm text-gray-600">{section.fields.length} campo(s)</p>
                    </div>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setSections(sections.filter((_, i) => i !== index))}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Template Simplificado</p>
                <p className="mt-1">
                  Esta é uma versão simplificada do criador de templates. 
                  O template completo será criado com seções padrão de anamnese estética.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!formData.name}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Criar Template</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
