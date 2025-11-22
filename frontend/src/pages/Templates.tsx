import { useState, useEffect } from 'react';
import { templatesApi } from '../api/client';
import type { Template } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { FilamentFormModal } from '../components/FilamentFormModal';
import { TemplateFormModal } from '../components/TemplateFormModal';

export function Templates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilamentModal, setShowFilamentModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const { t } = useI18n();
  const { theme } = useTheme();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await templatesApi.list();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('common.delete') + '?')) return;
    try {
      await templatesApi.delete(id);
      loadTemplates();
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
          {t('template.title') || 'Templates'}
        </h1>
        <Button variant="primary" onClick={() => setShowTemplateModal(true)}>
          {t('template.add')}
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem',
            color: theme.colors.text.secondary,
            fontSize: theme.typography.body,
            fontFamily: theme.typography.fontFamily,
          }}>
            {t('template.empty') || 'No templates found'}
          </div>
        </Card>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {templates.map(template => (
            <Card key={template.id} hoverable>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ 
                  margin: 0, 
                  marginBottom: '0.5rem',
                  fontSize: theme.typography.h3,
                  fontWeight: 600,
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {template.name}
                </h3>
                <div style={{ 
                  color: theme.colors.text.secondary, 
                  fontSize: theme.typography.small,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {template.material?.name}
                </div>
                {template.manufacturer && (
                  <div style={{ 
                    color: theme.colors.text.secondary, 
                    fontSize: theme.typography.small, 
                    marginTop: '0.25rem',
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {template.manufacturer}
                  </div>
                )}
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
                    {t('filament.startingWeight')}
                  </span>
                  <span style={{ 
                    fontWeight: 600,
                    color: theme.colors.text.primary,
                    fontFamily: theme.typography.fontFamily,
                  }}>
                    {template.starting_weight_g.toFixed(1)}g
                  </span>
                </div>
                {template.empty_weight_g && (
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between' 
                  }}>
                    <span style={{ 
                      fontSize: theme.typography.small, 
                      color: theme.colors.text.secondary,
                      fontFamily: theme.typography.fontFamily,
                    }}>
                      {t('filament.emptyWeight')}
                    </span>
                    <span style={{ 
                      fontWeight: 600,
                      color: theme.colors.text.primary,
                      fontFamily: theme.typography.fontFamily,
                    }}>
                      {template.empty_weight_g.toFixed(1)}g
                    </span>
                  </div>
                )}
              </div>

              {template.notes && (
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: theme.colors.surface,
                  borderRadius: theme.borderRadius.small,
                  fontSize: theme.typography.small,
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {template.notes}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Button 
                  variant="primary" 
                  fullWidth 
                  style={{ 
                    fontSize: theme.typography.small, 
                    padding: '0.5rem' 
                  }}
                  onClick={() => {
                    setEditingTemplateId(template.id);
                    setShowTemplateModal(true);
                  }}
                >
                  {t('common.edit')}
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  style={{ 
                    fontSize: theme.typography.small, 
                    padding: '0.5rem' 
                  }}
                  onClick={() => {
                    setSelectedTemplateId(template.id);
                    setShowFilamentModal(true);
                  }}
                >
                  {t('template.createFromTemplate')}
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleDelete(template.id)}
                  fullWidth
                  style={{ 
                    fontSize: theme.typography.small, 
                    padding: '0.5rem' 
                  }}
                >
                  {t('common.delete')}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showFilamentModal && selectedTemplateId && (
        <FilamentFormModal
          templateId={selectedTemplateId}
          onClose={() => {
            setShowFilamentModal(false);
            setSelectedTemplateId(null);
          }}
          onSuccess={() => {
            setShowFilamentModal(false);
            setSelectedTemplateId(null);
            loadTemplates();
          }}
        />
      )}

      {showTemplateModal && (
        <TemplateFormModal
          templateId={editingTemplateId || undefined}
          onClose={() => {
            setShowTemplateModal(false);
            setEditingTemplateId(null);
          }}
          onSuccess={() => {
            setShowTemplateModal(false);
            setEditingTemplateId(null);
            loadTemplates();
          }}
        />
      )}
    </div>
  );
}
