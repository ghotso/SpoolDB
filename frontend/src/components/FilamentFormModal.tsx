import { useState, useEffect, useMemo } from 'react';
import { filamentsApi, materialsApi, colorsApi, templatesApi } from '../api/client';
import type { Material, Color, Template, Filament, CreateFilamentInput } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { ColorPickerModal } from './ColorPickerModal';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Input';
import { Autocomplete } from './Autocomplete';

interface FilamentFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  filamentId?: number; // For editing
  templateId?: number; // For creating from template
  gcodeData?: { // For creating from G-code
    materialId?: number;
    colorId?: number;
    name?: string;
  };
}

export function FilamentFormModal({ onClose, onSuccess, filamentId, templateId, gcodeData }: FilamentFormModalProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isEdit = !!filamentId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickedColorHex, setPickedColorHex] = useState('#000000');
  const [formData, setFormData] = useState<CreateFilamentInput>({
    name: '',
    material_id: 0,
    color_id: 0,
    manufacturer: '',
    template_id: null,
    notes: '',
  });

  useEffect(() => {
    loadOptions();
    
    if (templateId) {
      loadTemplate(templateId);
    } else if (gcodeData) {
      // Pre-fill from G-code data
      setFormData({
        name: gcodeData.name || '',
        material_id: gcodeData.materialId || 0,
        color_id: gcodeData.colorId || 0,
        manufacturer: '',
        template_id: null,
        notes: '',
      });
    } else if (isEdit && filamentId) {
      loadFilament();
    }
  }, [filamentId, templateId, gcodeData]);

  const loadOptions = async () => {
    try {
      const [materialsData, colorsData, templatesData, filamentsData] = await Promise.all([
        materialsApi.list(),
        colorsApi.list(),
        templatesApi.list(),
        filamentsApi.list(true), // Get all filaments including archived to get all manufacturers
      ]);
      setMaterials(materialsData);
      setColors(colorsData);
      setTemplates(templatesData);
      setFilaments(filamentsData);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  // Get unique manufacturers from existing filaments
  const manufacturers = useMemo(() => {
    const uniqueManufacturers = new Set<string>();
    filaments.forEach(filament => {
      if (filament.manufacturer && filament.manufacturer.trim()) {
        uniqueManufacturers.add(filament.manufacturer.trim());
      }
    });
    return Array.from(uniqueManufacturers).sort();
  }, [filaments]);

  const loadTemplate = async (templateId: number) => {
    try {
      const template = await templatesApi.get(templateId);
      setFormData({
        name: template.name, // Use template name as filament name
        material_id: template.material_id,
        color_id: 0,
        manufacturer: template.manufacturer || '',
        template_id: templateId,
        notes: template.notes || '',
      });
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };

  const loadFilament = async () => {
    try {
      setInitialLoading(true);
      const filament = await filamentsApi.get(filamentId!);
      setFormData({
        name: filament.name,
        material_id: filament.material_id,
        color_id: filament.color_id,
        manufacturer: filament.manufacturer || '',
        template_id: filament.template_id,
        notes: filament.notes || '',
      });
      // Reload colors to get the selected color
      const colorsData = await colorsApi.list();
      setColors(colorsData);
    } catch (error) {
      console.error('Failed to load filament:', error);
      alert(t('errors.loadFailed'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleTemplateChange = async (templateId: string) => {
    if (!templateId || templateId === '0') {
      setFormData({ ...formData, template_id: null });
      return;
    }
    await loadTemplate(parseInt(templateId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await filamentsApi.update(filamentId!, formData);
      } else {
        await filamentsApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <>
        {/* Backdrop */}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'modalFadeIn 200ms ease',
          }}
          onClick={onClose}
        />
        {/* Modal */}
        <Card style={{ 
          position: 'fixed', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          maxWidth: '700px',
          width: '90%',
          background: theme.colors.background,
          border: `1px solid ${theme.colors.border}`,
          boxShadow: theme.shadows.large,
          animation: 'modalFadeIn 200ms ease',
          padding: '2rem',
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('common.loading')}
          </div>
        </Card>
      </>
    );
  }

  const selectedColor = colors.find(c => c.id === formData.color_id);

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'modalFadeIn 200ms ease',
        }}
        onClick={onClose}
      />
      {/* Modal */}
      <Card style={{ 
        position: 'fixed', 
        top: '50%', 
        left: '50%', 
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        maxWidth: '700px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.large,
          animation: 'modalContentFade 200ms ease',
        padding: '2rem',
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: `1px solid ${theme.colors.border}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.h2,
            fontWeight: 600,
            color: theme.colors.text.primary,
            margin: 0,
            fontFamily: theme.typography.fontFamily,
          }}>
            {isEdit ? t('filament.edit') : t('filament.add')}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: theme.borderRadius.small,
              color: theme.colors.text.secondary,
              fontSize: '24px',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: `all ${theme.transitions.fast}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.surface;
              e.currentTarget.style.color = theme.colors.text.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = theme.colors.text.secondary;
            }}
            title={t('common.close') || 'Close'}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Input
            label={t('filament.name')}
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <Select
            label={t('template.name')}
            value={formData.template_id || ''}
            onChange={(e) => handleTemplateChange(e.target.value)}
          >
            <option value="">{t('common.optional')}</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </Select>

          <Select
            label={t('filament.material')}
            required
            value={formData.material_id}
            onChange={(e) => setFormData({ ...formData, material_id: parseInt(e.target.value) })}
          >
            <option value="0">{t('common.required')}</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </Select>

          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 500,
              fontSize: theme.typography.small,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('filament.color')} <span style={{ color: theme.colors.status.danger }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <Button
                type="button"
                variant={formData.color_id > 0 ? 'primary' : 'secondary'}
                onClick={() => {
                  setPickedColorHex('#000000');
                  setShowColorPicker(true);
                }}
                style={{ whiteSpace: 'nowrap' }}
              >
                {formData.color_id > 0 ? t('color.changeColor') : t('color.pickColor')}
              </Button>
              {formData.color_id > 0 && selectedColor && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                  {selectedColor.hex && (
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: selectedColor.hex,
                        border: `2px solid ${theme.colors.border}`,
                        flexShrink: 0
                      }}
                      title={selectedColor.hex}
                    />
                  )}
                  <div>
                    <div style={{ 
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      fontFamily: theme.typography.fontFamily,
                    }}>
                      {selectedColor.name}
                    </div>
                    {selectedColor.hex && (
                      <div style={{ 
                        fontSize: theme.typography.small, 
                        color: theme.colors.text.secondary,
                        fontFamily: theme.typography.fontFamily,
                      }}>
                        {selectedColor.hex}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {formData.color_id === 0 && (
              <div style={{ 
                marginTop: '0.5rem', 
                color: theme.colors.status.danger, 
                fontSize: theme.typography.small,
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('common.required')}
              </div>
            )}
          </div>

          <Autocomplete
            label={t('filament.manufacturer')}
            value={formData.manufacturer || ''}
            onChange={(value) => setFormData({ ...formData, manufacturer: value })}
            options={manufacturers}
            placeholder={t('filament.manufacturer')}
          />

          <Textarea
            label={t('filament.notes')}
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={4}
          />

          <div style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            justifyContent: 'flex-end',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${theme.colors.border}`,
          }}>
            <Button 
              type="button"
              variant="secondary" 
              onClick={onClose}
              disabled={loading}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>

        {showColorPicker && (
          <ColorPickerModal
            color={pickedColorHex}
            onColorChange={(hex) => {
              setPickedColorHex(hex);
            }}
            onClose={() => {
              setShowColorPicker(false);
              setPickedColorHex('#000000');
            }}
            onSave={async () => {
              try {
                // Create the color with hex code as name
                const colorName = pickedColorHex.toUpperCase();
                const newColor = await colorsApi.create({ name: colorName, hex: pickedColorHex });
                
                // Set the new color as selected
                setFormData({ ...formData, color_id: newColor.id });
                
                // Reload colors to include the new one
                await loadOptions();
                
                setShowColorPicker(false);
                setPickedColorHex('#000000');
              } catch (error: any) {
                alert(error.message || t('errors.saveFailed'));
              }
            }}
            isEdit={false}
          />
        )}
      </Card>
    </>
  );
}

