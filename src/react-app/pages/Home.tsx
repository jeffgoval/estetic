import { useAuth } from '@getmocha/users-service/react';
import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { 
  Star, 
  Shield, 
  Clock, 
  Users, 
  Award, 
  Sparkles,
  ChevronRight,
  Phone,
  CheckCircle,
  MapPin,
  Calendar
} from 'lucide-react';

export default function Home() {
  const { user, isPending, redirectToLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    preferencia: 'whatsapp'
  });

  useEffect(() => {
    if (!isPending && user?.id) {
      navigate('/dashboard');
    }
  }, [user?.id, isPending, navigate]); // Only depend on user.id to avoid unnecessary re-renders

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-warm-beige to-off-white flex items-center justify-center">
        <div className="animate-pulse text-primary-600 font-inter">Carregando...</div>
      </div>
    );
  }

  // Função removida pois CTAs estão desabilitados

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Formulário desabilitado para esta versão de demonstração
    alert('Funcionalidade temporariamente indisponível. Entre em contato diretamente pelos nossos canais.');
  };

  const credenciais = [
    {
      icon: Award,
      titulo: "Mais de 15 Anos",
      subtitulo: "de Excelência"
    },
    {
      icon: Users,
      titulo: "500+ Personalidades",
      subtitulo: "Atendidas com Discrição"
    },
    {
      icon: Shield,
      titulo: "100% Sigilo",
      subtitulo: "Protocolo de Confidencialidade"
    },
    {
      icon: Star,
      titulo: "Equipe Certificada",
      subtitulo: "Internacionalmente"
    }
  ];

  const tratamentos = [
    {
      titulo: "Rejuvenescimento Facial Personalizado",
      descricao: "Tratamentos exclusivos que respeitam sua naturalidade, com resultados sutis e sofisticados que realçam sua beleza única.",
      destaque: "Resultados Naturais"
    },
    {
      titulo: "Contorno Corporal Exclusivo",
      descricao: "Tecnologias de ponta aplicadas com técnicas refinadas para esculpir silhuetas harmoniosas de forma discreta.",
      destaque: "Tecnologia Avançada"
    },
    {
      titulo: "Terapias Regenerativas Premium",
      descricao: "Tratamentos inovadores que estimulam a regeneração natural da pele, proporcionando juventude e vitalidade duradouras.",
      destaque: "Inovação Científica"
    },
    {
      titulo: "Harmonização Natural",
      descricao: "Procedimentos delicados que equilibram traços faciais preservando características pessoais e expressividade natural.",
      destaque: "Equilíbrio Perfeito"
    }
  ];

  const diferenciais = [
    {
      icon: MapPin,
      titulo: "Entrada Privativa",
      descricao: "Acesso exclusivo e segurança reforçada para garantir total privacidade"
    },
    {
      icon: Clock,
      titulo: "Agenda Flexível",
      descricao: "Atendimento fora do horário comercial e fins de semana"
    },
    {
      icon: Phone,
      titulo: "Acompanhamento VIP",
      descricao: "Suporte dedicado 24/7 durante todo o processo"
    },
    {
      icon: Shield,
      titulo: "Protocolo de Sigilo",
      descricao: "Confidencialidade absoluta em todos os procedimentos"
    }
  ];

  const depoimentos = [
    {
      texto: "A discrição e o profissionalismo de Suavizar são incomparáveis. Os resultados são sutis e exatamente o que eu buscava.",
      autor: "A.M.",
      profissao: "Apresentadora"
    },
    {
      texto: "Encontrei aqui o que sempre procurei: excelência técnica aliada ao cuidado personalizado que minha agenda exige.",
      autor: "R.S.",
      profissao: "Empresário"
    },
    {
      texto: "O protocolo de confidencialidade e a qualidade dos resultados superaram todas as minhas expectativas.",
      autor: "C.L.",
      profissao: "Atriz"
    }
  ];

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-primary-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img 
                src="https://mocha-cdn.com/01997dc7-b939-776d-9169-34f23a637d35/logo2.png" 
                alt="Suavizar"
                className="h-8 w-auto"
              />
              <span className="text-xl font-inter font-semibold text-neutral-800">
                Suavizar
              </span>
            </div>
            <button
              onClick={redirectToLogin}
              className="bg-primary-500 hover:bg-primary-hover text-primary-foreground px-4 py-2 sm:px-6 sm:py-2 rounded-full font-inter font-medium text-sm sm:text-base transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Entrar
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-beige via-off-white to-accent relative">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fill-rule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23B08660&quot; fill-opacity=&quot;0.04&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;1&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-inter font-bold text-neutral-800 mb-3 leading-none tracking-wide">
              <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                CLÍNICA SUAVIZAR
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl font-inter font-light text-neutral-600 mb-12 tracking-widest">
              ESTÉTICA ESPECIALIZADA
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
            <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 text-primary-foreground px-4 py-3 sm:px-8 sm:py-4 rounded-full font-inter font-medium sm:font-semibold text-sm sm:text-lg shadow-xl opacity-75 cursor-not-allowed flex items-center space-x-2 sm:space-x-3">
              <span className="whitespace-nowrap">Agendar Horário</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
            </div>
            
            <div className="flex items-center space-x-2 text-neutral-600 font-inter text-sm sm:text-base">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
              <span className="whitespace-nowrap">Consulta Sem Compromisso</span>
            </div>
          </div>
        </div>
      </section>

      {/* Credibilidade */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {credenciais.map((credencial, index) => {
              const Icon = credencial.icon;
              return (
                <div 
                  key={index}
                  className="text-center group"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-inter font-semibold text-neutral-800 mb-2">
                    {credencial.titulo}
                  </h3>
                  <p className="text-neutral-600 font-inter">
                    {credencial.subtitulo}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tratamentos */}
      <section className="py-20 bg-gradient-to-br from-soft-beige to-warm-beige">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-inter font-bold text-neutral-800 mb-6">
              Tratamentos Exclusivos
            </h2>
            <p className="text-xl font-inter text-neutral-600 max-w-3xl mx-auto">
              Cada procedimento é uma experiência única, desenvolvida especialmente para revelar sua melhor versão
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {tratamentos.map((tratamento, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-primary-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-inter font-medium">
                    {tratamento.destaque}
                  </div>
                  <Sparkles className="w-6 h-6 text-primary-500" />
                </div>
                <h3 className="text-2xl font-inter font-semibold text-neutral-800 mb-4">
                  {tratamento.titulo}
                </h3>
                <p className="text-neutral-600 font-inter leading-relaxed">
                  {tratamento.descricao}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-inter font-bold text-neutral-800 mb-6">
              Experiência VIP Completa
            </h2>
            <p className="text-xl font-inter text-neutral-600 max-w-3xl mx-auto">
              Cada detalhe pensado para proporcionar máximo conforto, privacidade e excelência
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {diferenciais.map((diferencial, index) => {
              const Icon = diferencial.icon;
              return (
                <div 
                  key={index}
                  className="text-center group"
                >
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-inter font-semibold text-neutral-800 mb-3">
                    {diferencial.titulo}
                  </h3>
                  <p className="text-neutral-600 font-inter">
                    {diferencial.descricao}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-20 bg-gradient-to-br from-neutral-800 to-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-inter font-bold text-white mb-6">
              Depoimentos Exclusivos
            </h2>
            <p className="text-xl font-inter text-neutral-300 max-w-3xl mx-auto">
              A confiança de quem valoriza excelência e discrição
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {depoimentos.map((depoimento, index) => (
              <div 
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <Star key={`testimonial-star-${index}-${starIndex}`} className="w-5 h-5 text-warning fill-current" />
                  ))}
                </div>
                <blockquote className="text-white font-inter italic text-lg mb-6 leading-relaxed">
                  "{depoimento.texto}"
                </blockquote>
                <div className="border-t border-white/20 pt-4">
                  <cite className="text-primary-200 font-inter font-semibold">
                    {depoimento.autor} - {depoimento.profissao}
                  </cite>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final com Formulário */}
      <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white mr-2 sm:mr-3 flex-shrink-0" />
              <span className="bg-error text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full font-inter font-medium sm:font-semibold text-xs sm:text-sm whitespace-nowrap">
                AGENDA LIMITADA
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-inter font-bold text-white mb-6 leading-tight">
              Reserve Sua Avaliação Exclusiva
            </h2>
            
            <p className="text-base sm:text-lg lg:text-xl font-inter text-white/90 mb-8 leading-relaxed">
              Apenas 12 vagas mensais para novos clientes. 
              <span className="block font-semibold mt-1 sm:mt-2">
                Garante já a sua consulta personalizada.
              </span>
            </p>

            <form onSubmit={handleFormSubmit} className="max-w-md mx-auto space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-full font-inter text-sm sm:text-base bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-75 cursor-not-allowed"
                  disabled
                />
              </div>
              
              <div>
                <input
                  type="tel"
                  placeholder="WhatsApp para contato"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 rounded-full font-inter text-sm sm:text-base bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 opacity-75 cursor-not-allowed"
                  disabled
                />
              </div>

              <div className="flex items-center justify-center space-x-4 sm:space-x-6 text-white font-inter opacity-75 text-sm sm:text-base">
                <label className="flex items-center space-x-1 sm:space-x-2 cursor-not-allowed">
                  <input
                    type="radio"
                    name="preferencia"
                    value="whatsapp"
                    checked={formData.preferencia === 'whatsapp'}
                    onChange={(e) => setFormData({...formData, preferencia: e.target.value})}
                    className="text-white"
                    disabled
                  />
                  <span className="whitespace-nowrap">WhatsApp</span>
                </label>
                <label className="flex items-center space-x-1 sm:space-x-2 cursor-not-allowed">
                  <input
                    type="radio"
                    name="preferencia"
                    value="ligacao"
                    checked={formData.preferencia === 'ligacao'}
                    onChange={(e) => setFormData({...formData, preferencia: e.target.value})}
                    className="text-white"
                    disabled
                  />
                  <span className="whitespace-nowrap">Ligação</span>
                </label>
              </div>

              <div className="w-full bg-white text-primary-600 px-4 py-3 sm:px-8 sm:py-4 rounded-full font-inter font-semibold sm:font-bold text-base sm:text-lg shadow-xl opacity-75 cursor-not-allowed text-center">
                <span className="whitespace-nowrap">Quero Minha Consulta VIP</span>
              </div>
            </form>

            <p className="text-white/80 font-inter text-xs sm:text-sm mt-6 px-2">
              Retorno em até 2 horas • Consulta sem compromisso • 100% confidencial
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="https://mocha-cdn.com/01997dc7-b939-776d-9169-34f23a637d35/logo2.png" 
              alt="Suavizar"
              className="h-8 w-auto opacity-80"
            />
            <span className="text-2xl font-inter font-semibold">Suavizar</span>
          </div>
          <p className="text-neutral-400 font-inter mb-4">
            Estética Especializada
          </p>
          <p className="text-neutral-500 font-inter text-sm">
            © 2024 Suavizar. Discrição, elegância e resultados excepcionais.
          </p>
        </div>
      </footer>
    </div>
  );
}
