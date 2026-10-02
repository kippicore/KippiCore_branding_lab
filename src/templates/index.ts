import type { TemplateDef, TemplateId } from '../contracts';
import { Hero } from './Hero/Hero';
import { OrderCard } from './OrderCard/OrderCard';

export const TEMPLATES: Record<TemplateId, TemplateDef> = {
  hero: { id: 'hero', name: 'Portada web', Component: Hero },
  'order-card': { id: 'order-card', name: 'Tarjeta de pedido', Component: OrderCard },
};
