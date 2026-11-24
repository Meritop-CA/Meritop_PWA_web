import { brandForHost } from './brand';

describe('Brand logo', () => {
  it('shows Neovalores on its registration domain', () => {
    expect(brandForHost('neovaloresform.meritop.com').logo).toBe('NeovaloresFondoNegro.png');
  });

  it('preserves the XtraCash logo on its domain and localhost', () => {
    for (const host of ['xtracashform.meritop.com', 'localhost']) {
      expect(brandForHost(host).logo).toBe('logo_version_color.png');
    }
  });
});

describe('Browser tab icon', () => {
  it('selects the Neovalores icon only for its domain', () => {
    expect(brandForHost('neovaloresform.meritop.com').favicon).toBe('neovalores-icon.svg');
    expect(brandForHost('xtracashform.meritop.com').favicon).toBe('isotipo_Xtracash.png');
    expect(brandForHost('localhost').favicon).toBe('isotipo_Xtracash.png');
  });
});
