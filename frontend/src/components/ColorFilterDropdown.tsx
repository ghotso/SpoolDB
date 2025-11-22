import { useRef, useState, useEffect } from 'react';
import type { Color } from '../types';
import { useTheme } from '../theme/ThemeContext';

interface ColorFilterDropdownProps {
  colors: Color[];
  selectedColorId: number | null;
  onColorChange: (colorId: number | null) => void;
  label: string;
  allLabel: string;
}

export function ColorFilterDropdown({
  colors,
  selectedColorId,
  onColorChange,
  label,
  allLabel
}: ColorFilterDropdownProps) {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedColor = colors.find(c => c.id === selectedColorId);

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

  return (
    <div style={{ flex: 1, minWidth: '200px', position: 'relative' }} ref={dropdownRef}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: 500, 
        fontSize: theme.typography.small,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily,
      }}>
        {label}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: theme.borderRadius.small,
          border: `1px solid ${theme.colors.border}`,
          fontSize: theme.typography.body,
          background: theme.colors.background,
          color: theme.colors.text.primary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          fontFamily: theme.typography.fontFamily,
          transition: `all ${theme.transitions.fast}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = theme.colors.border;
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          {selectedColor ? (
            <>
              {selectedColor.hex && (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: selectedColor.hex,
                    border: `1px solid ${theme.colors.border}`,
                    flexShrink: 0
                  }}
                />
              )}
              <span>{selectedColor.name}</span>
              {selectedColor.hex && (
                <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.small }}>
                  ({selectedColor.hex})
                </span>
              )}
            </>
          ) : (
            <span style={{ color: theme.colors.text.secondary }}>{allLabel}</span>
          )}
        </div>
        <span style={{ color: theme.colors.text.secondary }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
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
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '0.25rem'
          }}
        >
          <div
            onClick={() => {
              onColorChange(null);
              setIsOpen(false);
            }}
            style={{
              padding: '0.75rem',
              cursor: 'pointer',
              background: selectedColorId === null ? theme.colors.surface : theme.colors.background,
              borderBottom: `1px solid ${theme.colors.border}`,
              transition: `background ${theme.transitions.fast}`,
            }}
            onMouseEnter={(e) => {
              if (selectedColorId !== null) {
                e.currentTarget.style.background = theme.colors.surface;
              }
            }}
            onMouseLeave={(e) => {
              if (selectedColorId !== null) {
                e.currentTarget.style.background = theme.colors.background;
              }
            }}
          >
            <span style={{ color: theme.colors.text.secondary }}>{allLabel}</span>
          </div>
          {colors.map(color => (
            <div
              key={color.id}
              onClick={() => {
                onColorChange(color.id);
                setIsOpen(false);
              }}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: selectedColorId === color.id ? theme.colors.surface : theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                transition: `background ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                if (selectedColorId !== color.id) {
                  e.currentTarget.style.background = theme.colors.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedColorId !== color.id) {
                  e.currentTarget.style.background = theme.colors.background;
                }
              }}
            >
              {color.hex && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: color.hex,
                    border: '1px solid rgba(0,0,0,0.2)',
                    flexShrink: 0
                  }}
                  title={color.hex}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: selectedColorId === color.id ? 600 : 400,
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {color.name}
                </div>
                {color.hex && (
                  <div style={{ 
                    fontSize: theme.typography.small, 
                    color: theme.colors.text.secondary,
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {color.hex}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

