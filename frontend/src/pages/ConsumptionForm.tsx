import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { consumptionApi, filamentsApi } from '../api/client';
import type { Filament, CreateConsumptionInput } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { FilamentSelect } from '../components/FilamentSelect';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Card } from '../components/Card';

export function ConsumptionForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { theme } = useTheme();
  const isEdit = !!id && id !== 'new';

  const [loading, setLoading] = useState(false);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [formData, setFormData] = useState<CreateConsumptionInput>({
    filament_id: (() => {
      const param = searchParams.get('filament_id');
      if (param) {
        const parsed = parseInt(param);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    })(),
    amount_g: 0,
    amount_m: null,
    print_name: '',
    type: 'success',
    notes: '',
  });

  useEffect(() => {
    loadFilaments();
    if (id && id !== 'new') {
      loadConsumption();
    }
  }, [id]);

  const loadFilaments = async () => {
    try {
      const data = await filamentsApi.list(false);
      setFilaments(data);
    } catch (error) {
      console.error('Failed to load filaments:', error);
    }
  };

  const loadConsumption = async () => {
    try {
      setLoading(true);
      const entry = await consumptionApi.get(parseInt(id!));
      setFormData({
        filament_id: entry.filament_id,
        amount_g: entry.amount_g,
        amount_m: entry.amount_m,
        print_name: entry.print_name || '',
        type: entry.type,
        notes: entry.notes || '',
      });
    } catch (error) {
      console.error('Failed to load consumption entry:', error);
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
        await consumptionApi.update(parseInt(id!), formData);
      } else {
        await consumptionApi.create(formData);
      }
      navigate('/history');
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const selectedFilament = filaments.find(f => f.id === formData.filament_id);
  const canConsume = selectedFilament && formData.amount_g > 0 && formData.amount_g <= (selectedFilament.remaining_weight_g || 0);

  if (loading && isEdit) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '2rem',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.body,
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 200ms ease' }}>
      <h1 style={{
        fontSize: theme.typography.h1,
        fontWeight: 700,
        color: theme.colors.text.primary,
        marginBottom: '2rem',
        fontFamily: theme.typography.fontFamily,
      }}>
        {isEdit ? t('consumption.edit') : t('consumption.add')}
      </h1>
      <Card style={{ padding: '2rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <FilamentSelect
            filaments={filaments}
            selectedFilamentId={formData.filament_id || 0}
            onFilamentChange={(filamentId) => setFormData({ ...formData, filament_id: filamentId })}
            label={t('consumption.filament')}
            required
            placeholder={t('common.required') || 'Select...'}
          />
          {selectedFilament && (
            <div style={{ 
              padding: '0.75rem',
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.small,
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('filament.remainingWeight')}: <strong style={{ color: theme.colors.text.primary }}>{(selectedFilament.remaining_weight_g || 0).toFixed(1)}g</strong>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label={t('consumption.amount_g')}
              type="number"
              required
              step="0.1"
              min="0"
              value={formData.amount_g.toString()}
              onChange={(e) => setFormData({ ...formData, amount_g: parseFloat(e.target.value) || 0 })}
            />
            <Input
              label={t('consumption.amount_m')}
              type="number"
              step="0.1"
              min="0"
              value={formData.amount_m?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, amount_m: e.target.value ? parseFloat(e.target.value) : null })}
            />
          </div>

          {selectedFilament && formData.amount_g > (selectedFilament.remaining_weight_g || 0) && (
            <div style={{
              padding: '0.75rem',
              background: `${theme.colors.status.danger}15`,
              color: theme.colors.status.danger,
              borderRadius: theme.borderRadius.medium,
              fontSize: theme.typography.small,
              fontFamily: theme.typography.fontFamily,
              border: `1px solid ${theme.colors.status.danger}30`,
            }}>
              {t('consumption.insufficientFilament')}
            </div>
          )}

          <Input
            label={t('consumption.printName')}
            type="text"
            value={formData.print_name || ''}
            onChange={(e) => setFormData({ ...formData, print_name: e.target.value })}
          />

          <Select
            label={t('consumption.type')}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            required
          >
            <option value="success">{t('consumption.typeSuccess')}</option>
            <option value="failed">{t('consumption.typeFailed')}</option>
            <option value="test">{t('consumption.typeTest')}</option>
            <option value="manual">{t('consumption.typeManual')}</option>
          </Select>

          <div>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              fontWeight: 600,
              fontSize: theme.typography.small,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('consumption.notes')}
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text.primary,
                fontSize: theme.typography.body,
                fontFamily: theme.typography.fontFamily,
                outline: 'none',
                transition: `all ${theme.transitions.fast}`,
                resize: 'vertical',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary.main;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !canConsume}
              fullWidth
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate('/history')}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

