// Theme configuration and utilities
export const theme = {
  colors: {
    primary: 'var(--accent-primary)',
    secondary: 'var(--accent-secondary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)',
    info: 'var(--info)',
    background: {
      primary: 'var(--bg-primary)',
      secondary: 'var(--bg-secondary)',
      tertiary: 'var(--bg-tertiary)',
      accent: 'var(--bg-accent)',
    },
    text: {
      primary: 'var(--text-primary)',
      secondary: 'var(--text-secondary)',
      muted: 'var(--text-muted)',
    },
    border: {
      primary: 'var(--border-primary)',
      secondary: 'var(--border-secondary)',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  typography: {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

// Theme utilities
export const getTheme = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') || 'light';
  }
  return 'light';
};

export const setTheme = (theme) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export const toggleTheme = () => {
  const currentTheme = getTheme();
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
};

// Initialize theme on load
export const initializeTheme = () => {
  if (typeof window !== 'undefined') {
    const savedTheme = getTheme();
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
};

// Status configurations
export const statusConfig = {
  new: {
    label: 'New',
    color: 'info',
    icon: 'PlusCircle',
  },
  assigned: {
    label: 'Assigned',
    color: 'warning',
    icon: 'UserCheck',
  },
  in_progress: {
    label: 'In Progress',
    color: 'primary',
    icon: 'Clock',
  },
  waiting_parts: {
    label: 'Waiting Parts',
    color: 'warning',
    icon: 'Package',
  },
  fixed: {
    label: 'Fixed',
    color: 'success',
    icon: 'CheckCircle',
  },
  cannot_repair: {
    label: 'Cannot Repair',
    color: 'error',
    icon: 'XCircle',
  },
  delivered: {
    label: 'Delivered',
    color: 'success',
    icon: 'Truck',
  },
  closed: {
    label: 'Closed',
    color: 'muted',
    icon: 'Archive',
  },
};

// Role configurations
export const roleConfig = {
  super_admin: {
    label: 'Super Admin',
    color: 'error',
    icon: 'Shield',
  },
  center_manager: {
    label: 'Center Manager',
    color: 'primary',
    icon: 'UserCog',
  },
  receptionist: {
    label: 'Receptionist',
    color: 'info',
    icon: 'User',
  },
  technician: {
    label: 'Technician',
    color: 'warning',
    icon: 'Wrench',
  },
  storekeeper: {
    label: 'Storekeeper',
    color: 'success',
    icon: 'Package',
  },
  customer: {
    label: 'Customer',
    color: 'muted',
    icon: 'User',
  },
};

// Customer type configurations
export const customerTypeConfig = {
  distributor: {
    label: 'Distributor',
    color: 'primary',
    icon: 'Building',
  },
  consumer: {
    label: 'Consumer',
    color: 'info',
    icon: 'User',
  },
};

// Device status configurations
export const deviceStatusConfig = {
  active: {
    label: 'Active',
    color: 'success',
    icon: 'CheckCircle',
  },
  replaced: {
    label: 'Replaced',
    color: 'warning',
    icon: 'RefreshCw',
  },
  archived: {
    label: 'Archived',
    color: 'muted',
    icon: 'Archive',
  },
};

// Stock movement type configurations
export const stockMovementConfig = {
  add: {
    label: 'Add',
    color: 'success',
    icon: 'Plus',
  },
  issue: {
    label: 'Issue',
    color: 'warning',
    icon: 'Minus',
  },
  return: {
    label: 'Return',
    color: 'info',
    icon: 'RotateCcw',
  },
  scrap: {
    label: 'Scrap',
    color: 'error',
    icon: 'Trash2',
  },
};