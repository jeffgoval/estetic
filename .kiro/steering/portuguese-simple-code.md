---
inclusion: always
---

# Diretrizes de Desenvolvimento

## Idioma
- Todas as respostas devem ser em português brasileiro
- Comentários no código devem ser em português
- Documentação e explicações sempre em português

## Estilo de Código
- Escrever código simples, limpo e legível
- Priorizar segurança em todas as implementações
- Garantir funcionalidade completa antes de otimizações
- Usar nomes de variáveis e funções descritivos em português quando apropriado
- Evitar complexidade desnecessária
- Implementar validações adequadas
- Seguir princípios de desenvolvimento seguro

## Componentização Extrema
- Quebrar componentes em partes menores e reutilizáveis
- Cada componente deve ter uma única responsabilidade
- Criar componentes atômicos para elementos básicos (botões, inputs, cards)
- Separar lógica de apresentação em hooks customizados
- Usar composição ao invés de herança
- Componentes devem ser facilmente testáveis e reutilizáveis
- Extrair constantes e configurações para arquivos separados

## Práticas de Segurança
- Sempre validar inputs do usuário
- Sanitizar dados antes de usar
- Implementar tratamento de erros adequado
- Usar tipos TypeScript rigorosos
- Evitar exposição de dados sensíveis

## Execução Focada
- Executar somente o que foi pedido, nada mais
- Não adicionar funcionalidades extras não solicitadas
- Manter o escopo restrito ao solicitado
- Evitar implementações desnecessárias
- Não executar testes