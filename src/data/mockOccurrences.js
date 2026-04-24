export const northMinasCenter = [-16.3, -43.6]

export const northMinasBounds = {
  minLat: -17.8,
  maxLat: -13.5,
  minLon: -47.2,
  maxLon: -40.5,
}

export const intensityMeta = {
  BAIXA: { label: 'Baixa', color: '#22c55e', weight: 1 },
  MEDIA: { label: 'Média', color: '#f59e0b', weight: 2 },
  ALTA:  { label: 'Alta',  color: '#ef4444', weight: 3 },
}

export const statusMeta = {
  EM_ANALISE:    'Em análise',
  VALIDADO_AUTO: 'Alerta validado',
  ALERTA_FALSO:  'Alerta falso',
  SOLUCIONADO:   'Solucionado',
}

export const reportValidationRules = {
  firstReport:              '1 denúncia → ocorrência em análise',
  autoValidation:           '3 denúncias na mesma área → alerta validado automaticamente',
  firefighterConfirmation:  'Bombeiro ou admin denuncia → ocorrência confirmada imediatamente',
}

const nowTs = Date.now()
const tMinus = (hours) => new Date(nowTs - hours * 60 * 60 * 1000).toISOString()

export const mockOccurrences = [
  {
    id: 'SIMULACAO-001 [ZETTA-MOCK]',
    city: 'CIDADE TESTE A (MOCK)',
    district: 'Zona de Simulação',
    lat: -16.7321,
    lng: -43.8622,
    intensity: 'ALTA',
    status: 'VALIDADO_AUTO',
    reportsCount: 99,
    createdAt: tMinus(1),
    updatedAt: tMinus(0.5),
    reports: [
      { id: 'DEN-MOCK-1', createdAt: tMinus(1), intensity: 'ALTA' },
    ],
  },
  {
    id: 'SIMULACAO-002 [ZETTA-MOCK]',
    city: 'CIDADE TESTE B (MOCK)',
    district: 'Setor de Testes',
    lat: -15.8076,
    lng: -43.3102,
    intensity: 'MEDIA',
    status: 'VALIDADO_AUTO',
    reportsCount: 3,
    createdAt: tMinus(2),
    updatedAt: tMinus(1),
    reports: [],
  },
]

export const historyByPeriod = {
  '30': [
    { label: 'Sem 1', ocorrencias: 14, intensidadeMedia: 1.8, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Sem 2', ocorrencias: 18, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Salinas' },
    { label: 'Sem 3', ocorrencias: 22, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Janaúba' },
    { label: 'Sem 4', ocorrencias: 25, intensidadeMedia: 2.4, cidadeMaiorFoco: 'Montes Claros' },
  ],
  '60': [
    { label: 'Jan', ocorrencias: 39, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januária' },
    { label: 'Fev', ocorrencias: 43, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Mar', ocorrencias: 48, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
  ],
  '90': [
    { label: 'Jan', ocorrencias: 39, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januária' },
    { label: 'Fev', ocorrencias: 43, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Mar', ocorrencias: 48, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
    { label: 'Abr', ocorrencias: 35, intensidadeMedia: 1.7, cidadeMaiorFoco: 'Pirapora' },
  ],
  ano: [
    { label: 'Jan', ocorrencias: 52, intensidadeMedia: 2.0, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Fev', ocorrencias: 61, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Janaúba' },
    { label: 'Mar', ocorrencias: 74, intensidadeMedia: 2.4, cidadeMaiorFoco: 'Salinas' },
    { label: 'Abr', ocorrencias: 50, intensidadeMedia: 1.8, cidadeMaiorFoco: 'Pirapora' },
    { label: 'Mai', ocorrencias: 44, intensidadeMedia: 1.7, cidadeMaiorFoco: 'Januária' },
    { label: 'Jun', ocorrencias: 57, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Jul', ocorrencias: 66, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
    { label: 'Ago', ocorrencias: 73, intensidadeMedia: 2.5, cidadeMaiorFoco: 'Janaúba' },
    { label: 'Set', ocorrencias: 81, intensidadeMedia: 2.6, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Out', ocorrencias: 76, intensidadeMedia: 2.5, cidadeMaiorFoco: 'Janaúba' },
    { label: 'Nov', ocorrencias: 68, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Pirapora' },
    { label: 'Dez', ocorrencias: 55, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januária' },
  ],
}
