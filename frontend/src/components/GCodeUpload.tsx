import { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { Button } from './Button';
import { Card } from './Card';
import { FilamentSelect } from './FilamentSelect';
import { gcodeApi, filamentsApi, materialsApi, colorsApi } from '../api/client';
import type { Filament } from '../types';

interface GCodeUploadProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  filamentId?: number;
  onCancel?: () => void;
  onCreateFilament?: (gcodeData: { materialId?: number; colorId?: number; name?: string }) => void;
}

interface ParsedMetadata {
  slicer: string;
  usedFilamentM: number | null;
  usedFilamentG: number | null;
  printTime: string | null;
  materialType: string | null;
  color: string | null;
  modelName: string | null;
  layerCount: number | null;
  maxZHeight: number | null;
}

export function GCodeUpload({ onSuccess, onError, filamentId, onCancel, onCreateFilament }: GCodeUploadProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFilamentId, setSelectedFilamentId] = useState<number | null>(null);
  const [metadata, setMetadata] = useState<ParsedMetadata | null>(null);
  const [suggestedFilaments, setSuggestedFilaments] = useState<Filament[]>([]);
  const [allFilaments, setAllFilaments] = useState<Filament[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [creatingFilament, setCreatingFilament] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFilaments = async () => {
    try {
      const filaments = await filamentsApi.list(false); // Exclude archived
      setAllFilaments(filaments);
    } catch (error) {
      console.error('Failed to load filaments:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.name.toLowerCase().endsWith('.gcode')) {
      onError(t('gcode.invalidFileType') || 'Only .gcode files are allowed');
      return;
    }

    // Validate file size (50MB limit)
    if (selectedFile.size > 50 * 1024 * 1024) {
      onError(t('gcode.fileTooLarge') || 'File size must be less than 50MB');
      return;
    }

    try {
      setParsing(true);
      setFile(selectedFile);
      
      // Load filaments for selection
      await loadFilaments();

      // Parse G-code
      const result = await gcodeApi.parse(selectedFile);

      setMetadata(result.metadata);
      setSuggestedFilaments(result.suggestedFilaments || []);

      // Auto-select filament if exactly one match
      if (result.suggestedFilaments && result.suggestedFilaments.length === 1) {
        setSelectedFilamentId(result.suggestedFilaments[0].id);
      } else if (result.suggestedFilaments && result.suggestedFilaments.length > 1) {
        // If multiple matches, select the first one (user can change)
        setSelectedFilamentId(result.suggestedFilaments[0].id);
      } else if (filamentId) {
        // Use pre-selected filament if provided
        setSelectedFilamentId(filamentId);
      }

      setShowConfirm(true);
    } catch (error: any) {
      onError(error.message || t('gcode.parseFailed') || 'Failed to parse G-code');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!file || !selectedFilamentId || !metadata) {
      onError(t('gcode.selectFilament') || 'Please select a filament');
      return;
    }

    // Check if we have required data
    if (!metadata.usedFilamentG && !metadata.usedFilamentM) {
      onError(t('gcode.noFilamentData') || 'Could not extract filament usage from G-code');
      return;
    }

    try {
      setUploading(true);

      await gcodeApi.upload(file, selectedFilamentId, 'success');

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Reset state
      setFile(null);
      setMetadata(null);
      setSuggestedFilaments([]);
      setSelectedFilamentId(null);
      setShowConfirm(false);

      // Call success callback
      onSuccess();
    } catch (error: any) {
      onError(error.message || t('gcode.uploadFailed') || 'Failed to upload G-code');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setShowConfirm(false);
    setFile(null);
    setMetadata(null);
    setSuggestedFilaments([]);
    setSelectedFilamentId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Combine suggested and all filaments, with suggested first
  const availableFilaments = useMemo(() => {
    const combined = [...suggestedFilaments];
    const otherFilaments = allFilaments.filter(f => !suggestedFilaments.find(sf => sf.id === f.id));
    return [...combined, ...otherFilaments];
  }, [suggestedFilaments, allFilaments]);

  const handleCreateMatchingFilament = async () => {
    if (!metadata) return;

    try {
      setCreatingFilament(true);

      // Get or create material
      let materialId: number | null = null;
      if (metadata.materialType) {
        const materials = await materialsApi.list();
        const existingMaterial = materials.find(m => 
          m.name.toLowerCase() === metadata.materialType!.toLowerCase()
        );
        
        if (existingMaterial) {
          materialId = existingMaterial.id;
        } else {
          // Create new material
          const newMaterial = await materialsApi.create({ name: metadata.materialType });
          materialId = newMaterial.id;
        }
      }

      // Get or create color
      let colorId: number | null = null;
      if (metadata.color) {
        const colors = await colorsApi.list();
        const existingColor = colors.find(c => c.hex?.toUpperCase() === metadata.color!.toUpperCase());
        
        if (existingColor) {
          colorId = existingColor.id;
        } else {
          // Create new color with hex code as name
          const newColor = await colorsApi.create({ 
            name: metadata.color,
            hex: metadata.color 
          });
          colorId = newColor.id;
        }
      }

      // If onCreateFilament callback is provided, use it instead of navigating
      if (onCreateFilament) {
        onCreateFilament({
          materialId: materialId || undefined,
          colorId: colorId || undefined,
          name: metadata.modelName || undefined,
        });
      } else {
        // Fallback: Build URL with pre-filled data and navigate
        const params = new URLSearchParams();
        if (materialId) params.append('material_id', materialId.toString());
        if (colorId) params.append('color_id', colorId.toString());
        if (metadata.modelName) params.append('name', metadata.modelName);
        params.append('from_gcode', 'true');
        params.append('gcode_file', file?.name || '');

        // Navigate to filament form with pre-filled data
        navigate(`/filaments/new?${params.toString()}`);
      }
    } catch (error: any) {
      onError(error.message || t('gcode.createFilamentFailed') || 'Failed to prepare filament creation');
      setCreatingFilament(false);
    }
  };

  if (showConfirm && metadata) {
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
          onClick={handleCancel}
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
            {t('gcode.confirmTitle') || 'Confirm Consumption Entry'}
          </h2>
          <button
            onClick={handleCancel}
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

        <div style={{ 
          marginBottom: '2rem',
          padding: '1.5rem',
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.medium,
          border: `1px solid ${theme.colors.border}`,
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem',
          }}>
            <div>
              <div style={{ 
                fontSize: theme.typography.small,
                color: theme.colors.text.secondary,
                marginBottom: '0.25rem',
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('gcode.slicer') || 'Slicer'}
              </div>
              <div style={{ 
                fontSize: theme.typography.body,
                color: theme.colors.text.primary,
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily,
              }}>
                {metadata.slicer}
              </div>
            </div>

            {metadata.modelName && (
              <div>
                <div style={{ 
                  fontSize: theme.typography.small,
                  color: theme.colors.text.secondary,
                  marginBottom: '0.25rem',
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {t('gcode.modelName') || 'Model'}
                </div>
                <div style={{ 
                  fontSize: theme.typography.body,
                  color: theme.colors.text.primary,
                  fontWeight: 500,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {metadata.modelName}
                </div>
              </div>
            )}

            {metadata.materialType && (
              <div>
                <div style={{ 
                  fontSize: theme.typography.small,
                  color: theme.colors.text.secondary,
                  marginBottom: '0.25rem',
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {t('gcode.material') || 'Material'}
                </div>
                <div style={{ 
                  fontSize: theme.typography.body,
                  color: theme.colors.text.primary,
                  fontWeight: 500,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {metadata.materialType}
                </div>
              </div>
            )}

            {metadata.color && (
              <div>
                <div style={{ 
                  fontSize: theme.typography.small,
                  color: theme.colors.text.secondary,
                  marginBottom: '0.25rem',
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {t('gcode.color') || 'Color'}
                </div>
                <div style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: metadata.color,
                      border: `2px solid ${theme.colors.border}`,
                      flexShrink: 0,
                    }}
                    title={metadata.color}
                  />
                  <div style={{ 
                    fontSize: theme.typography.body,
                    color: theme.colors.text.primary,
                    fontWeight: 500,
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {metadata.color}
                  </div>
                </div>
              </div>
            )}

            <div>
              <div style={{ 
                fontSize: theme.typography.small,
                color: theme.colors.text.secondary,
                marginBottom: '0.25rem',
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('gcode.filamentUsed') || 'Filament Used'}
              </div>
              <div style={{ 
                fontSize: theme.typography.body,
                color: theme.colors.text.primary,
                fontWeight: 500,
                fontFamily: theme.typography.fontFamily,
              }}>
                {metadata.usedFilamentG 
                  ? `${metadata.usedFilamentG.toFixed(1)}g`
                  : metadata.usedFilamentM 
                    ? `${metadata.usedFilamentM.toFixed(2)}m`
                    : '-'}
              </div>
            </div>

            {metadata.printTime && (
              <div>
                <div style={{ 
                  fontSize: theme.typography.small,
                  color: theme.colors.text.secondary,
                  marginBottom: '0.25rem',
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {t('gcode.printTime') || 'Print Time'}
                </div>
                <div style={{ 
                  fontSize: theme.typography.body,
                  color: theme.colors.text.primary,
                  fontWeight: 500,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {metadata.printTime}
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: '2rem' }}>
          {suggestedFilaments.length === 0 && availableFilaments.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              background: theme.colors.surface,
              borderRadius: theme.borderRadius.medium,
              border: `1px solid ${theme.colors.border}`,
              marginBottom: '1rem',
            }}>
              <div style={{
                fontSize: theme.typography.body,
                color: theme.colors.text.secondary,
                fontFamily: theme.typography.fontFamily,
                marginBottom: '1rem',
              }}>
                {t('gcode.noMatchingFilament') || 'No matching filament found.'}
              </div>
              <Button
                variant="primary"
                onClick={handleCreateMatchingFilament}
                disabled={creatingFilament}
                fullWidth
              >
                {creatingFilament 
                  ? (t('common.loading') || 'Loading...') 
                  : (t('gcode.createFilamentFromGcode') || 'Create Filament from G-code')}
              </Button>
            </div>
          ) : (
            <>
              {suggestedFilaments.length > 0 && (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: `${theme.colors.primary.main}15`,
                  borderRadius: theme.borderRadius.small,
                  marginBottom: '1rem',
                  fontSize: theme.typography.small,
                  color: theme.colors.primary.main,
                  fontFamily: theme.typography.fontFamily,
                  fontWeight: 500,
                  border: `1px solid ${theme.colors.primary.main}30`,
                }}>
                  {t('gcode.suggestedFilaments') || 'Suggested Filaments'} ({suggestedFilaments.length})
                </div>
              )}
              <FilamentSelect
                filaments={availableFilaments}
                selectedFilamentId={selectedFilamentId || 0}
                onFilamentChange={(filamentId) => setSelectedFilamentId(filamentId)}
                label={t('gcode.selectFilament') || 'Select Filament'}
                required
                placeholder={t('gcode.selectFilament') || 'Select a filament...'}
              />
              {suggestedFilaments.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <Button
                    variant="secondary"
                    onClick={handleCreateMatchingFilament}
                    disabled={creatingFilament}
                    fullWidth
                  >
                    {creatingFilament 
                      ? (t('common.loading') || 'Loading...') 
                      : (t('gcode.createFilamentFromGcode') || 'Create Filament from G-code')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div style={{ 
          display: 'flex', 
          gap: '0.75rem', 
          justifyContent: 'flex-end',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${theme.colors.border}`,
        }}>
          <Button variant="secondary" onClick={handleCancel} disabled={uploading}>
            {t('common.cancel') || 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleConfirm} 
            disabled={uploading || !selectedFilamentId}
          >
            {uploading 
              ? (t('common.loading') || 'Creating...') 
              : (t('gcode.confirmCreate') || 'Create Consumption Entry')}
          </Button>
        </div>
      </Card>
      </>
    );
  }

  return (
    <Card style={{
      background: theme.colors.background,
      border: `1px solid ${theme.colors.border}`,
      boxShadow: theme.shadows.large,
      padding: '2rem',
    }}>
      <h2 style={{
        fontSize: theme.typography.h2,
        fontWeight: 600,
        color: theme.colors.text.primary,
        marginTop: 0,
        marginBottom: '1.5rem',
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('gcode.uploadGCode') || 'Upload G-code File'}
      </h2>
      
      <p style={{
        fontSize: theme.typography.body,
        color: theme.colors.text.secondary,
        marginBottom: '1.5rem',
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('gcode.uploadDescription') || 'Select a G-code file to automatically create a consumption entry.'}
      </p>

      <input
        ref={fileInputRef}
        type="file"
        accept=".gcode"
        onChange={handleFileSelect}
        disabled={parsing || uploading}
        style={{ display: 'none' }}
      />
      
      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        {onCancel && (
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={parsing || uploading}
          >
            {t('common.cancel') || 'Cancel'}
          </Button>
        )}
        <Button
          variant="primary"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
              fileInputRef.current.click();
            }
          }}
          disabled={parsing || uploading}
        >
          {parsing 
            ? (t('gcode.parsing') || 'Parsing...') 
            : uploading 
              ? (t('common.loading') || 'Uploading...') 
              : (t('gcode.selectFile') || 'Select File')}
        </Button>
      </div>
    </Card>
  );
}
