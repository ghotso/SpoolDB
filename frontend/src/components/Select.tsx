import { SelectHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, style, children, ...props }: SelectProps) {
  const { theme } = useTheme();

  const selectStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body,
    width: '100%',
    padding: '0.75rem',
    borderRadius: theme.borderRadius.small,
    border: `1px solid ${error ? theme.colors.status.danger : theme.colors.border}`,
    background: theme.colors.background,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
    cursor: 'pointer',
    ...style,
  };

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontWeight: 500,
            fontSize: theme.typography.small,
            color: theme.colors.text.primary,
          }}
        >
          {label}
          {props.required && <span style={{ color: theme.colors.status.danger, marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <select
        {...props}
        style={selectStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.colors.status.danger : theme.colors.border;
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {children}
      </select>
      {error && (
        <div
          style={{
            marginTop: '0.25rem',
            fontSize: theme.typography.small,
            color: theme.colors.status.danger,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

