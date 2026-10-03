// Clientes que aparecen como células rotuladas en A20 Ecosistema.
// PROVISIONAL: son rótulos genéricos por tipo de negocio, no clientes reales. Reemplazar `name` por los
// nombres reales (en el orden en que deben irse rotulando); el fondo se adapta a la cantidad que haya (1–8).
export interface ClientNode { readonly name: string }

export const CLIENTS: readonly ClientNode[] = [
  { name: 'Panadería' },
  { name: 'Conjunto residencial' },
  { name: 'Tienda de barrio' },
  { name: 'Ferretería' },
  { name: 'Restaurante' },
  { name: 'Consultorio' },
];
