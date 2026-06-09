export const WEBHOOK_URL =
  import.meta.env.VITE_WEBHOOK_URL ||
  'https://n8nwebhook.server2.wolframe.app/webhook/4d138bce-e3ea-44cf-bdc8-246b8d8344b9';

export const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '5511999999999';

export const PROJECT_TYPE_LABELS: Record<string, string> = {
  web: 'Sistema Web/SaaS',
  mobile: 'Aplicativo Mobile',
  ai: 'Solução com Inteligência Artificial',
  outro: 'Outro',
};

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  ideia: 'apenas uma ideia',
  iniciado: 'iniciado mas incompleto',
  refazer: 'já existente mas precisando ser refeito',
};

export const PROJECT_STATUS_OPTIONS = [
  { id: 'ideia', label: 'Apenas uma ideia' },
  { id: 'iniciado', label: 'Iniciado mas incompleto' },
  { id: 'refazer', label: 'Já existe mas precisa ser refeito' },
];

export const BUDGET_OPTIONS = [
  { id: 'agora', label: 'Tenho esse orçamento disponível e quero começar agora' },
  { id: 'prazos', label: 'Posso investir esse valor mas preciso entender melhor os prazos' },
  { id: 'menor', label: 'Meu orçamento é menor no momento' },
];

export const STEP_DOT_LABELS = ['Projeto', 'Status', 'Orçamento', 'Dados'];
