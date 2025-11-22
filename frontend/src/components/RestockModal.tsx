import { useState, useEffect } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { Button } from './Button';
import { Card } from './Card';
import { Input } from './Input';
import { FilamentSelect } from './FilamentSelect';
import { filamentsApi } from '../api/client';
import type { Filament } from '../types';

interface RestockModalProps {
  onClose: () => void;
  filamentId?: number;
  onSuccess?: () => void;
}

export function RestockModal({ onClose, filamentId, onSuccess }: RestockModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [selectedFilamentId, setSelectedFilamentId] = useState<number>(filamentId || 0);
  
  // Update selectedFilamentId when filamentId prop changes
  useEffect(() => {
    if (filamentId) {
      setSelectedFilamentId(filamentId);
    }
  }, [filamentId]);
  const [quantity, setQuantity] = useState<number>(1);
  const [weightPerSpool, setWeightPerSpool] = useState<number>(1000);
  const [emptyWeight, setEmptyWeight] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFilaments();
  }, []);

  const loadFilaments = async () => {
    try {
      const data = await filamentsApi.list(false); // Only non-archived
      setFilaments(data);
      if (filamentId && !selectedFilamentId) {
        setSelectedFilamentId(filamentId);
      }
    } catch (error) {
      console.error('Failed to load filaments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilamentId || quantity < 1 || weightPerSpool <= 0) return;

    try {
      setLoading(true);
      await filamentsApi.restock(selectedFilamentId, quantity, weightPerSpool, emptyWeight);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.reload();
      }
      onClose();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setLoading(false);
    }
  };

  const selectedFilament = filaments.find(f => f.id === selectedFilamentId);

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
        maxWidth: '500px',
        width: '90%',
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.large,
          animation: 'modalContentFade 200ms ease',
      }}>
        <h2 style={{
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginTop: 0,
          marginBottom: '1rem',
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('filament.restock') || 'Restock Filament'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {!filamentId && (
            <FilamentSelect
              filaments={filaments}
              selectedFilamentId={selectedFilamentId}
              onFilamentChange={setSelectedFilamentId}
              label={t('filament.name') || 'Filament'}
              required
              placeholder={t('common.required') || 'Select...'}
            />
          )}

          {selectedFilament && (
            <div style={{
              padding: '0.75rem',
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.small,
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                {selectedFilament.color?.hex && (
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: selectedFilament.color.hex,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  />
                )}
                <span style={{ fontWeight: 600, color: theme.colors.text.primary }}>
                  {selectedFilament.material?.name} • {selectedFilament.color?.name}
                </span>
              </div>
              {selectedFilament.manufacturer && (
                <div>{selectedFilament.manufacturer}</div>
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <Input
              label={t('filament.restockQuantity') || 'Amount of Spools'}
              type="number"
              required
              step="1"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
            <Input
              label={t('filament.restockWeightPerSpool') || 'Weight per Spool (g)'}
              type="number"
              required
              step="0.1"
              min="0.1"
              value={weightPerSpool}
              onChange={(e) => setWeightPerSpool(parseFloat(e.target.value) || 0)}
            />
            <Input
              label={t('filament.emptyWeight') || 'Empty Weight (g)'}
              type="number"
              step="0.1"
              min="0"
              value={emptyWeight || ''}
              onChange={(e) => setEmptyWeight(e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={onClose} type="button">
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={loading || !selectedFilamentId || quantity < 1 || weightPerSpool <= 0}
            >
              {loading ? (t('common.loading') || 'Loading...') : (t('common.save') || 'Restock')}
            </Button>
          </div>
        </form>
      </Card>
    </>
  );
}

