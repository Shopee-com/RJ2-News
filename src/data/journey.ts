import type { JourneyStep } from '@/types'

export const journey: JourneyStep[] = [
  {
    id: 'j1',
    order: 1,
    key: 'coleta',
    name: 'Coleta',
    short: 'Origem da jornada reversa.',
    description:
      'A coleta é o ponto de partida da jornada reversa. Envolve a retirada do item junto ao cliente ou ponto de coleta e o início do rastreamento reverso.',
    objective: 'Garantir a retirada correta e o rastreamento desde a origem.',
    responsibles: ['Coordenação de Coleta', 'Operação de Campo'],
    relatedPop: 'POP 001',
    indicators: ['Prazo de coleta', 'Acurácia de rastreio', 'Taxa de sucesso de coleta'],
    bestPractices: [
      'Confirmar dados do item na origem.',
      'Registrar o rastreio imediatamente.',
      'Validar embalagem antes do transporte.',
    ],
    risks: ['Item incorreto', 'Falha de rastreio', 'Avaria no transporte'],
    tools: ['App de Coleta', 'Sistema de Rastreio'],
  },
  {
    id: 'j2',
    order: 2,
    key: 'recebimento',
    name: 'Recebimento',
    short: 'Entrada no centro reverso.',
    description:
      'O recebimento registra a entrada da carga reversa no centro, com conferência de manifesto e segregação inicial.',
    objective: 'Registrar e conferir a entrada com precisão.',
    responsibles: ['Coordenação Inbound', 'Equipe de Stage In'],
    relatedPop: 'POP 001',
    indicators: ['Tempo de Stage In', 'Divergência de manifesto', 'Backlog de recebimento'],
    bestPractices: [
      'Conferir manifesto contra volumes.',
      'Registrar entrada em tempo real.',
      'Segregar por tipo de devolução.',
    ],
    risks: ['Divergência de manifesto', 'Backlog acumulado'],
    tools: ['Stage In', 'Controle de Ativos'],
  },
  {
    id: 'j3',
    order: 3,
    key: 'triagem',
    name: 'Triagem',
    short: 'Separação e classificação de itens.',
    description:
      'Conferência, separação e classificação dos produtos de acordo com o tipo de devolução. É o coração da jornada reversa.',
    objective: 'Classificar corretamente cada item com acurácia e agilidade.',
    responsibles: ['Qualidade Reversa', 'Analistas de Triagem'],
    relatedPop: 'POP 002',
    indicators: ['Acurácia de triagem', 'Produtividade (pph)', 'Registro de exceções'],
    bestPractices: [
      'Validar etiqueta e lacre.',
      'Conferência dupla em itens críticos.',
      'Registrar exceções na hora.',
    ],
    risks: ['Classificação incorreta', 'Retrabalho', 'Perda de rastreio'],
    tools: ['Sistema de Classificação', 'Controle ABS'],
  },
  {
    id: 'j4',
    order: 4,
    key: 'processamento',
    name: 'Processamento',
    short: 'Definição de destino do item.',
    description:
      'Avaliação do estado do produto (EHA) e definição do destino: recuperação, retorno ao vendedor ou descarte.',
    objective: 'Dar o destino correto a cada item processado.',
    responsibles: ['Coordenação EHA', 'BR Recovery'],
    relatedPop: 'POP 003',
    indicators: ['Loss & Damage', 'Taxa de recuperação', 'Tempo de processamento'],
    bestPractices: [
      'Avaliar estado com critério padronizado.',
      'Tratar avarias e aparas conforme POP.',
      'Atualizar status no sistema.',
    ],
    risks: ['Destino incorreto', 'Perda de valor', 'Avaria não registrada'],
    tools: ['BR Recovery', 'Controle de Avarias'],
  },
  {
    id: 'j5',
    order: 5,
    key: 'destino-final',
    name: 'Destino Final',
    short: 'Expedição e fechamento da jornada.',
    description:
      'Expedição do item ao destino definido, com roteirização, documentação e fechamento do ciclo reverso.',
    objective: 'Concluir a jornada com rastreio e documentação completos.',
    responsibles: ['Coordenação Outbound', 'Roteirização'],
    relatedPop: 'POP 004',
    indicators: ['SLA de expedição', 'MisRoute', 'Acurácia de saída'],
    bestPractices: [
      'Consolidar por destino.',
      'Conferir carga antes do embarque.',
      'Registrar expedição e atualizar rastreio.',
    ],
    risks: ['MisRoute', 'Documentação incompleta'],
    tools: ['Roteirização Inteligente', 'Gerador de Relatório'],
  },
]

export function getJourneyStep(key: string): JourneyStep | undefined {
  return journey.find((j) => j.key === key)
}
