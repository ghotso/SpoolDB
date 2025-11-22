import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { filamentsApi, materialsApi, colorsApi } from '../api/client';
import type { Filament, Material, Color } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { ColorFilterDropdown } from '../components/ColorFilterDropdown';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Select } from '../components/Select';
import { ConsumptionChoiceModal } from '../components/ConsumptionChoiceModal';
import { FilamentFormModal } from '../components/FilamentFormModal';

export function Inventory() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | null>(null);
  const [selectedColorId, setSelectedColorId] = useState<number | null>(null);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showFilamentModal, setShowFilamentModal] = useState(false);
  const [selectedFilamentId, setSelectedFilamentId] = useState<number | null>(null);
  const { t } = useI18n();
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [showArchived]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [filamentsData, materialsData, colorsData] = await Promise.all([
        filamentsApi.list(showArchived),
        materialsApi.list(),
        colorsApi.list(),
      ]);
      setFilaments(filamentsData);
      setMaterials(materialsData);
      setColors(colorsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique colors that exist in filaments
  const availableColors = useMemo(() => {
    const colorIds = new Set(filaments.map(f => f.color_id).filter(id => id !== null));
    return colors.filter(c => colorIds.has(c.id));
  }, [filaments, colors]);

  // Get unique materials that exist in filaments
  const availableMaterials = useMemo(() => {
    const materialIds = new Set(filaments.map(f => f.material_id).filter(id => id !== null));
    return materials.filter(m => materialIds.has(m.id));
  }, [filaments, materials]);

  // Filter filaments based on selected filters
  const filteredFilaments = useMemo(() => {
    return filaments.filter(filament => {
      if (selectedMaterialId !== null && filament.material_id !== selectedMaterialId) {
        return false;
      }
      if (selectedColorId !== null && filament.color_id !== selectedColorId) {
        return false;
      }
      return true;
    });
  }, [filaments, selectedMaterialId, selectedColorId]);

  const calculateRemainingPercent = (filament: Filament): number | null => {
    // If we have spools data, calculate from them (only non-archived spools)
    if (filament.spools && filament.spools.length > 0) {
      const nonArchivedSpools = filament.spools.filter(spool => !spool.archived);
      
      // If no non-archived spools, return null to show "No spools"
      if (nonArchivedSpools.length === 0) {
        return null;
      }
      
      const totalStartingWeight = nonArchivedSpools.reduce((sum, spool) => sum + spool.starting_weight_g, 0);
      const totalEmptyWeight = nonArchivedSpools.reduce((sum, spool) => sum + (spool.empty_weight_g || 0), 0);
      const netWeight = totalStartingWeight - totalEmptyWeight;
      if (netWeight <= 0) return 0;
      const remaining = filament.remaining_weight_g || 0;
      return Math.max(0, Math.min(100, (remaining / netWeight) * 100));
    }
    
    // If no spools data, we can't calculate percentage
    // Return null to indicate we should show "No spools" instead
    return null;
  };

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem',
        color: theme.colors.text.secondary,
        fontSize: theme.typography.body,
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
          {t('inventory.title')}
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            cursor: 'pointer',
            fontSize: theme.typography.body,
            color: theme.colors.text.secondary,
            fontFamily: theme.typography.fontFamily,
          }}>
            <input
              type="checkbox"
              checked={showArchived}
              onChange={(e) => setShowArchived(e.target.checked)}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: theme.colors.primary.main,
              }}
            />
            {showArchived ? t('inventory.hideArchived') : t('inventory.showArchived')}
          </label>
          <Button variant="primary" onClick={() => setShowFilamentModal(true)}>
            {t('filament.add')}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-end',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Select
              label={t('inventory.filterByMaterial')}
              value={selectedMaterialId ?? ''}
              onChange={(e) => setSelectedMaterialId(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">{t('inventory.allMaterials')}</option>
              {availableMaterials.map(material => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </Select>
          </div>

          <ColorFilterDropdown
            colors={availableColors}
            selectedColorId={selectedColorId}
            onColorChange={setSelectedColorId}
            label={t('inventory.filterByColor')}
            allLabel={t('inventory.allColors')}
          />

          {(selectedMaterialId !== null || selectedColorId !== null) && (
            <Button
              variant="secondary"
              onClick={() => {
                setSelectedMaterialId(null);
                setSelectedColorId(null);
              }}
            >
              {t('common.clear')}
            </Button>
          )}
        </div>
      </Card>

      {filteredFilaments.length === 0 ? (
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
          }}>
            {filaments.length === 0 ? t('inventory.noFilaments') : t('inventory.noFilamentsMatchFilter')}
          </div>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredFilaments.map(filament => {
            const percent = calculateRemainingPercent(filament);
            // const hasSpools = filament.spools && filament.spools.filter(spool => !spool.archived).length > 0;
            const lowStock = percent !== null && percent < 20;
            
            return (
              <Card
                key={filament.id}
                hoverable
                onClick={() => navigate(`/filaments/${filament.id}`)}
                style={{
                  border: `2px solid ${lowStock ? theme.colors.status.danger : theme.colors.border}`,
                  opacity: filament.archived ? 0.6 : 1,
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  cursor: 'pointer',
                }}
              >
                {/* Header Section */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'start',
                  gap: '1rem',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ 
                      margin: 0, 
                      marginBottom: '0.75rem',
                      fontSize: theme.typography.h3,
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      fontFamily: theme.typography.fontFamily,
                      lineHeight: 1.3,
                    }}>
                      {filament.name}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      color: theme.colors.text.secondary, 
                      fontSize: theme.typography.small,
                      fontFamily: theme.typography.fontFamily,
                      marginBottom: '0.5rem',
                    }}>
                      {filament.color?.hex && (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: filament.color.hex,
                            border: `2px solid ${theme.colors.border}`,
                            flexShrink: 0,
                            boxShadow: `0 0 0 1px ${theme.colors.border}20`,
                          }}
                          title={filament.color.hex}
                        />
                      )}
                      <span style={{ fontWeight: 500 }}>
                        {filament.material?.name} • {filament.color?.name || filament.color?.hex}
                      </span>
                    </div>
                    {filament.manufacturer && (
                      <div style={{ 
                        color: theme.colors.text.secondary, 
                        fontSize: theme.typography.small, 
                        fontFamily: theme.typography.fontFamily,
                      }}>
                        {filament.manufacturer}
                      </div>
                    )}
                  </div>
                  {filament.archived && (
                    <span style={{
                      padding: '0.375rem 0.75rem',
                      background: theme.colors.text.secondary,
                      color: theme.colors.background,
                      borderRadius: theme.borderRadius.small,
                      fontSize: theme.typography.small,
                      fontWeight: 600,
                      fontFamily: theme.typography.fontFamily,
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}>
                      {t('filament.archived')}
                    </span>
                  )}
                </div>

                {/* Remaining Weight Section */}
                <div style={{ 
                  padding: '1rem',
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.medium,
                  border: `1px solid ${theme.colors.border}`,
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'baseline',
                    marginBottom: '0.75rem' 
                  }}>
                    <span style={{ 
                      fontSize: theme.typography.small, 
                      color: theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamily,
                      fontWeight: 500,
                    }}>
                      {t('filament.remainingWeight')}
                    </span>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      justifyContent: 'flex-end',
                    }}>
                      <span style={{ 
                        fontWeight: 700,
                        fontSize: theme.typography.h3,
                        color: theme.colors.text.primary,
                        fontFamily: theme.typography.fontFamily,
                      }}>
                        {(filament.remaining_weight_g || 0).toFixed(1)}g
                      </span>
                      {percent !== null && (
                        <span style={{ 
                          fontWeight: 600,
                          fontSize: theme.typography.body,
                          color: lowStock 
                            ? theme.colors.status.danger 
                            : percent < 50 
                              ? theme.colors.status.warning 
                              : theme.colors.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                        }}>
                          ({percent.toFixed(0)}%)
                        </span>
                      )}
                      {percent === null && (
                        <span style={{ 
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.small,
                          fontFamily: theme.typography.fontFamily,
                        }}>
                          {t('filament.noSpools')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{
                    height: '10px',
                    background: theme.colors.background,
                    borderRadius: theme.borderRadius.small,
                    overflow: 'hidden',
                    border: `1px solid ${theme.colors.border}`,
                  }}>
                    {percent === null ? (
                      <div style={{
                        height: '100%',
                        width: '100%',
                        background: theme.colors.text.secondary,
                        opacity: 0.2,
                        borderRadius: theme.borderRadius.small,
                      }} />
                    ) : (
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
                        boxShadow: `0 0 4px ${lowStock 
                          ? theme.colors.status.danger 
                          : percent < 50 
                            ? theme.colors.status.warning 
                            : theme.colors.status.success}40`,
                      }} />
                    )}
                  </div>
                </div>

                {/* Low Stock Warning */}
                {lowStock && (
                  <div style={{
                    padding: '0.75rem',
                    background: `${theme.colors.status.danger}15`,
                    color: theme.colors.status.danger,
                    borderRadius: theme.borderRadius.medium,
                    fontSize: theme.typography.small,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontFamily: theme.typography.fontFamily,
                    border: `1px solid ${theme.colors.status.danger}30`,
                  }}>
                    {t('filament.lowStock')}
                  </div>
                )}

                {/* Action Buttons */}
                <div 
                  style={{ 
                    display: 'flex', 
                    gap: '0.5rem',
                    marginTop: lowStock ? 0 : '0.5rem',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button 
                    variant="primary" 
                    style={{ 
                      fontSize: theme.typography.small, 
                      padding: '0.5rem 1rem',
                      fontWeight: 600,
                      flex: '0 0 auto',
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/filaments/${filament.id}`);
                    }}
                  >
                    {t('common.details') || 'Details'}
                  </Button>
                  <Button 
                    variant="secondary" 
                    fullWidth 
                    style={{ 
                      fontSize: theme.typography.small, 
                      padding: '0.5rem',
                      fontWeight: 600,
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedFilamentId(filament.id);
                      setShowConsumptionModal(true);
                    }}
                  >
                    {t('consumption.add')}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {showConsumptionModal && (
        <ConsumptionChoiceModal
          filamentId={selectedFilamentId || undefined}
          onClose={() => {
            setShowConsumptionModal(false);
            setSelectedFilamentId(null);
          }}
          onSuccess={() => {
            setShowConsumptionModal(false);
            setSelectedFilamentId(null);
            loadData();
          }}
        />
      )}

      {showFilamentModal && (
        <FilamentFormModal
          onClose={() => setShowFilamentModal(false)}
          onSuccess={() => {
            setShowFilamentModal(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
