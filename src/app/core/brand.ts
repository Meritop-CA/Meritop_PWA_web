export function brandForHost(hostname: string) {
  return hostname === 'neovaloresform.meritop.com'
    ? { logo: 'NeovaloresFondoNegro.png', favicon: 'neovalores-icon.svg', name: 'Neovalores', alt: 'Neovalores' }
    : { logo: 'logo_version_color.png', favicon: 'isotipo_Xtracash.png', name: 'xtracash', alt: 'xtracash por Meritop' };
}

export const currentBrand = brandForHost(window.location.hostname);
