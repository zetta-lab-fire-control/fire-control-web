export const northMinasCenter = [-16.3, -43.6]

export const intensityMeta = {
  BAIXA: { label: 'Baixa', color: '#22c55e', weight: 1 },
  MEDIA: { label: 'Media', color: '#f59e0b', weight: 2 },
  ALTA: { label: 'Alta', color: '#ef4444', weight: 3 },
  CONTROLADO: { label: 'Controlado', color: '#10b981', weight: 1 },
}

export const statusMeta = {
  EM_ANALISE: 'Em analise',
  VALIDADO_AUTO: 'Alerta validado automaticamente',
  CONFIRMADO_BOMBEIROS: 'Confirmado pelos bombeiros',
  ALERTA_FALSO: 'Alerta falso',
  EM_ATENDIMENTO: 'Em atendimento pelos bombeiros',
  SOLUCIONADO: 'Solucionado pelos bombeiros',
}

export const reportValidationRules = {
  firstReport: '1 denuncia -> ocorrencia em analise',
  autoValidation: '3 denuncias na mesma area -> alerta validado automaticamente',
  firefighterConfirmation: 'Confirmacao dos bombeiros -> ocorrencia confirmada',
}

const nowTs = Date.now()
const tMinus = (hours) => new Date(nowTs - hours * 60 * 60 * 1000).toISOString()

export const mockOccurrences = [
  {
    id: 'OCC-101',
    city: 'Montes Claros',
    district: 'Vila Exposicao',
    lat: -16.7321,
    lng: -43.8622,
    intensity: 'ALTA',
    status: 'EM_ATENDIMENTO',
    reportsCount: 6,
    createdAt: tMinus(4),
    updatedAt: tMinus(1),
    photos: ['/placeholder/fire-1.jpg', '/placeholder/fire-2.jpg'],
    reports: [
      { id: 'DEN-9001', createdAt: tMinus(4), intensity: 'ALTA', photo: '/placeholder/fire-1.jpg' },
      { id: 'DEN-9002', createdAt: tMinus(3.5), intensity: 'ALTA', photo: '/placeholder/fire-2.jpg' },
      { id: 'DEN-9003', createdAt: tMinus(3), intensity: 'MEDIA', photo: '/placeholder/fire-1.jpg' },
    ],
  },
  {
    id: 'OCC-102',
    city: 'Janauba',
    district: 'Centro',
    lat: -15.8076,
    lng: -43.3102,
    intensity: 'MEDIA',
    status: 'VALIDADO_AUTO',
    reportsCount: 3,
    createdAt: tMinus(8),
    updatedAt: tMinus(7),
    photos: ['/placeholder/fire-3.jpg'],
    reports: [
      { id: 'DEN-9010', createdAt: tMinus(8), intensity: 'MEDIA', photo: '/placeholder/fire-3.jpg' },
      { id: 'DEN-9011', createdAt: tMinus(7.5), intensity: 'MEDIA', photo: '/placeholder/fire-3.jpg' },
      { id: 'DEN-9012', createdAt: tMinus(7.2), intensity: 'ALTA', photo: '/placeholder/fire-3.jpg' },
    ],
  },
  {
    id: 'OCC-103',
    city: 'Pirapora',
    district: 'Sao Geraldo',
    lat: -17.3538,
    lng: -44.938,
    intensity: 'CONTROLADO',
    status: 'SOLUCIONADO',
    reportsCount: 4,
    createdAt: tMinus(28),
    updatedAt: tMinus(26),
    photos: ['/placeholder/fire-4.jpg'],
    reports: [
      { id: 'DEN-9020', createdAt: tMinus(28), intensity: 'MEDIA', photo: '/placeholder/fire-4.jpg' },
      { id: 'DEN-9021', createdAt: tMinus(27.5), intensity: 'MEDIA', photo: '/placeholder/fire-4.jpg' },
      { id: 'DEN-9022', createdAt: tMinus(26.2), intensity: 'BAIXA', photo: '/placeholder/fire-4.jpg' },
    ],
  },
  {
    id: 'OCC-104',
    city: 'Salinas',
    district: 'Lagoa Nova',
    lat: -16.1747,
    lng: -42.2965,
    intensity: 'ALTA',
    status: 'EM_ANALISE',
    reportsCount: 2,
    createdAt: tMinus(2),
    updatedAt: tMinus(1.5),
    photos: ['/placeholder/fire-5.jpg'],
    reports: [
      { id: 'DEN-9030', createdAt: tMinus(2), intensity: 'ALTA', photo: '/placeholder/fire-5.jpg' },
      { id: 'DEN-9031', createdAt: tMinus(1.5), intensity: 'MEDIA', photo: '/placeholder/fire-5.jpg' },
    ],
  },
  {
    id: 'OCC-105',
    city: 'Januaria',
    district: 'Bom Jardim',
    lat: -15.4887,
    lng: -44.3667,
    intensity: 'BAIXA',
    status: 'CONFIRMADO_BOMBEIROS',
    reportsCount: 5,
    createdAt: tMinus(6),
    updatedAt: tMinus(4),
    photos: ['/placeholder/fire-6.jpg'],
    reports: [
      { id: 'DEN-9040', createdAt: tMinus(6), intensity: 'BAIXA', photo: '/placeholder/fire-6.jpg' },
      { id: 'DEN-9041', createdAt: tMinus(5.5), intensity: 'BAIXA', photo: '/placeholder/fire-6.jpg' },
      { id: 'DEN-9042', createdAt: tMinus(4.2), intensity: 'MEDIA', photo: '/placeholder/fire-6.jpg' },
    ],
  },
]

export const historyByPeriod = {
  '30': [
    { label: 'Sem 1', ocorrencias: 14, intensidadeMedia: 1.8, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Sem 2', ocorrencias: 18, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Salinas' },
    { label: 'Sem 3', ocorrencias: 22, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Janauba' },
    { label: 'Sem 4', ocorrencias: 25, intensidadeMedia: 2.4, cidadeMaiorFoco: 'Montes Claros' },
  ],
  '60': [
    { label: 'Jan', ocorrencias: 39, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januaria' },
    { label: 'Fev', ocorrencias: 43, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Mar', ocorrencias: 48, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
  ],
  '90': [
    { label: 'Jan', ocorrencias: 39, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januaria' },
    { label: 'Fev', ocorrencias: 43, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Mar', ocorrencias: 48, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
    { label: 'Abr', ocorrencias: 35, intensidadeMedia: 1.7, cidadeMaiorFoco: 'Pirapora' },
  ],
  ano: [
    { label: 'Jan', ocorrencias: 52, intensidadeMedia: 2.0, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Fev', ocorrencias: 61, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Janauba' },
    { label: 'Mar', ocorrencias: 74, intensidadeMedia: 2.4, cidadeMaiorFoco: 'Salinas' },
    { label: 'Abr', ocorrencias: 50, intensidadeMedia: 1.8, cidadeMaiorFoco: 'Pirapora' },
    { label: 'Mai', ocorrencias: 44, intensidadeMedia: 1.7, cidadeMaiorFoco: 'Januaria' },
    { label: 'Jun', ocorrencias: 57, intensidadeMedia: 2.1, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Jul', ocorrencias: 66, intensidadeMedia: 2.3, cidadeMaiorFoco: 'Salinas' },
    { label: 'Ago', ocorrencias: 73, intensidadeMedia: 2.5, cidadeMaiorFoco: 'Janauba' },
    { label: 'Set', ocorrencias: 81, intensidadeMedia: 2.6, cidadeMaiorFoco: 'Montes Claros' },
    { label: 'Out', ocorrencias: 76, intensidadeMedia: 2.5, cidadeMaiorFoco: 'Janauba' },
    { label: 'Nov', ocorrencias: 68, intensidadeMedia: 2.2, cidadeMaiorFoco: 'Pirapora' },
    { label: 'Dez', ocorrencias: 55, intensidadeMedia: 1.9, cidadeMaiorFoco: 'Januaria' },
  ],
}
