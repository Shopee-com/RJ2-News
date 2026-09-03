import type { NewsArticle, Category } from '@/types'
import { photo } from '@/lib/media'

export const NEWS_CATEGORIES: (Category | 'Todos')[] = [
  'Todos',
  'Operação',
  'Processos',
  'Performance',
  'Pessoas',
  'Comunicados',
  'Treinamentos',
  'Projetos',
]

export const news: NewsArticle[] = [
  {
    id: 'n1',
    slug: 'padronizacao-que-gera-resultado',
    category: 'Operação',
    title: 'Padronização que gera resultado',
    excerpt:
      'Processos integrados, pessoas comprometidas e dados inteligentes para transformar a experiência reversa.',
    content: [
      'A padronização dos processos da Logística Reversa deixou de ser um objetivo distante para se tornar prática diária nas operações. Ao combinar procedimentos claros, pessoas comprometidas e dados inteligentes, a Reversa vem transformando a forma como cada devolução é tratada.',
      'O novo modelo de padronização parte de três pilares: processos integrados de ponta a ponta, capacitação contínua das equipes e leitura constante dos indicadores. Cada etapa da jornada — da coleta ao destino final — passou a ter um POP de referência, reduzindo variação e aumentando a previsibilidade.',
      'Os primeiros resultados já aparecem nos números. A acurácia da triagem subiu, o retrabalho caiu e o tempo médio de processamento por item diminuiu de forma consistente nas regionais que adotaram o padrão completo.',
      '“Quando todo mundo segue o mesmo caminho, o resultado deixa de depender do heroísmo individual e passa a ser do time”, resume a coordenação da Reversa. O próximo passo é escalar o modelo para todas as operações até o fim do trimestre.',
    ],
    image: photo('hero-padronizacao', 1200, 700),
    date: '2026-05-26',
    author: 'Comunicação Reversa',
    authorRole: 'Área de Reversa',
    readingMinutes: 4,
    views: 1284,
    featured: true,
  },
  {
    id: 'n2',
    slug: 'novo-fluxo-triagem-eficiencia-15',
    category: 'Operação',
    title: 'Novo fluxo de triagem reversa aumenta eficiência em 15%',
    excerpt:
      'Implementamos melhorias que geram mais agilidade e redução de erros operacionais na triagem.',
    content: [
      'O novo fluxo de triagem reversa entrou em operação e já entrega ganho de 15% em eficiência. A mudança reorganiza as estações de trabalho e introduz a conferência dupla em pontos críticos.',
      'Entre as melhorias estão a separação por tipo de devolução logo na entrada, a validação de etiquetas e lacres antes do encaminhamento e o registro imediato de exceções. Isso reduz o vai e volta de itens e acelera a decisão sobre o destino de cada produto.',
      'A equipe recebeu treinamento prático antes do go-live, e o acompanhamento dos indicadores nas primeiras semanas confirma a queda de erros e o aumento da produtividade por hora.',
    ],
    image: photo('triagem-fluxo', 1200, 700),
    date: '2026-05-26',
    author: 'Equipe de Processos',
    authorRole: 'Reversa RJ2',
    readingMinutes: 3,
    views: 942,
  },
  {
    id: 'n3',
    slug: 'atualizacao-pop-002-triagem',
    category: 'Processos',
    title: 'Atualização no POP 002 — Triagem',
    excerpt: 'Confira as mudanças e o que você precisa saber para seguir o novo procedimento.',
    content: [
      'O POP 002 — Triagem foi atualizado para a versão 2.3. A revisão incorpora aprendizados do novo fluxo e detalha os critérios de classificação por tipo de devolução.',
      'As principais mudanças estão na conferência de integridade da embalagem, na validação de lacres e na forma de registrar exceções. O documento também traz exemplos visuais para facilitar o treinamento.',
      'Recomendamos que todas as lideranças revisem o material com suas equipes e confirmem a leitura no portal.',
    ],
    image: photo('pop-002', 1200, 700),
    date: '2026-05-23',
    author: 'Gestão de POP',
    authorRole: 'Qualidade Reversa',
    readingMinutes: 2,
    views: 613,
  },
  {
    id: 'n4',
    slug: 'indicadores-semanais-da-operacao',
    category: 'Performance',
    title: 'Indicadores semanais da operação',
    excerpt: 'Veja o desempenho da semana anterior e os principais comparativos.',
    content: [
      'Fechamos mais uma semana com evolução nos principais indicadores da Reversa. O ABS ficou abaixo da meta e a produtividade seguiu próxima do objetivo de 7.200 pph.',
      'O destaque foi a redução de Loss & Damage, resultado direto do reforço na conferência e no manuseio dos itens de maior valor.',
      'Os comparativos completos estão disponíveis na área de Dados, com abertura por regional e por turno.',
    ],
    image: photo('indicadores', 1200, 700),
    date: '2026-05-21',
    author: 'BI Reversa',
    authorRole: 'Performance',
    readingMinutes: 3,
    views: 771,
  },
  {
    id: 'n5',
    slug: 'reconhecimento-time-rj2',
    category: 'Pessoas',
    title: 'Parabéns ao time RJ2 pelo resultado da semana',
    excerpt: 'Disciplina, comunicação ativa e foco em acurácia levaram o RJ2 ao topo do modelo da semana.',
    content: [
      'O time RJ2 é o destaque da semana. Com foco em acurácia e agilidade, a equipe cumpriu o SLA de separação, validou 100% das etiquetas e lacres e manteve a comunicação ativa entre turnos.',
      'O reconhecimento reforça a cultura de disciplina operacional que a Reversa vem construindo. Parabéns a todos que fazem a diferença todos os dias.',
    ],
    image: photo('time-rj2', 1200, 700),
    date: '2026-05-20',
    author: 'Comunicação Reversa',
    authorRole: 'Área de Reversa',
    readingMinutes: 2,
    views: 1102,
  },
  {
    id: 'n6',
    slug: 'campanha-do-agasalho-2026',
    category: 'Comunicados',
    title: 'Campanha do Agasalho 2026 — Participe!',
    excerpt: 'A Reversa também transforma vidas. Doe agasalhos nos pontos de coleta das regionais.',
    content: [
      'Está aberta a Campanha do Agasalho 2026. Os pontos de coleta já estão disponíveis em todas as regionais e as doações serão destinadas a instituições parceiras.',
      'Participe e ajude a aquecer o inverno de muitas famílias. Cada peça conta.',
    ],
    image: photo('agasalho', 1200, 700),
    date: '2026-05-18',
    author: 'RH & Cultura',
    authorRole: 'Pessoas',
    readingMinutes: 2,
    views: 488,
  },
  {
    id: 'n7',
    slug: 'automacao-da-triagem-avanca',
    category: 'Projetos',
    title: 'Projeto de Automação da Triagem avança para 75%',
    excerpt: 'A esteira inteligente entra em fase de testes integrados com o sistema de classificação.',
    content: [
      'O projeto de Automação da Triagem alcançou 75% de conclusão. A nova esteira inteligente está em fase de testes integrados com o sistema de classificação por tipo de devolução.',
      'A expectativa é reduzir o tempo de triagem e liberar a equipe para atividades de maior valor, como a análise de exceções.',
    ],
    image: photo('automacao', 1200, 700),
    date: '2026-05-15',
    author: 'PMO Reversa',
    authorRole: 'Projetos',
    readingMinutes: 3,
    views: 559,
  },
  {
    id: 'n8',
    slug: 'treinamento-novo-fluxo-devolucoes',
    category: 'Treinamentos',
    title: 'Treinamento: Novo Fluxo de Devoluções',
    excerpt: 'Inscrições abertas para a capacitação online sobre o novo fluxo de devoluções.',
    content: [
      'As inscrições para o treinamento “Novo Fluxo de Devoluções” estão abertas. A capacitação é online e aborda, na prática, cada etapa do novo procedimento.',
      'Reserve sua vaga pela Agenda do portal e confirme a presença com sua liderança.',
    ],
    image: photo('treinamento', 1200, 700),
    date: '2026-05-12',
    author: 'Treinamento & Desenvolvimento',
    authorRole: 'Pessoas',
    readingMinutes: 2,
    views: 402,
  },
]

export function getNewsBySlug(slug: string): NewsArticle | undefined {
  return news.find((n) => n.slug === slug)
}

export const featuredNews = news.filter((n) => n.featured)
export const latestNews = [...news].sort((a, b) => b.date.localeCompare(a.date))
