import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { templatesApi, materialsApi } from '../api/client';
import type { Material, Template, CreateTemplateInput } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Textarea } from '../components/Input';

export function TemplateForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isEdit = !!id && id !== 'new';

  const [loading, setLoading] = useState(false);
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
    if (id && id !== 'new') {
      loadTemplate();
    }
  }, [id]);

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
      setLoading(true);
      const template = await templatesApi.get(parseInt(id!));
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
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await templatesApi.update(parseInt(id!), formData);
      } else {
        await templatesApi.create(formData);
      }
      navigate('/templates');
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.body,
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto',
      animation: 'fadeIn 200ms ease',
    }}>
      <h1 style={{
        fontSize: theme.typography.h1,
        fontWeight: 700,
        color: theme.colors.text.primary,
        marginBottom: '2rem',
        fontFamily: theme.typography.fontFamily,
      }}>
        {isEdit ? t('template.edit') : t('template.add')}
      </h1>
      
      <Card>
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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              fullWidth
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/templates')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
