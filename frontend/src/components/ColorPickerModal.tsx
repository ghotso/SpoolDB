import { useState, useEffect } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { colorsMostUsedApi } from '../api/client';
import { Button } from './Button';
import type { Color } from '../types';

interface ColorPickerModalProps {
  color: string;
  onColorChange: (color: string) => void;
  onClose: () => void;
  onSave: () => void;
  isEdit?: boolean;
}

export function ColorPickerModal({
  color,
  onColorChange,
  onClose,
  onSave,
  isEdit = false
}: ColorPickerModalProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [selectedColor, setSelectedColor] = useState(color);
  const [mostUsedColors, setMostUsedColors] = useState<Color[]>([]);
  const [loadingColors, setLoadingColors] = useState(true);

  useEffect(() => {
    loadMostUsedColors();
  }, []);

  const loadMostUsedColors = async () => {
    try {
      setLoadingColors(true);
      const colors = await colorsMostUsedApi.list(15);
      setMostUsedColors(colors.filter(c => c.hex)); // Only colors with hex codes
    } catch (error) {
      console.error('Failed to load most used colors:', error);
    } finally {
      setLoadingColors(false);
    }
  };

  const handleColorChange = (newColor: string) => {
    setSelectedColor(newColor);
    onColorChange(newColor);
  };

  const handleSave = () => {
    onColorChange(selectedColor);
    onSave();
  };

  return (
    <div 
      className="modal-backdrop"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme.mode === 'dark' ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div 
        className="modal-content"
        style={{
          background: theme.colors.background,
          borderRadius: theme.borderRadius.large,
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          boxShadow: theme.shadows.large,
          border: `1px solid ${theme.colors.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem',
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {isEdit ? t('color.edit') : t('color.pickColor')}
        </h2>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: 500,
            fontSize: theme.typography.small,
            color: theme.colors.text.primary,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('color.hex')}
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{
                width: '80px',
                height: '50px',
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.borderRadius.small,
                cursor: 'pointer',
                transition: `border ${theme.transitions.fast}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary.main;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            />
            <input
              type="text"
              value={selectedColor.toUpperCase()}
              onChange={(e) => {
                const hex = e.target.value.startsWith('#') ? e.target.value : `#${e.target.value}`;
                if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
                  handleColorChange(hex);
                }
              }}
              placeholder="#000000"
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                fontSize: theme.typography.body,
                fontFamily: 'monospace',
                background: theme.colors.background,
                color: theme.colors.text.primary,
                transition: `all ${theme.transitions.fast}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary.main;
                e.currentTarget.style.outline = 'none';
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {mostUsedColors.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 500,
              fontSize: theme.typography.small,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('color.mostUsed')}
            </label>
            {loadingColors ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '1rem', 
                color: theme.colors.text.secondary,
                fontSize: theme.typography.body,
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('common.loading')}
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '0.5rem'
              }}>
                {mostUsedColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => color.hex && handleColorChange(color.hex)}
                    style={{
                      width: '100%',
                      aspectRatio: '1',
                      background: color.hex || theme.colors.border,
                      border: selectedColor.toUpperCase() === color.hex?.toUpperCase() 
                        ? `3px solid ${theme.colors.primary.main}` 
                        : `1px solid ${theme.colors.border}`,
                      borderRadius: theme.borderRadius.small,
                      cursor: 'pointer',
                      padding: 0,
                      transition: `all ${theme.transitions.fast}`,
                    }}
                    title={color.hex || color.name}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end'
        }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

