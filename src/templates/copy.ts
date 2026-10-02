/** Textos reales de KippiCore (plan §8.4). Formatos es-CO. */
export const COPY = {
  brand: 'KippiCore',
  kicker: 'Software a la medida · Bogotá',
  nav: ['Soluciones', 'Casos', 'Cómo trabajamos', 'Precios'],
  navCta: 'Agendar diagnóstico',
  headline: { before: 'Sus pedidos dejan de vivir en un ', accent: 'celular', after: '.' },
  subtitle: 'Pedidos, domicilios y cartera de sus sedes en un solo sistema, a precio cerrado.',
  ctaPrimary: 'Agendar diagnóstico',
  ctaSecondary: 'Ver un caso real',
  board: {
    title: 'Panadería La Espiga',
    sub: '4 sedes · Bogotá',
    kpis: [
      { label: 'Pedidos de hoy', value: '38', note: '+12 % frente a ayer' },
      { label: 'Domicilios en ruta', value: '7', note: 'Próximo despacho: 11:40 a. m.' },
    ],
    columns: ['Pedido', 'Detalle', 'Hora', 'Estado'],
    rows: [
      { id: '1042', place: 'Chapinero · Domicilio', detail: '120 pandebonos', time: '09:42', status: 'En ruta', tone: 'accent' },
      { id: '1041', place: 'Cedritos · Mostrador', detail: 'Pedido para evento', time: '10:15', status: 'Entregado', tone: 'primary' },
      { id: '1040', place: 'Usaquén · Cliente institucional', detail: 'Factura', time: '11:03', status: 'Confirmado', tone: 'muted' },
      { id: '1039', place: 'Chapinero · Domicilio', detail: 'Pan tajado', time: '11:20', status: 'Recibido', tone: 'muted' },
    ],
  },
  order: {
    label: 'Pedido',
    number: '#4821',
    delivered: 'Entregado 22:14',
    business: 'Panadería La Espiga',
    branch: 'Sede Chapinero',
    channel: 'Domicilio · confirmado por WhatsApp a las 21:37',
    totalLabel: 'Total',
    total: '$ 184.000',
    status: 'Entregado',
  },
} as const;

export type StatusTone = 'accent' | 'primary' | 'muted';
