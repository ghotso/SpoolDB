import { ReactNode, ButtonHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
  fullWidth?: boolean;
}

export function Button({ 
  variant = 'primary', 
  children, 
  fullWidth = false,
  style,
  ...props 
}: ButtonProps) {
  const { theme } = useTheme();

  const baseStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body,
    fontWeight: 500,
    padding: '0.75rem 1.5rem',
    borderRadius: theme.borderRadius.medium,
    border: 'none',
    cursor: props.disabled ? 'not-allowed' : 'pointer',
    transition: `all ${theme.transitions.medium}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: fullWidth ? '100%' : 'auto',
    opacity: props.disabled ? 0.6 : 1,
    ...style,
  };

  let variantStyle: React.CSSProperties = {};

  switch (variant) {
    case 'primary':
      variantStyle = {
        background: theme.colors.primary.main,
        color: '#FFFFFF',
      };
      break;
    case 'secondary':
      variantStyle = {
        background: 'transparent',
        color: theme.colors.text.primary,
        border: `1px solid ${theme.colors.border}`,
      };
      break;
    case 'ghost':
      variantStyle = {
        background: 'transparent',
        color: theme.colors.text.primary,
      };
      break;
    case 'danger':
      variantStyle = {
        background: theme.colors.status.danger,
        color: '#FFFFFF',
      };
      break;
  }

  const hoverStyle = !props.disabled ? {
    transform: 'scale(1.02)',
  } : {};

  return (
    <button
      {...props}
      style={{
        ...baseStyle,
        ...variantStyle,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = theme.colors.primary.hover;
          } else if (variant === 'danger') {
            e.currentTarget.style.background = '#C62828';
          }
          Object.assign(e.currentTarget.style, hoverStyle);
        }
        props.onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        if (!props.disabled) {
          if (variant === 'primary') {
            e.currentTarget.style.background = theme.colors.primary.main;
          } else if (variant === 'danger') {
            e.currentTarget.style.background = theme.colors.status.danger;
          }
          e.currentTarget.style.transform = 'scale(1)';
        }
        props.onMouseLeave?.(e);
      }}
      onMouseDown={(e) => {
        if (!props.disabled && variant === 'primary') {
          e.currentTarget.style.background = theme.colors.primary.pressed;
        }
        props.onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        if (!props.disabled && variant === 'primary') {
          e.currentTarget.style.background = theme.colors.primary.hover;
        }
        props.onMouseUp?.(e);
      }}
    >
      {children}
    </button>
  );
}

