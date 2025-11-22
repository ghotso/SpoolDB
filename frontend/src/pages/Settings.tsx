import { useState, useEffect } from 'react';
import { materialsApi, settingsApi } from '../api/client';
import type { Material } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';

export function Settings() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMaterialName, setNewMaterialName] = useState('');
  const [restockThreshold, setRestockThreshold] = useState<string>('100');
  const [newRestockThreshold, setNewRestockThreshold] = useState<string>('100');
  const [savingThreshold, setSavingThreshold] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [materialsData, threshold] = await Promise.all([
        materialsApi.list(),
        settingsApi.get('restock_threshold_g').catch(() => '100'),
      ]);
      setMaterials(materialsData);
      setRestockThreshold(threshold);
      setNewRestockThreshold(threshold);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveThreshold = async () => {
    const thresholdNum = parseFloat(newRestockThreshold);
    if (isNaN(thresholdNum) || thresholdNum < 0) {
      alert(t('errors.validationError') || 'Invalid threshold value');
      return;
    }
    try {
      setSavingThreshold(true);
      await settingsApi.set('restock_threshold_g', newRestockThreshold);
      setRestockThreshold(newRestockThreshold);
      alert(t('common.success') || 'Settings saved');
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    } finally {
      setSavingThreshold(false);
    }
  };

  const handleAddMaterial = async () => {
    if (!newMaterialName.trim()) return;
    try {
      await materialsApi.create({ name: newMaterialName.trim() });
      setNewMaterialName('');
      loadData();
    } catch (error: any) {
      alert(error.message || t('errors.saveFailed'));
    }
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    try {
      await materialsApi.delete(id);
      loadData();
    } catch (error: any) {
      alert(error.message || t('errors.deleteFailed'));
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

  const customMaterials = materials.filter(m => m.is_custom);

  return (
    <div style={{ animation: 'fadeIn 200ms ease' }}>
      <h1 style={{
        fontSize: theme.typography.h1,
        fontWeight: 700,
        color: theme.colors.text.primary,
        marginBottom: '2rem',
        fontFamily: theme.typography.fontFamily,
      }}>
        {t('settings.title')}
      </h1>

      {/* Materials Section */}
      <Card>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('material.add')}
        </h2>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <Input
            type="text"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddMaterial()}
            placeholder={t('material.name')}
            style={{ flex: 1 }}
          />
          <Button
            onClick={handleAddMaterial}
            disabled={!newMaterialName.trim()}
            variant="primary"
          >
            {t('common.add')}
          </Button>
        </div>

        {customMaterials.length > 0 && (
          <div>
            <h3 style={{ 
              marginBottom: '0.5rem',
              fontSize: theme.typography.h3,
              fontWeight: 600,
              color: theme.colors.text.primary,
              fontFamily: theme.typography.fontFamily,
            }}>
              {t('material.custom')}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {customMaterials.map(material => (
                <div
                  key={material.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem',
                    background: theme.colors.surface,
                    borderRadius: theme.borderRadius.small,
                    border: `1px solid ${theme.colors.border}`,
                  }}
                >
                  <span style={{
                    fontSize: theme.typography.body,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {material.name}
                  </span>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteMaterial(material.id)}
                    style={{ 
                      fontSize: theme.typography.small, 
                      padding: '0.25rem 0.75rem' 
                    }}
                  >
                    {t('common.delete')}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Restock Threshold Section */}
      <Card style={{ marginTop: '2rem' }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('settings.restockThreshold')}
        </h2>
        <p style={{
          fontSize: theme.typography.body,
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily,
          marginBottom: '1rem',
        }}>
          {t('settings.restockThresholdDescription')}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, maxWidth: '200px' }}>
            <Input
              type="number"
              label={t('settings.restockThreshold')}
              value={newRestockThreshold}
              onChange={(e) => setNewRestockThreshold(e.target.value)}
              step="1"
              min="0"
            />
          </div>
          <Button
            onClick={handleSaveThreshold}
            disabled={savingThreshold || newRestockThreshold === restockThreshold}
            variant="primary"
          >
            {savingThreshold ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </Card>

      {/* API Documentation Section */}
      <Card style={{ marginTop: '2rem' }}>
        <h2 style={{ 
          marginTop: 0, 
          marginBottom: '1rem',
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('settings.apiDocs')}
        </h2>
        <p style={{
          fontSize: theme.typography.body,
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily,
          marginBottom: '1rem',
        }}>
          {t('settings.apiDocsDescription')}
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="/api-docs"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="primary">
              {t('settings.openApiDocs')}
            </Button>
          </a>
          <a
            href="/api-docs.json"
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="secondary">
              {t('settings.downloadOpenApiSpec')}
            </Button>
          </a>
        </div>
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: theme.colors.surface,
          borderRadius: theme.borderRadius.small,
          fontSize: theme.typography.small,
          color: theme.colors.text.secondary,
          fontFamily: theme.typography.fontFamily,
        }}>
          <strong style={{ color: theme.colors.text.primary }}>{t('settings.baseUrl')}:</strong> {window.location.origin}/api
        </div>
      </Card>
    </div>
  );
}
