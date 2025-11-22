import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { filamentsApi, consumptionApi, spoolsApi } from '../api/client';
import type { Filament, ConsumptionEntry } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ConsumptionChoiceModal } from '../components/ConsumptionChoiceModal';
import { RestockModal } from '../components/RestockModal';
import { FilamentFormModal } from '../components/FilamentFormModal';
import { ConsumptionFormModal } from '../components/ConsumptionFormModal';

export function FilamentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { theme } = useTheme();
  const [filament, setFilament] = useState<Filament | null>(null);
  const [consumptionEntries, setConsumptionEntries] = useState<ConsumptionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingConsumptionId, setEditingConsumptionId] = useState<number | null>(null);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filamentData, entriesData] = await Promise.all([
        filamentsApi.get(parseInt(id!)),
        consumptionApi.list({ filament_id: parseInt(id!) }),
      ]);
      setFilament(filamentData);
      setConsumptionEntries(entriesData);
    } catch (error) {
      console.error('Failed to load filament:', error);
      alert(t('errors.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!filament) return;
    try {
      await filamentsApi.archive(filament.id, !filament.archived);
      loadData();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    }
  };

  const handleDelete = async () => {
    if (!filament) return;
    const hasEntries = consumptionEntries.length > 0;
    const confirmMessage = hasEntries
      ? t('filament.forceDeleteConfirm')
      : t('common.delete') + '?';
    
    if (!confirm(confirmMessage)) return;

    try {
      await filamentsApi.delete(filament.id, hasEntries);
      navigate('/');
    } catch (error: any) {
      alert(error.message || t('errors.deleteFailed'));
    }
  };

  const calculateRemainingPercent = (): number => {
    if (!filament) return 0;
    // Calculate from spools
    const totalStartingWeight = filament.spools?.reduce((sum, spool) => sum + spool.starting_weight_g, 0) || 0;
    const totalEmptyWeight = filament.spools?.reduce((sum, spool) => sum + (spool.empty_weight_g || 0), 0) || 0;
    const netWeight = totalStartingWeight - totalEmptyWeight;
    if (netWeight <= 0) return 0;
    const remaining = filament.remaining_weight_g || 0;
    return Math.max(0, Math.min(100, (remaining / netWeight) * 100));
  };

  const isLowStock = (): boolean => {
    return calculateRemainingPercent() < 20;
  };

  // Get and sort unarchived spools
  const sortedSpools = useMemo(() => {
    if (!filament?.spools) return [];
    const unarchived = filament.spools.filter(spool => !spool.archived);
    
    // Sort: used spools (weight_g != starting_weight_g) first, then by created_at oldest first
    return unarchived.sort((a, b) => {
      const aUsed = a.weight_g !== a.starting_weight_g;
      const bUsed = b.weight_g !== b.starting_weight_g;
      
      if (aUsed && !bUsed) return -1;
      if (!aUsed && bUsed) return 1;
      
      // Both used or both unused, sort by created_at oldest first
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });
  }, [filament?.spools]);

  const handleArchiveSpool = async (spoolId: number) => {
    if (!confirm(t('spool.archive') + '?')) return;
    try {
      await spoolsApi.archive(spoolId, true);
      loadData();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
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

  if (!filament) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.body,
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('errors.notFound')}
      </div>
    );
  }

  const percent = calculateRemainingPercent();
  const lowStock = isLowStock();

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
          {filament.name}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="primary" onClick={() => setShowEditModal(true)}>
            {t('common.edit')}
          </Button>
          <Button variant="secondary" onClick={handleArchive}>
            {filament.archived ? t('filament.unarchive') : t('filament.archive')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Filament Information Card */}
        <Card style={{
          border: `2px solid ${lowStock ? theme.colors.status.danger : theme.colors.border}`,
        }}>
          <h2 style={{
            fontSize: theme.typography.h2,
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginTop: 0,
            marginBottom: '1rem',
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('filament.name')}
          </h2>
          
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              marginBottom: '0.5rem' 
            }}>
              {filament.color?.hex && (
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: filament.color.hex,
                    border: `2px solid ${theme.colors.border}`,
                    flexShrink: 0
                  }}
                  title={filament.color.hex}
                />
              )}
              <div>
                <div style={{
                  fontSize: theme.typography.body,
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {filament.material?.name} • {filament.color?.name}
                </div>
                {filament.manufacturer && (
                  <div style={{
                    fontSize: theme.typography.small,
                    color: theme.colors.text.secondary,
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {filament.manufacturer}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '0.5rem' 
            }}>
              <span style={{ 
                fontSize: theme.typography.small, 
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('filament.remainingWeight')}
              </span>
              <span style={{ 
                fontWeight: 600,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily,
              }}>
                {(filament.remaining_weight_g || 0).toFixed(1)}g ({percent.toFixed(0)}%)
              </span>
            </div>
            {filament.spools && filament.spools.length > 0 && (
              <div style={{ 
                marginTop: '0.5rem',
                paddingTop: '0.5rem',
                borderTop: `1px solid ${theme.colors.border}`,
              }}>
                <div style={{ 
                  fontSize: theme.typography.small, 
                  color: theme.colors.text.secondary,
                  marginBottom: '0.25rem',
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {t('filament.spools')}: {filament.spools.length}
                </div>
              </div>
            )}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              height: '12px',
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.small,
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${percent}%`,
                background: lowStock 
                  ? theme.colors.status.danger 
                  : percent < 50 
                    ? theme.colors.status.warning 
                    : theme.colors.status.success,
                transition: `width ${theme.transitions.slow}`,
                borderRadius: theme.borderRadius.small,
              }} />
            </div>
          </div>

          {lowStock && (
            <div style={{
              padding: '0.75rem',
              background: `${theme.colors.status.danger}15`,
              color: theme.colors.status.danger,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.small,
              fontWeight: 500,
              textAlign: 'center',
              fontFamily: theme.typography.fontFamily,
              marginBottom: '1rem',
            }}>
              {t('filament.lowStock')}
            </div>
          )}

          {filament.notes && (
            <div style={{
              padding: '0.75rem',
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.small,
              color: theme.colors.text.secondary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {filament.notes}
            </div>
          )}

          {filament.archived && (
            <div style={{
              marginTop: '1rem',
              padding: '0.5rem',
              background: theme.colors.text.secondary,
              color: theme.colors.background,
              borderRadius: theme.borderRadius.small,
              fontSize: theme.typography.small,
              fontWeight: 500,
              textAlign: 'center',
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('filament.archived')}
            </div>
          )}
        </Card>

        {/* Quick Actions Card */}
        <Card>
          <h2 style={{
            fontSize: theme.typography.h2,
            fontWeight: 600,
            color: theme.colors.text.primary,
            marginTop: 0,
            marginBottom: '1rem',
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('common.actions')}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button 
              variant="secondary" 
              fullWidth
              onClick={() => setShowEditModal(true)}
            >
              {t('common.edit')}
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowRestockModal(true)} 
              fullWidth
            >
              {t('filament.restock')}
            </Button>
            <Button variant="secondary" onClick={handleArchive} fullWidth>
              {filament.archived ? t('filament.unarchive') : t('filament.archive')}
            </Button>
            <Button variant="danger" onClick={handleDelete} fullWidth>
              {t('common.delete')}
            </Button>
          </div>
        </Card>
      </div>

      {/* Spools Overview */}
      <Card style={{ marginBottom: '2rem' }}>
        <h2 style={{
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginTop: 0,
          marginBottom: '1rem',
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('filament.spools')}
        </h2>

        {sortedSpools.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('filament.noSpools')}
          </div>
        ) : (
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
                    {t('spool.initialWeight') || 'Initial Weight (g)'}
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
                    {t('spool.remaining') || 'Remaining (g)'}
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
                    {t('spool.createdAt') || 'Created'}
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
                    {t('spool.lastUsed') || 'Last Used'}
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
                {sortedSpools.map((spool, index) => {
                  const remaining = spool.weight_g - (spool.empty_weight_g || 0);
                  const isLast = index === sortedSpools.length - 1;
                  
                  return (
                    <tr 
                      key={spool.id} 
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
                        {spool.starting_weight_g.toFixed(1)}g
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: remaining <= 0 ? theme.colors.status.danger : theme.colors.text.primary,
                        fontFamily: theme.typography.fontFamily,
                        fontWeight: remaining <= 0 ? 600 : 400,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {remaining.toFixed(1)}g
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.secondary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {new Date(spool.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        fontSize: theme.typography.body,
                        color: theme.colors.text.secondary,
                        fontFamily: theme.typography.fontFamily,
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                      }}>
                        {new Date(spool.updated_at).toLocaleDateString()}
                      </td>
                      <td style={{ 
                        padding: '1rem',
                        textAlign: 'center',
                        borderBottom: isLast ? `1px solid ${theme.colors.border}` : `1px solid ${theme.colors.border}`,
                        borderRight: `1px solid ${theme.colors.border}`,
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            onClick={() => handleArchiveSpool(spool.id)}
                            title={t('spool.archive')}
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
                              archive
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
        )}
      </Card>

      {/* Consumption History */}
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <h2 style={{
            fontSize: theme.typography.h2,
            fontWeight: 600,
            color: theme.colors.text.primary,
            margin: 0,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('history.title')}
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Button 
              variant="primary"
              onClick={() => {
                setShowConsumptionModal(true);
              }}
            >
              {t('consumption.add')}
            </Button>
          </div>
        </div>

        {consumptionEntries.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('history.empty')}
          </div>
        ) : (
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
                {consumptionEntries.map((entry, index) => {
                  const isLast = index === consumptionEntries.length - 1;
                  
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
                            onClick={async () => {
                              if (!confirm(t('common.delete') + '?')) return;
                              try {
                                await consumptionApi.delete(entry.id);
                                loadData();
                              } catch (error: any) {
                                alert(error.message || t('errors.deleteFailed'));
                              }
                            }}
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
        )}
      </Card>

      {showConsumptionModal && filament && (
        <ConsumptionChoiceModal
          filamentId={filament.id}
          onClose={() => setShowConsumptionModal(false)}
        />
      )}

      {showRestockModal && filament && (
        <RestockModal
          filamentId={filament.id}
          onClose={() => setShowRestockModal(false)}
          onSuccess={() => {
            loadData();
            setShowRestockModal(false);
          }}
        />
      )}

      {showEditModal && filament && (
        <FilamentFormModal
          filamentId={filament.id}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadData();
          }}
        />
      )}

      {editingConsumptionId && (
        <ConsumptionFormModal
          consumptionId={editingConsumptionId}
          onClose={() => {
            setEditingConsumptionId(null);
          }}
          onSuccess={() => {
            setEditingConsumptionId(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
