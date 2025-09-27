# Requirements Document

## Introduction

Este documento define os requisitos para criar um sistema de gestão clínica moderno e limpo, aproveitando a lógica de negócio do sistema atual mas com uma implementação simplificada usando Nhost como backend. O sistema será focado em clínicas de estética, oferecendo funcionalidades essenciais de gestão de pacientes, agendamentos, profissionais e estoque de forma intuitiva e eficiente.

## Requirements

### Requirement 1 - Autenticação e Multi-tenancy

**User Story:** Como proprietário de clínica, eu quero um sistema seguro onde apenas usuários autorizados possam acessar os dados da minha clínica, para que as informações dos pacientes sejam protegidas.

#### Acceptance Criteria

1. WHEN um usuário acessa o sistema THEN o sistema SHALL exigir autenticação via Google OAuth
2. WHEN um usuário se autentica pela primeira vez THEN o sistema SHALL criar automaticamente um tenant (clínica) para ele
3. WHEN um usuário autenticado acessa o sistema THEN o sistema SHALL mostrar apenas dados do seu tenant
4. WHEN um proprietário de clínica convida outros usuários THEN o sistema SHALL permitir diferentes níveis de permissão (admin, profissional, recepcionista)

### Requirement 2 - Gestão de Pacientes

**User Story:** Como recepcionista, eu quero gerenciar informações dos pacientes de forma simples, para que eu possa manter dados atualizados e acessíveis.

#### Acceptance Criteria

1. WHEN eu acesso a seção de pacientes THEN o sistema SHALL mostrar uma lista de todos os pacientes ativos
2. WHEN eu clico em "Novo Paciente" THEN o sistema SHALL abrir um formulário para cadastro
3. WHEN eu preencho os dados obrigatórios (nome) THEN o sistema SHALL salvar o paciente
4. WHEN eu preencho dados opcionais (telefone, email, CPF, data nascimento, endereço) THEN o sistema SHALL armazenar essas informações
5. WHEN eu edito um paciente THEN o sistema SHALL atualizar as informações
6. WHEN eu desativo um paciente THEN o sistema SHALL manter o histórico mas ocultar da lista principal

### Requirement 3 - Gestão de Profissionais

**User Story:** Como administrador da clínica, eu quero gerenciar os profissionais que trabalham na clínica, para que eu possa organizar os agendamentos adequadamente.

#### Acceptance Criteria

1. WHEN eu acesso a seção de profissionais THEN o sistema SHALL mostrar todos os profissionais ativos
2. WHEN eu cadastro um novo profissional THEN o sistema SHALL exigir nome e permitir especialidade, registro profissional, telefone e email
3. WHEN eu defino horários de trabalho THEN o sistema SHALL usar essa informação para agendamentos
4. WHEN eu desativo um profissional THEN o sistema SHALL manter histórico mas impedir novos agendamentos

### Requirement 4 - Sistema de Agendamentos

**User Story:** Como recepcionista, eu quero agendar consultas e procedimentos de forma visual e intuitiva, para que eu possa otimizar a agenda dos profissionais.

#### Acceptance Criteria

1. WHEN eu acesso a agenda THEN o sistema SHALL mostrar uma visualização em calendário
2. WHEN eu clico em um horário vazio THEN o sistema SHALL abrir formulário de novo agendamento
3. WHEN eu crio um agendamento THEN o sistema SHALL exigir paciente, profissional, data/hora início e fim
4. WHEN eu arrasto um agendamento THEN o sistema SHALL permitir reagendar
5. WHEN eu clico em um agendamento THEN o sistema SHALL permitir editar ou alterar status
6. WHEN há conflito de horários THEN o sistema SHALL alertar e impedir sobreposição

### Requirement 5 - Gestão de Estoque

**User Story:** Como administrador, eu quero controlar o estoque de materiais e produtos, para que eu possa evitar faltas e controlar custos.

#### Acceptance Criteria

1. WHEN eu acesso o estoque THEN o sistema SHALL mostrar todos os materiais com quantidades atuais
2. WHEN eu cadastro um material THEN o sistema SHALL permitir nome, categoria, estoque mínimo/máximo, custo unitário
3. WHEN eu registro entrada de material THEN o sistema SHALL aumentar o estoque e registrar custo
4. WHEN eu registro saída/consumo THEN o sistema SHALL diminuir o estoque
5. WHEN o estoque fica abaixo do mínimo THEN o sistema SHALL gerar alerta
6. WHEN eu visualizo relatórios THEN o sistema SHALL mostrar consumo por período e custos

### Requirement 6 - Lista de Espera

**User Story:** Como recepcionista, eu quero gerenciar uma lista de espera para otimizar o aproveitamento de horários vagos.

#### Acceptance Criteria

1. WHEN um paciente não consegue horário desejado THEN eu posso adicioná-lo à lista de espera
2. WHEN eu adiciono à lista de espera THEN o sistema SHALL permitir definir preferências de data/hora e prioridade
3. WHEN surge uma vaga THEN o sistema SHALL sugerir pacientes da lista de espera compatíveis
4. WHEN eu confirmo um agendamento da lista THEN o sistema SHALL remover automaticamente da espera

### Requirement 7 - Dashboard e Relatórios

**User Story:** Como proprietário da clínica, eu quero visualizar indicadores importantes do negócio, para que eu possa tomar decisões informadas.

#### Acceptance Criteria

1. WHEN eu acesso o dashboard THEN o sistema SHALL mostrar agendamentos do dia, pacientes atendidos, receita
2. WHEN eu acesso relatórios THEN o sistema SHALL permitir filtrar por período, profissional, procedimento
3. WHEN eu gero relatório financeiro THEN o sistema SHALL mostrar receitas, custos de materiais e margem
4. WHEN eu visualizo relatório de produtividade THEN o sistema SHALL mostrar atendimentos por profissional

### Requirement 8 - Sistema de Anamnese Digital

**User Story:** Como profissional, eu quero coletar informações de anamnese de forma digital, para que eu possa ter histórico completo e detectar contraindicações.

#### Acceptance Criteria

1. WHEN eu crio um formulário de anamnese THEN o sistema SHALL permitir campos personalizáveis
2. WHEN eu envio anamnese para paciente THEN o sistema SHALL gerar link único com prazo de validade
3. WHEN paciente preenche anamnese THEN o sistema SHALL validar respostas e detectar alertas
4. WHEN há palavras-chave de risco THEN o sistema SHALL destacar para atenção do profissional
5. WHEN anamnese é concluída THEN o sistema SHALL permitir gerar protocolo de tratamento

### Requirement 9 - Configurações e Personalização

**User Story:** Como administrador, eu quero personalizar o sistema conforme as necessidades da clínica, para que ele se adapte ao nosso fluxo de trabalho.

#### Acceptance Criteria

1. WHEN eu acesso configurações THEN o sistema SHALL permitir alterar nome da clínica, logo, cores
2. WHEN eu configuro categorias THEN o sistema SHALL permitir criar categorias para procedimentos e materiais
3. WHEN eu defino permissões THEN o sistema SHALL controlar acesso por tipo de usuário
4. WHEN eu configuro notificações THEN o sistema SHALL permitir ativar/desativar alertas

### Requirement 10 - Interface Responsiva e Moderna

**User Story:** Como usuário do sistema, eu quero uma interface moderna e responsiva, para que eu possa usar o sistema em qualquer dispositivo.

#### Acceptance Criteria

1. WHEN eu acesso o sistema em desktop THEN a interface SHALL ser otimizada para telas grandes
2. WHEN eu acesso em tablet/mobile THEN a interface SHALL se adaptar ao tamanho da tela
3. WHEN eu navego pelo sistema THEN a interface SHALL ser intuitiva e seguir padrões modernos
4. WHEN eu realizo ações THEN o sistema SHALL fornecer feedback visual imediato
5. WHEN há erros THEN o sistema SHALL mostrar mensagens claras e acionáveis