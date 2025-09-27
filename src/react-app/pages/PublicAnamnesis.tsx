import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  Send,
  Shield,
  Heart,
  User,
  Stethoscope
} from 'lucide-react';

interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'email' | 'phone';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: any;
}

interface FormData {
  [key: string]: any;
}

export default function PublicAnamnesis() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formInfo, setFormInfo] = useState<any>(null);
  const [sections, setSections] = useState<FormSection[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [currentSection, setCurrentSection] = useState(0);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (token) {
      fetchForm();
    }
  }, [token]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/anamnesis/public/${token}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Formulário não encontrado ou já foi preenchido.');
        } else if (response.status === 410) {
          setError('Este formulário expirou. Entre em contato com a clínica para solicitar um novo.');
        } else {
          setError('Erro ao carregar formulário. Tente novamente.');
        }
        return;
      }

      const data = await response.json();
      setFormInfo(data);
      
      // If template sections exist, use them; otherwise use default
      if (data.template_sections && data.template_sections.length > 0) {
        setSections(data.template_sections);
      } else {
        setSections(getDefaultSections());
      }
      
      // Initialize form data with existing data
      if (data.form_data) {
        setFormData(data.form_data);
      }
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSections = (): FormSection[] => [
    {
      id: 'identification',
      title: 'Identificação',
      description: 'Suas informações básicas',
      fields: [
        { id: 'nome_completo', type: 'text', label: 'Nome completo', required: true },
        { id: 'idade', type: 'number', label: 'Idade', required: true },
        { id: 'profissao', type: 'text', label: 'Profissão', required: false },
        { id: 'estado_civil', type: 'select', label: 'Estado civil', required: false, 
          options: ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável'] }
      ]
    },
    {
      id: 'medical_history',
      title: 'Histórico Médico',
      description: 'Informações sobre sua saúde',
      fields: [
        { id: 'alergias', type: 'textarea', label: 'Possui alguma alergia? Qual?', required: false, 
          placeholder: 'Descreva suas alergias ou digite "Não possuo"' },
        { id: 'medicamentos', type: 'textarea', label: 'Faz uso de algum medicamento?', required: false,
          placeholder: 'Liste os medicamentos ou digite "Não faço uso"' },
        { id: 'cirurgias', type: 'textarea', label: 'Já fez alguma cirurgia? Qual e quando?', required: false,
          placeholder: 'Descreva cirurgias anteriores ou digite "Nunca fiz"' },
        { id: 'doencas_cronicas', type: 'textarea', label: 'Possui alguma doença crônica?', required: false,
          placeholder: 'Diabetes, hipertensão, etc. ou digite "Não possuo"' }
      ]
    },
    {
      id: 'aesthetic_concerns',
      title: 'Preocupações Estéticas',
      description: 'O que você gostaria de melhorar',
      fields: [
        { id: 'principal_queixa', type: 'textarea', label: 'Qual sua principal preocupação estética?', required: true,
          placeholder: 'Descreva o que mais te incomoda' },
        { id: 'expectativas', type: 'textarea', label: 'Quais são suas expectativas com o tratamento?', required: true,
          placeholder: 'O que espera alcançar' },
        { id: 'tratamentos_anteriores', type: 'textarea', label: 'Já fez algum tratamento estético antes?', required: false,
          placeholder: 'Botox, preenchimento, peeling, etc. ou digite "Nunca fiz"' },
        { id: 'produtos_utilizados', type: 'textarea', label: 'Que produtos você usa na pele atualmente?', required: false,
          placeholder: 'Cremes, séruns, protetores solares, etc.' }
      ]
    },
    {
      id: 'lifestyle',
      title: 'Estilo de Vida',
      description: 'Hábitos que podem influenciar o tratamento',
      fields: [
        { id: 'exposicao_solar', type: 'select', label: 'Com que frequência se expõe ao sol?', required: true,
          options: ['Raramente', 'Algumas vezes por semana', 'Diariamente', 'Trabalho exposto ao sol'] },
        { id: 'tabagismo', type: 'radio', label: 'Fuma?', required: true,
          options: ['Não', 'Sim, ocasionalmente', 'Sim, diariamente'] },
        { id: 'alcool', type: 'radio', label: 'Consome bebidas alcoólicas?', required: true,
          options: ['Não', 'Socialmente', 'Regularmente'] },
        { id: 'exercicios', type: 'select', label: 'Pratica exercícios físicos?', required: false,
          options: ['Não pratico', 'Raramente', '1-2 vezes por semana', '3-4 vezes por semana', 'Diariamente'] }
      ]
    },
    {
      id: 'consent',
      title: 'Consentimento',
      description: 'Confirmação e autorização',
      fields: [
        { id: 'informacoes_verdadeiras', type: 'checkbox', label: 'Declaro que todas as informações fornecidas são verdadeiras', required: true },
        { id: 'autorizacao_contato', type: 'checkbox', label: 'Autorizo o contato para agendamento e confirmação de consultas', required: true },
        { id: 'lgpd_consentimento', type: 'checkbox', label: 'Concordo com o tratamento dos meus dados pessoais conforme a LGPD', required: true }
      ]
    }
  ];

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return 'Este campo é obrigatório';
    }

    if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return 'Digite um e-mail válido';
    }

    if (field.type === 'phone' && value && !/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(value)) {
      return 'Digite um telefone válido (ex: (11) 99999-9999)';
    }

    return null;
  };

  const validateCurrentSection = (): boolean => {
    if (!sections[currentSection]) return true;
    
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    sections[currentSection].fields.forEach(field => {
      const error = validateField(field, formData[field.id]);
      if (error) {
        newErrors[field.id] = error;
        isValid = false;
      }
    });

    setValidationErrors(newErrors);
    return isValid;
  };

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[fieldId]) {
      setValidationErrors(prev => ({ ...prev, [fieldId]: '' }));
    }
  };

  const nextSection = () => {
    if (validateCurrentSection() && currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      window.scrollTo(0, 0);
    }
  };

  const submitForm = async () => {
    if (!validateCurrentSection()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`/api/anamnesis/public/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao enviar formulário');
        return;
      }

      await response.json();
      setSuccess(true);
      
      // Show success message for a few seconds then redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = validationErrors[field.id];
    const value = formData[field.id] || '';

    const baseInputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
      hasError ? 'border-red-500 bg-red-50' : 'border-gray-300'
    }`;

    switch (field.type) {
      case 'text':
      case 'email':
      case 'phone':
        return (
          <input
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleFieldChange(field.id, parseInt(e.target.value) || '')}
            placeholder={field.placeholder}
            className={baseInputClasses}
            min={field.id === 'idade' ? 1 : undefined}
            max={field.id === 'idade' ? 120 : undefined}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            rows={4}
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );

      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClasses}
          >
            <option value="">Selecione uma opção</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        if (field.options) {
          // Multiple checkboxes
          const currentValues = Array.isArray(value) ? value : [];
          return (
            <div className="space-y-3">
              {field.options.map(option => (
                <label key={option} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={currentValues.includes(option)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...currentValues, option]
                        : currentValues.filter((v: string) => v !== option);
                      handleFieldChange(field.id, newValues);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single checkbox
          return (
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
              />
              <span className="text-gray-700 text-sm leading-relaxed">{field.label}</span>
            </label>
          );
        }

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando formulário...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops!</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
          >
            Ir para início
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Anamnese Enviada!</h2>
          <p className="text-gray-600 mb-6">
            Obrigado por preencher sua anamnese. Os dados foram enviados com sucesso para a clínica.
          </p>
          <p className="text-sm text-gray-500">
            Você será redirecionado automaticamente...
          </p>
        </div>
      </div>
    );
  }

  const currentSectionData = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-emerald-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            {formInfo?.clinic_logo && (
              <img 
                src={formInfo.clinic_logo} 
                alt="Logo" 
                className="h-12 w-auto"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formInfo?.clinic_name || 'Clínica'}
              </h1>
              <p className="text-gray-600">Anamnese Digital - {formInfo?.patient_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Seção {currentSection + 1} de {sections.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% concluído
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg">
          {/* Section Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center">
                {currentSection === 0 && <User className="w-5 h-5 text-white" />}
                {currentSection === 1 && <Heart className="w-5 h-5 text-white" />}
                {currentSection === 2 && <Stethoscope className="w-5 h-5 text-white" />}
                {currentSection === 3 && <Clock className="w-5 h-5 text-white" />}
                {currentSection === 4 && <Shield className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{currentSectionData?.title}</h2>
                {currentSectionData?.description && (
                  <p className="text-gray-600">{currentSectionData.description}</p>
                )}
              </div>
            </div>

            {/* Expiration Warning */}
            {formInfo?.expires_at && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Este formulário expira em {new Date(formInfo.expires_at).toLocaleDateString('pt-BR')} às {new Date(formInfo.expires_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="p-6 space-y-6">
            {currentSectionData?.fields.map(field => (
              <div key={field.id}>
                {field.type !== 'checkbox' || field.options ? (
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                ) : null}
                
                {renderField(field)}
                
                {validationErrors[field.id] && (
                  <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>{validationErrors[field.id]}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex justify-between">
              <button
                onClick={prevSection}
                disabled={currentSection === 0}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              {currentSection < sections.length - 1 ? (
                <button
                  onClick={nextSection}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-emerald-500 text-white rounded-lg hover:from-blue-600 hover:to-emerald-600 transition-all duration-200 shadow-lg"
                >
                  <span>Próximo</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={submitForm}
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Anamnese</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Suas informações são confidenciais e protegidas pela LGPD
          </p>
        </div>
      </div>
    </div>
  );
}
