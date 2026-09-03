import type { Person } from '@/types'
import { avatar } from '@/lib/media'

export const REGIONS = ['Todos', 'REG 1', 'REG 2', 'FULL', 'CROSS-BORDER']

// Cargos/níveis do organograma (ordem hierárquica)
export const PEOPLE_LEVELS = [
  'Red',
  'Gerência',
  'Coordenação',
  'Supervisão',
  'Liderança',
  'Associado Jr.',
  'Associado Pleno',
  'Associado Sênior',
  'Trainer',
  'Analista',
  'Assistente Controle Torre',
  'Operação',
]

export const people: Person[] = [
  {
    id: 'pe1',
    name: 'Juliana Santos',
    role: 'Analista de Reversa',
    region: 'REG 2',
    shift: 'Manhã',
    contact: 'juliana.santos@shopee.com',
    photo: avatar('juliana', 200),
    level: 'Analista',
    quote:
      'A Reversa me ensinou que cada detalhe faz diferença. A gente não trabalha só com produtos, mas com pessoas e com o compromisso de entregar o melhor.',
  },
  {
    id: 'pe2',
    name: 'Rafael Oliveira',
    role: 'Gerente de Logística Reversa',
    region: 'REG 1',
    shift: 'Comercial',
    contact: 'rafael.oliveira@shopee.com',
    photo: avatar('rafael', 200),
    level: 'Gerência',
    quote: 'Padronização e dados são o que transformam esforço em resultado sustentável.',
  },
  {
    id: 'pe3',
    name: 'Camila Ferreira',
    role: 'Coordenadora de Triagem',
    region: 'REG 2',
    shift: 'Tarde',
    contact: 'camila.ferreira@shopee.com',
    photo: avatar('camila', 200),
    level: 'Coordenação',
    quote: 'Acurácia se constrói com disciplina, todos os dias, em cada item.',
  },
  {
    id: 'pe4',
    name: 'Diego Almeida',
    role: 'Coordenador de Inbound',
    region: 'FULL',
    shift: 'Noite',
    contact: 'diego.almeida@shopee.com',
    photo: avatar('diego', 200),
    level: 'Coordenação',
  },
  {
    id: 'pe5',
    name: 'Beatriz Lima',
    role: 'Líder de Operação',
    region: 'REG 1',
    shift: 'Manhã',
    contact: 'beatriz.lima@shopee.com',
    photo: avatar('beatriz', 200),
    level: 'Liderança',
    quote: 'Comunicação ativa entre turnos é o que mantém a operação fluindo.',
  },
  {
    id: 'pe6',
    name: 'Lucas Martins',
    role: 'Líder de Expedição',
    region: 'CROSS-BORDER',
    shift: 'Tarde',
    contact: 'lucas.martins@shopee.com',
    photo: avatar('lucas', 200),
    level: 'Liderança',
  },
  {
    id: 'pe7',
    name: 'Ana Souza',
    role: 'Analista de Performance',
    region: 'REG 2',
    shift: 'Comercial',
    contact: 'ana.souza@shopee.com',
    photo: avatar('ana', 200),
    level: 'Analista',
    quote: 'Números contam histórias — meu trabalho é ajudar o time a lê-las.',
  },
  {
    id: 'pe8',
    name: 'Pedro Rocha',
    role: 'Focal de Qualidade',
    region: 'FULL',
    shift: 'Noite',
    contact: 'pedro.rocha@shopee.com',
    photo: avatar('pedro', 200),
    level: 'Operação',
  },
  {
    id: 'pe9',
    name: 'Mariana Costa',
    role: 'Analista de Auditoria',
    region: 'CROSS-BORDER',
    shift: 'Comercial',
    contact: 'mariana.costa@shopee.com',
    photo: avatar('mariana', 200),
    level: 'Analista',
  },
  {
    id: 'pe10',
    name: 'Gustavo Pereira',
    role: 'Focal de Segurança',
    region: 'REG 1',
    shift: 'Noite',
    contact: 'gustavo.pereira@shopee.com',
    photo: avatar('gustavo', 200),
    level: 'Operação',
  },
]

export function getPersonById(id: string): Person | undefined {
  return people.find((p) => p.id === id)
}
