export const REGIONS: Record<string, string> = {
    'bue': 'Buenos Aires',
    'caba': 'CABA', // Keeping it short for UI balance, or 'Ciudad Autónoma de Buenos Aires' if strict full name desired
    'cat': 'Catamarca',
    'cha': 'Chaco',
    'chu': 'Chubut',
    'cba': 'Córdoba',
    'cor': 'Corrientes',
    'ers': 'Entre Ríos',
    'for': 'Formosa',
    'juj': 'Jujuy',
    'lpa': 'La Pampa',
    'lar': 'La Rioja',
    'mdz': 'Mendoza',
    'mis': 'Misiones',
    'nqn': 'Neuquén',
    'rng': 'Río Negro',
    'sal': 'Salta',
    'sjn': 'San Juan',
    'sls': 'San Luis',
    'scz': 'Santa Cruz',
    'sfe': 'Santa Fe',
    'sde': 'Santiago del Estero',
    'tdf': 'Tierra del Fuego',
    'tuc': 'Tucumán'
}

export function getRegionName(code: string | null): string {
    if (!code) return ''
    return REGIONS[code.toLowerCase()] || code.toUpperCase()
}
