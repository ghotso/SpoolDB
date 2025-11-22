import { ReactNode } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export function Card({ children, style, onClick, hoverable = false }: CardProps) {
  const { theme } = useTheme();

  const cardStyle: React.CSSProperties = {
    background: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: '1.5rem',
    boxShadow: theme.shadows.small,
    transition: `all ${theme.transitions.medium}`,
    cursor: onClick || hoverable ? 'pointer' : 'default',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.medium;
          e.currentTarget.style.transform = 'translateY(-2px)';
        }
      }}
      onMouseLeave={(e) => {
        if (hoverable || onClick) {
          e.currentTarget.style.boxShadow = theme.shadows.small;
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }}
    >
      {children}
    </div>
  );
}

