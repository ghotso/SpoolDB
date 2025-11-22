import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, ...props }: InputProps) {
  const { theme } = useTheme();

  const inputStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body,
    width: '100%',
    padding: '0.75rem',
    borderRadius: theme.borderRadius.small,
    border: `1px solid ${error ? theme.colors.status.danger : theme.colors.border}`,
    background: theme.colors.background,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
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
      <input
        {...props}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.colors.status.danger : theme.colors.border;
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
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

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, style, ...props }: TextareaProps) {
  const { theme } = useTheme();

  const textareaStyle: React.CSSProperties = {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.body,
    width: '100%',
    padding: '0.75rem',
    borderRadius: theme.borderRadius.small,
    border: `1px solid ${error ? theme.colors.status.danger : theme.colors.border}`,
    background: theme.colors.background,
    color: theme.colors.text.primary,
    transition: `all ${theme.transitions.fast}`,
    resize: 'vertical',
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
      <textarea
        {...props}
        style={textareaStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? theme.colors.status.danger : theme.colors.border;
          e.currentTarget.style.boxShadow = 'none';
          props.onBlur?.(e);
        }}
      />
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

