export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: {
    main: string;
    hover: string;
    pressed: string;
  };
  background: string;
  surface: string;
  elevated?: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
  };
  status: {
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: {
    fontFamily: string;
    h1: string;
    h2: string;
    h3: string;
    body: string;
    small: string;
  };
  borderRadius: {
    small: string;
    medium: string;
    large: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
  transitions: {
    fast: string;
    medium: string;
    slow: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    primary: {
      main: '#FF7A1A',
      hover: '#E46A17',
      pressed: '#CC5D14',
    },
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E0E0E0',
    text: {
      primary: '#1A1A1A',
      secondary: '#4A4A4A',
    },
    status: {
      success: '#4CAF50',
      warning: '#FFB300',
      danger: '#E53935',
      info: '#2196F3',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: '28px',
    h2: '22px',
    h3: '18px',
    body: '15px',
    small: '13px',
  },
  borderRadius: {
    small: '6px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.1)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.1)',
    large: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  transitions: {
    fast: '150ms ease',
    medium: '200ms ease',
    slow: '250ms ease',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    primary: {
      main: '#FF7A1A',
      hover: '#E46A17',
      pressed: '#CC5D14',
    },
    background: '#151515',
    surface: '#1E1E1E',
    elevated: '#2A2A2A',
    border: '#333333',
    text: {
      primary: '#FAFAFA',
      secondary: '#C8C8C8',
    },
    status: {
      success: '#4CAF50',
      warning: '#FFB300',
      danger: '#E53935',
      info: '#2196F3',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: '28px',
    h2: '22px',
    h3: '18px',
    body: '15px',
    small: '13px',
  },
  borderRadius: {
    small: '6px',
    medium: '8px',
    large: '12px',
  },
  shadows: {
    small: '0 1px 3px rgba(0, 0, 0, 0.3)',
    medium: '0 2px 6px rgba(0, 0, 0, 0.3)',
    large: '0 4px 12px rgba(0, 0, 0, 0.4)',
  },
  transitions: {
    fast: '150ms ease',
    medium: '200ms ease',
    slow: '250ms ease',
  },
};

