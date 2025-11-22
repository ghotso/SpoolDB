import { useState, useEffect } from 'react';
import { consumptionApi, filamentsApi } from '../api/client';
import type { ConsumptionEntry, Filament } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Select } from '../components/Select';
import { Input } from '../components/Input';
import { ConsumptionChoiceModal } from '../components/ConsumptionChoiceModal';
import { ConsumptionFormModal } from '../components/ConsumptionFormModal';

export function History() {
  const [entries, setEntries] = useState<ConsumptionEntry[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    filament_id?: number;
    type?: string;
    startDate?: string;
    endDate?: string;
  }>({});
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsumptionId, setEditingConsumptionId] = useState<number | null>(null);
  const { t } = useI18n();
  const { theme } = useTheme();

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [entriesData, filamentsData] = await Promise.all([
        consumptionApi.list(filters),
        filamentsApi.list(false),
      ]);
      setEntries(entriesData);
      setFilaments(filamentsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    try {
      await consumptionApi.delete(id);
      loadData();
    } catch (error: any) {
      alert(error.message || t('errors.deleteFailed'));
    }
  };

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'failed': return 'cancel';
      case 'test': return 'science';
      default: return 'edit';
    }
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'success': return theme.colors.status.success;
      case 'failed': return theme.colors.status.danger;
      case 'test': return theme.colors.status.warning;
      default: return theme.colors.status.info;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'success': return t('consumption.typeSuccess');
      case 'failed': return t('consumption.typeFailed');
      case 'test': return t('consumption.typeTest');
      default: return t('consumption.typeManual');
    }
  };

  if (loading) {
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
    <div style={{ animation: 'fadeIn 200ms ease' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{
          fontSize: theme.typography.h1,
          fontWeight: 700,
          color: theme.colors.text.primary,
          margin: 0,
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('history.title')}
        </h1>
        <Button 
          variant="primary"
          onClick={() => setShowConsumptionModal(true)}
        >
          {t('consumption.add')}
        </Button>
      </div>

      <Card style={{ marginBottom: '2rem' }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          fontSize: theme.typography.h3,
          fontWeight: 600,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('history.filter')}
        </h3>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <Select
            label={t('history.filterByFilament')}
            value={filters.filament_id || ''}
            onChange={(e) => setFilters({ ...filters, filament_id: e.target.value ? parseInt(e.target.value) : undefined })}
          >
            <option value="">{t('history.allFilaments')}</option>
            {filaments.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </Select>

          <Select
            label={t('history.filterByType')}
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value || undefined })}
          >
            <option value="">{t('history.allTypes')}</option>
            <option value="success">{t('consumption.typeSuccess')}</option>
            <option value="failed">{t('consumption.typeFailed')}</option>
            <option value="test">{t('consumption.typeTest')}</option>
            <option value="manual">{t('consumption.typeManual')}</option>
          </Select>

          <Input
            label={`${t('history.filterByDate')} (${t('common.optional')})`}
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
          />

          <Input
            label={t('common.optional')}
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
          />
        </div>
        {(filters.filament_id || filters.type || filters.startDate || filters.endDate) && (
          <Button
            variant="secondary"
            onClick={() => setFilters({})}
            style={{ marginTop: '1rem' }}
          >
            {t('common.clear')}
          </Button>
        )}
      </Card>

      {entries.length === 0 ? (
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('history.empty')}
          </div>
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: 0,
            }}>
              <thead>
                <tr style={{ 
                  background: theme.colors.surface,
                }}>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                    borderLeft: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('consumption.createdAt')}
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('consumption.filament')}
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('consumption.amount_g')}
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'left',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('consumption.printName')}
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('consumption.type')}
                  </th>
                  <th style={{ 
                    padding: '1rem', 
                    textAlign: 'center',
                    fontSize: theme.typography.small,
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    borderBottom: `2px solid ${theme.colors.border}`,
                    borderTop: `1px solid ${theme.colors.border}`,
                    borderRight: `1px solid ${theme.colors.border}`,
                  }}>
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry, index) => {
                  const isLast = index === entries.length - 1;
                  
                  return (
                    <tr 
                      key={entry.id} 
                      style={{ 
                        background: index % 2 === 0 ? theme.colors.background : theme.colors.surface,
                        transition: `all ${theme.transitions.fast}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.mode === 'dark' 
                          ? theme.colors.elevated || theme.colors.surface
                          : `${theme.colors.primary.main}08`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = index % 2 === 0 ? theme.colors.background : theme.colors.surface;
                      }}
                    >
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.primary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                        borderLeft: `1px solid ${theme.colors.border}`,
                      }}>
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.primary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {entry.filament?.name || `Filament #${entry.filament_id}`}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.primary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {entry.amount_g.toFixed(1)}g
                        {entry.amount_m && ` (${entry.amount_m.toFixed(1)}m)`}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.secondary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {entry.print_name || '-'}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <span 
                            className="material-symbols-outlined"
                            title={getTypeLabel(entry.type)}
                            style={{
                              fontSize: '24px',
                              color: getTypeColor(entry.type),
                            }}
                          >
                            {getTypeIcon(entry.type)}
                          </span>
                        </div>
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                        borderRight: `1px solid ${theme.colors.border}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                          <button
                            onClick={() => {
                              setEditingConsumptionId(entry.id);
                              setShowEditModal(true);
                            }}
                            title={t('common.edit')}
                            style={{
                              padding: '0.5rem',
                              borderRadius: theme.borderRadius.small,
                              border: `1px solid ${theme.colors.primary.main}`,
                              background: theme.colors.surface,
                              color: theme.colors.primary.main,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: `all ${theme.transitions.fast}`,
                              width: '36px',
                              height: '36px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = theme.colors.primary.main;
                              e.currentTarget.style.color = '#FFFFFF';
                              e.currentTarget.style.borderColor = theme.colors.primary.main;
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.colors.surface;
                              e.currentTarget.style.color = theme.colors.primary.main;
                              e.currentTarget.style.borderColor = theme.colors.primary.main;
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            title={t('common.delete')}
                            style={{
                              padding: '0.5rem',
                              borderRadius: theme.borderRadius.small,
                              border: `1px solid ${theme.colors.status.danger}`,
                              background: theme.colors.surface,
                              color: theme.colors.status.danger,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: `all ${theme.transitions.fast}`,
                              width: '36px',
                              height: '36px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = theme.colors.status.danger;
                              e.currentTarget.style.color = '#FFFFFF';
                              e.currentTarget.style.borderColor = theme.colors.status.danger;
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = theme.colors.surface;
                              e.currentTarget.style.color = theme.colors.status.danger;
                              e.currentTarget.style.borderColor = theme.colors.status.danger;
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {showConsumptionModal && (
        <ConsumptionChoiceModal
          onClose={() => setShowConsumptionModal(false)}
          onSuccess={() => {
            setShowConsumptionModal(false);
            loadData();
          }}
        />
      )}

      {showEditModal && editingConsumptionId && (
        <ConsumptionFormModal
          consumptionId={editingConsumptionId}
          onClose={() => {
            setShowEditModal(false);
            setEditingConsumptionId(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setEditingConsumptionId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
