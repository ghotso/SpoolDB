import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';

export function TranslationWarning() {
  const { missingTranslations, currentLanguage } = useI18n();
  const { theme } = useTheme();

  // Only show in development mode
  if ((import.meta as any).env?.MODE !== 'development') {
    return null;
  }

  // Only show if there are missing translations
  if (!missingTranslations || missingTranslations.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: theme.colors.status.warning,
      color: '#000000',
      padding: '0.5rem 1rem',
      fontSize: theme.typography.small,
      fontFamily: theme.typography.fontFamily,
      borderBottom: `1px solid ${theme.colors.border}`,
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <strong>⚠️ Missing Translations ({currentLanguage}):</strong>{' '}
        <span style={{ marginLeft: '0.5rem' }}>
          {missingTranslations.length} missing key{missingTranslations.length !== 1 ? 's' : ''}
        </span>
        <details style={{ marginTop: '0.5rem', cursor: 'pointer' }}>
          <summary style={{ 
            fontWeight: 500,
            textDecoration: 'underline',
            userSelect: 'none',
          }}>
            Show missing keys
          </summary>
          <div style={{ 
            marginTop: '0.5rem', 
            padding: '0.5rem',
            background: 'rgba(0, 0, 0, 0.1)',
            borderRadius: theme.borderRadius.small,
            maxHeight: '200px',
            overflowY: 'auto',
            fontFamily: 'monospace',
            fontSize: '0.85rem',
          }}>
            {missingTranslations.map((key, index) => (
              <div key={index} style={{ marginBottom: '0.25rem' }}>
                {key}
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}

