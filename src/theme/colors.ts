export const colors = {
  common: {
    white: '#FFFFFF',
    black: '#000000',
  },
  // Primary scale: charcoal (darkest → lightest)
  primary: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },
  // Neutral scale: same charcoal/stone values, numbered for legacy compat
  neutral: {
    100: '#FAFAF9',   // charcoal-50 / stone-50
    200: '#F5F5F4',   // charcoal-100 / stone-100
    300: '#E7E5E4',   // charcoal-200 / stone-200
    400: '#D6D3D1',   // charcoal-300
    500: '#A8A29E',   // charcoal-400
    600: '#78716C',   // charcoal-500
    700: '#57534E',   // charcoal-600
    800: '#44403C',   // charcoal-700
    900: '#292524',   // charcoal-800
    1000: '#1C1917',  // charcoal-900
    1100: '#0C0A09',  // charcoal-950
  },
  // Accent: coral
  accent: {
    main: '#E86D5A',   // coral-400
    hover: '#D4553F',  // coral-500
    subtle: '#FEF2F0', // coral-50
    ring: 'rgba(232, 109, 90, 0.25)',
  },
  // Coral full scale
  coral: {
    50: '#FEF2F0',
    100: '#FDCFC7',
    200: '#F9A99C',
    300: '#F09484',
    400: '#E86D5A',
    500: '#D4553F',
    600: '#B84432',
  },
  // Gold full scale
  gold: {
    50: '#FDF8ED',
    100: '#F8EDCC',
    200: '#EDDA9E',
    300: '#D4B76E',
    400: '#C4A35A',
    500: '#A8884A',
  },
  // Status: success
  success: {
    100: '#E8F5EE',
    200: '#A8DBBB',
    300: '#3D9A5C',   // approved
    400: '#2E7A46',
    500: '#1F5A30',
  },
  // Status: warning
  warning: {
    100: '#FDF8ED',
    200: '#F8EDCC',
    300: '#D4A03E',   // changes/warning
    400: '#B8862E',
    500: '#926A20',
  },
  // Status: error
  error: {
    100: '#FDECEC',
    200: '#F5C4C4',
    300: '#DC5E5E',   // rejected/error
    400: '#C04444',
    500: '#9E3333',
  },
  transparent: {
    0: 'transparent',
    100: 'rgba(250, 250, 249, 0.55)',   // charcoal-50 base
    200: 'rgba(231, 229, 228, 0.25)',   // stone-200 base
    300: 'rgba(28, 25, 23, 0.25)',      // charcoal-900 base
    400: 'rgba(28, 25, 23, 0.5)',
    500: 'rgba(28, 25, 23, 0.75)',
  },
};
