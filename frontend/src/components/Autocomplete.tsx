import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';

interface AutocompleteProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export function Autocomplete({
  label,
  value,
  onChange,
  options,
  placeholder,
  required,
  error,
}: AutocompleteProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isOpen && inputValue) {
      const filtered = options.filter(opt =>
        opt.toLowerCase().includes(inputValue.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [inputValue, isOpen, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleSelectOption = (option: string) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const displayOptions = inputValue
    ? filteredOptions.filter(opt => opt.toLowerCase() !== inputValue.toLowerCase())
    : options;

  return (
    <div style={{ width: '100%', position: 'relative' }} ref={dropdownRef}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontWeight: 500,
          fontSize: theme.typography.small,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {label}
          {required && <span style={{ color: theme.colors.status.danger, marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          required={required}
          style={{
            fontFamily: theme.typography.fontFamily,
            fontSize: theme.typography.body,
            width: '100%',
            padding: '0.75rem',
            paddingRight: '2.5rem',
            borderRadius: theme.borderRadius.small,
            border: `1px solid ${error ? theme.colors.status.danger : theme.colors.border}`,
            background: theme.colors.background,
            color: theme.colors.text.primary,
            transition: `all ${theme.transitions.fast}`,
          }}
          onBlur={(e) => {
            // Delay to allow option click to register
            setTimeout(() => {
              if (!dropdownRef.current?.contains(document.activeElement)) {
                setIsOpen(false);
              }
            }, 200);
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.colors.text.secondary,
            pointerEvents: 'none',
          }}
        >
          ▼
        </div>
      </div>

      {isOpen && displayOptions.length > 0 && (
        <div
          className="modal-content"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.medium,
            boxShadow: theme.shadows.large,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto',
            marginTop: '0.25rem',
          }}
        >
          {displayOptions.map((option, index) => (
            <div
              key={index}
              onClick={() => handleSelectOption(option)}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                background: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                transition: `background ${theme.transitions.fast}`,
                fontSize: theme.typography.body,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.surface;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.background;
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          marginTop: '0.25rem',
          fontSize: theme.typography.small,
          color: theme.colors.status.danger,
          fontFamily: theme.typography.fontFamily,
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

