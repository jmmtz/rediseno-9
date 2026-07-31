import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface SiteContentEntry {
  key: string;
  value: string;
  label: string;
  section: string;
  max_length: number;
}

export function useSiteContent() {
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_content')
      .select('key, value')
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          (data as { key: string; value: string }[]).forEach((row) => {
            map[row.key] = row.value;
          });
          setContent(map);
        }
        setLoading(false);
      });
  }, []);

  function getText(key: string, fallback: string): string {
    return content[key] ?? fallback;
  }

  return { content, loading, getText };
}

export const CONTENT_DEFAULTS: Record<string, string> = {
  hero_subtitle: 'Salon & Spa de lujo en Torreón. Cabello, maquillaje, faciales y bienestar en un solo lugar.',
  services_eyebrow: 'Nuestros Servicios',
  services_title: 'El arte de la',
  services_title_em: 'belleza auténtica',
  gallery_eyebrow: 'Nuestro Trabajo',
  gallery_title: 'Cada resultado,',
  gallery_title_em: 'una historia',
  gallery_subtitle: 'Una curaduría de transformaciones que hablan por sí solas. El estilo es personal; nosotros lo refinamos.',
  citas_eyebrow: 'Reserva tu lugar',
  citas_title: 'Tu transformación',
  citas_title_em: 'comienza aquí',
  citas_subtitle: 'Agenda tu cita en línea. Elige el servicio, el horario y el estilista que prefieras — en minutos.',
  footer_about: 'Un refugio de belleza y bienestar donde cada detalle está pensado para ofrecerte una experiencia sin igual. Lujo silencioso, cuidado genuino.',
};
