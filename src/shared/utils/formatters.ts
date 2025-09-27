// Formatadores de dados comuns

export const formatters = {
  // Formatação de moeda
  currency: (value: number, currency = 'BRL'): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value);
  },

  // Formatação de números
  number: (value: number, minimumFractionDigits = 0): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits,
    }).format(value);
  },

  // Formatação de porcentagem
  percentage: (value: number, minimumFractionDigits = 1): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits,
    }).format(value / 100);
  },

  // Formatação de data
  date: (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    };

    return new Intl.DateTimeFormat('pt-BR', options || defaultOptions).format(dateObj);
  },

  // Formatação de data e hora
  datetime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  },

  // Formatação de hora
  time: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  },

  // Formatação de telefone brasileiro
  phone: (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
  },

  // Formatação de CPF
  cpf: (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    
    return cpf;
  },

  // Formatação de CEP
  cep: (cep: string): string => {
    const cleaned = cep.replace(/\D/g, '');
    
    if (cleaned.length === 8) {
      return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
    }
    
    return cep;
  },

  // Formatação de texto para título (primeira letra maiúscula)
  title: (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  // Truncar texto
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  },

  // Formatação de tamanho de arquivo
  fileSize: (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  },

  // Formatação de tempo relativo (ex: "há 2 horas")
  relativeTime: (date: string | Date): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `há ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `há ${days} dia${days > 1 ? 's' : ''}`;
    } else {
      return formatters.date(dateObj);
    }
  },

  // Calcular idade a partir da data de nascimento
  calculateAge: (birthDate: string | Date): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Formatação de data simples (alias para compatibilidade)
  formatDate: (date: string | Date): string => {
    return formatters.date(date);
  },

  // Formatação de CPF (alias para compatibilidade)
  formatCPF: (cpf: string): string => {
    return formatters.cpf(cpf);
  },
};