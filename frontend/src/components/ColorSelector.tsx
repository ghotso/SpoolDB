import { useState } from 'react';
import { ColorPickerModal } from './ColorPickerModal';
import type { Color } from '../types';
import { useI18n } from '../contexts/I18nContext';

interface ColorSelectorProps {
  colors: Color[];
  selectedColorId: number;
  onColorChange: (colorId: number) => void;
  onCustomColorCreate?: (name: string, hex: string) => Promise<Color>;
}

export function ColorSelector({
  colors,
  selectedColorId,
  onColorChange,
  onCustomColorCreate
}: ColorSelectorProps) {
  const { t } = useI18n();
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorHex, setCustomColorHex] = useState('#000000');
  const [customColorName, setCustomColorName] = useState('');

  const predefinedColors = colors.filter(c => !c.is_custom);
  const customColors = colors.filter(c => c.is_custom);
  const selectedColor = colors.find(c => c.id === selectedColorId);

  const handleCustomColorSave = async () => {
    if (!onCustomColorCreate || !customColorName.trim()) return;
    try {
      const newColor = await onCustomColorCreate(customColorName.trim(), customColorHex);
      onColorChange(newColor.id);
      setShowColorPicker(false);
      setCustomColorName('');
      setCustomColorHex('#000000');
    } catch (error: any) {
      console.error('Failed to create custom color:', error);
      alert(error.message || t('errors.saveFailed'));
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <select
          required
          value={selectedColorId}
          onChange={(e) => onColorChange(parseInt(e.target.value))}
          style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
        >
          <option value="0">{t('common.required')}</option>
          {predefinedColors.length > 0 && (
            <optgroup label={t('color.predefined')}>
              {predefinedColors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.hex && `(${c.hex})`}
                </option>
              ))}
            </optgroup>
          )}
          {customColors.length > 0 && (
            <optgroup label={t('color.custom')}>
              {customColors.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.hex && `(${c.hex})`}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        {onCustomColorCreate && (
          <button
            type="button"
            onClick={() => {
              setCustomColorName('');
              setCustomColorHex('#000000');
              setShowColorPicker(true);
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {t('color.pickColor')}
          </button>
        )}
      </div>
      {selectedColor && selectedColor.hex && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: selectedColor.hex,
              border: '1px solid #ddd'
            }}
            title={selectedColor.hex}
          />
          <span style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
            {selectedColor.name} ({selectedColor.hex})
          </span>
        </div>
      )}

      {showColorPicker && (
        <ColorPickerModal
          color={customColorHex}
          onColorChange={(hex) => {
            setCustomColorHex(hex);
            if (!customColorName.trim()) {
              const newName = `Custom ${hex.toUpperCase()}`;
              setCustomColorName(newName);
            }
          }}
          onColorNameChange={setCustomColorName}
          onClose={() => {
            setShowColorPicker(false);
            setCustomColorName('');
            setCustomColorHex('#000000');
          }}
          onSave={handleCustomColorSave}
          colorName={customColorName}
          isEdit={false}
        />
      )}
    </div>
  );
}

