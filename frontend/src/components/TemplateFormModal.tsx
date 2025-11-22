import { useState, useEffect } from 'react';
import { templatesApi, materialsApi } from '../api/client';
import type { Material, CreateTemplateInput } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Input';

interface TemplateFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  templateId?: number; // For editing
}

export function TemplateFormModal({ onClose, onSuccess, templateId }: TemplateFormModalProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isEdit = !!templateId;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [formData, setFormData] = useState<CreateTemplateInput>({
    name: '',
    material_id: 0,
    manufacturer: '',
    starting_weight_g: 0,
    empty_weight_g: 0,
    notes: '',
  });

  useEffect(() => {
    loadMaterials();
    if (isEdit && templateId) {
      loadTemplate();
    }
  }, [isEdit, templateId]);

  const loadMaterials = async () => {
    try {
      const data = await materialsApi.list();
      setMaterials(data);
    } catch (error) {
      console.error('Failed to load materials:', error);
    }
  };

  const loadTemplate = async () => {
    try {
      setInitialLoading(true);
      const template = await templatesApi.get(templateId!);
      setFormData({
        name: template.name,
        material_id: template.material_id,
        manufacturer: template.manufacturer || '',
        starting_weight_g: template.starting_weight_g,
        empty_weight_g: template.empty_weight_g || 0,
        notes: template.notes || '',
      });
    } catch (error) {
      console.error('Failed to load template:', error);
      alert(t('errors.loadFailed'));
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await templatesApi.update(templateId!, formData);
      } else {
        await templatesApi.create(formData);
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
            {isEdit ? t('template.edit') : t('template.add')}
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
            label={t('template.name')}
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

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

          <Input
            label={t('filament.manufacturer')}
            type="text"
            value={formData.manufacturer}
            onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label={t('filament.startingWeight')}
              type="number"
              required
              step="0.1"
              min="0"
              value={formData.starting_weight_g}
              onChange={(e) => setFormData({ ...formData, starting_weight_g: parseFloat(e.target.value) })}
            />
            <Input
              label={t('filament.emptyWeight')}
              type="number"
              step="0.1"
              min="0"
              value={formData.empty_weight_g}
              onChange={(e) => setFormData({ ...formData, empty_weight_g: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <Textarea
            label={t('filament.notes')}
            value={formData.notes}
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
      </Card>
    </>
  );
}

