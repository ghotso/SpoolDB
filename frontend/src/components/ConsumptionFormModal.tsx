import { useState, useEffect } from 'react';
import { consumptionApi, filamentsApi } from '../api/client';
import type { Filament, CreateConsumptionInput } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { FilamentSelect } from './FilamentSelect';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Card } from './Card';

interface ConsumptionFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  filamentId?: number;
  consumptionId?: number; // For editing
}

export function ConsumptionFormModal({ onClose, onSuccess, filamentId, consumptionId }: ConsumptionFormModalProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const isEdit = !!consumptionId;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [formData, setFormData] = useState<CreateConsumptionInput>({
    filament_id: filamentId || 0,
    amount_g: 0,
    amount_m: null,
    print_name: '',
    type: 'success',
    notes: '',
  });

  useEffect(() => {
    loadFilaments();
    if (isEdit && consumptionId) {
      loadConsumption();
    }
  }, [isEdit, consumptionId]);

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
      setInitialLoading(true);
      const entry = await consumptionApi.get(consumptionId!);
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
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEdit) {
        await consumptionApi.update(consumptionId!, formData);
      } else {
        await consumptionApi.create(formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const selectedFilament = filaments.find(f => f.id === formData.filament_id);
  // For editing, skip the remaining weight check since we're modifying an existing entry
  const canConsume = isEdit 
    ? selectedFilament && formData.amount_g > 0
    : selectedFilament && formData.amount_g > 0 && formData.amount_g <= (selectedFilament.remaining_weight_g || 0);

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
            {isEdit ? t('consumption.edit') : t('consumption.add')}
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

          {!isEdit && selectedFilament && formData.amount_g > (selectedFilament.remaining_weight_g || 0) && (
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
              disabled={loading || !canConsume}
            >
              {loading ? t('common.loading') : t('common.save')}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

