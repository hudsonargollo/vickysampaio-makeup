import { Provider, Service, Professional } from './types';

export const PROFESSIONALS: Professional[] = [
  {
    id: 'p1',
    name: 'Vicky Sampaio',
    avatarUrl: '/logo-vicky.png',
    role: 'Maquiadora Profissional',
  },
];

export const MOCK_PROVIDER: Provider = {
  id: 'provider-1',
  name: 'Vicky Sampaio Makeup',
  handle: 'vickysampaio',
  avatarUrl: '/logo-vicky.png',
  rating: 5.0,
  reviewCount: 218,
  location: 'Jequié, BA',
  professionals: PROFESSIONALS,
  services: [
    // Serviços reais
    {
      id: '1',
      name: 'Maquiagem Social',
      description: 'Maquiagem para eventos, festas e ocasiões especiais. Procedimento com duração de 40 min a 1 hora, realizado no estúdio.',
      duration: 60,
      price: 110,
      category: 'Serviços',
      imageUrl: '/maquiagemsocial.jpeg',
    },
    {
      id: '2',
      name: 'Maquiagem + Ondas com Babyliss',
      description: 'Maquiagem completa com finalização de ondas no babyliss (cabelo já escovado). Resultado sofisticado e duradouro.',
      duration: 90,
      price: 150,
      category: 'Serviços',
      imageUrl: '/combodeondas.jpeg',
    },
    {
      id: '3',
      name: 'Maquiagem de Noiva',
      description: 'Make especial para o grande dia. Atendimento dedicado com duração de 2 horas para garantir um resultado impecável e duradouro.',
      duration: 120,
      price: 200,
      category: 'Serviços',
      imageUrl: '/noiva.jpeg',
    },
    {
      id: '4',
      name: 'Curso de Auto Maquiagem',
      description: 'Aula personalizada de auto maquiagem a domicílio. Aprenda técnicas profissionais adaptadas ao seu rosto e rotina.',
      duration: 120,
      price: 200,
      category: 'Serviços',
      imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=70',
    },

    // Destaques para o slider
    {
      id: '5',
      name: 'Maquiagem Social',
      description: 'Look completo para eventos e ocasiões especiais. 40 min a 1 hora no estúdio.',
      duration: 60,
      price: 110,
      category: 'Destaques',
      imageUrl: '/maquiagemsocial.jpeg',
    },
    {
      id: '6',
      name: 'Make + Ondas Babyliss',
      description: 'Maquiagem com finalização de ondas. Cabelo já escovado.',
      duration: 90,
      price: 150,
      category: 'Destaques',
      imageUrl: '/combodeondas.jpeg',
    },
    {
      id: '7',
      name: 'Maquiagem de Noiva',
      description: 'Atendimento exclusivo de 2 horas para o dia mais especial.',
      duration: 120,
      price: 200,
      category: 'Destaques',
      imageUrl: '/noiva.jpeg',
    },
    {
      id: '8',
      name: 'Curso de Auto Maquiagem',
      description: 'Aula a domicílio com técnicas profissionais para o seu dia a dia.',
      duration: 120,
      price: 200,
      category: 'Destaques',
      imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=600&auto=format&fit=crop&q=70',
    },
  ],
  loyaltyProgram: {
    enabled: true,
    threshold: 8,
    rewardDescription: 'Maquiagem Social Grátis',
  },
  policies: [
    'Atendimento realizado no estúdio.',
    'Procedimento: 40 minutos a 1 hora.',
    'Pagamento via Pix ou dinheiro em espécie (valor já trocado).',
    'Cancelamento com 24h de antecedência.',
  ],
};

export const TIME_SLOTS = [
  { id: 't1', time: '08:00', available: true },
  { id: 't2', time: '09:00', available: true },
  { id: 't3', time: '10:00', available: false },
  { id: 't4', time: '11:00', available: true },
  { id: 't5', time: '13:00', available: true },
  { id: 't6', time: '14:00', available: true },
  { id: 't7', time: '15:00', available: false },
  { id: 't8', time: '16:00', available: true },
  { id: 't9', time: '17:00', available: true },
  { id: 't10', time: '18:00', available: true },
];
