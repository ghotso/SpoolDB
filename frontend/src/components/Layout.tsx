import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';
import { TranslationWarning } from './TranslationWarning';
import { FloatingActionButton } from './FloatingActionButton';
import { ConsumptionChoiceModal } from './ConsumptionChoiceModal';
import { NotificationsDropdown } from './NotificationsDropdown';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { t, language, setLanguage, availableLanguages } = useI18n();
  const { theme, mode, toggleTheme } = useTheme();
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);

  const navItems = [
    { path: '/', label: t('inventory.title') },
    { path: '/history', label: t('history.title') },
    { path: '/templates', label: t('template.add') },
    { path: '/settings', label: t('settings.title') },
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: theme.colors.background,
      color: theme.colors.text.primary,
      transition: `background-color ${theme.transitions.medium}, color ${theme.transitions.medium}`,
    }}>
      <TranslationWarning />
      <header style={{
        background: theme.mode === 'dark' ? theme.colors.elevated || theme.colors.surface : theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: '1rem 2rem',
        boxShadow: theme.shadows.small,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        transition: `all ${theme.transitions.medium}`,
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          maxWidth: '1400px', 
          margin: '0 auto' 
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link 
              to="/" 
              style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                color: theme.colors.primary.main,
                textDecoration: 'none', 
                fontSize: theme.typography.h2,
                fontWeight: 700,
                fontFamily: theme.typography.fontFamily,
                transition: `color ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.colors.primary.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.colors.primary.main;
              }}
            >
              <img 
                src="/icons/SpoolDB.png" 
                alt="SpoolDB" 
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain',
                }}
              />
              {t('app.title')}
            </Link>
            <nav style={{ display: 'flex', gap: '0.5rem' }}>
              {navItems.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      color: isActive ? theme.colors.primary.main : theme.colors.text.secondary,
                      textDecoration: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: theme.borderRadius.small,
                      background: isActive 
                        ? (theme.mode === 'dark' ? `${theme.colors.primary.main}20` : `${theme.colors.primary.main}10`)
                        : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      fontSize: theme.typography.body,
                      fontFamily: theme.typography.fontFamily,
                      transition: `all ${theme.transitions.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = theme.colors.surface;
                        e.currentTarget.style.color = theme.colors.text.primary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = theme.colors.text.secondary;
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <NotificationsDropdown />
            <button
              onClick={toggleTheme}
              style={{
                padding: '0.5rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text.primary,
                cursor: 'pointer',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                transition: `all ${theme.transitions.fast}`,
              }}
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary.main;
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = theme.colors.primary.main;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.surface;
                e.currentTarget.style.color = theme.colors.text.primary;
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              {mode === 'dark' ? '☀️' : '🌙'}
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.background,
                color: theme.colors.text.primary,
                cursor: 'pointer',
                fontSize: theme.typography.small,
                fontFamily: theme.typography.fontFamily,
                transition: `all ${theme.transitions.fast}`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = theme.colors.primary.main;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = theme.colors.border;
              }}
            >
              {availableLanguages.map(lang => (
                <option key={lang} value={lang}>{lang.toUpperCase()}</option>
              ))}
            </select>
            <a
              href="https://github.com/ghotso/SpoolDB"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '0.5rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text.primary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                transition: `all ${theme.transitions.fast}`,
                textDecoration: 'none',
              }}
              title="View on GitHub"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.colors.primary.main;
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.borderColor = theme.colors.primary.main;
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.colors.surface;
                e.currentTarget.style.color = theme.colors.text.primary;
                e.currentTarget.style.borderColor = theme.colors.border;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                style={{ display: 'block' }}
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </header>
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        maxWidth: '1400px', 
        margin: '0 auto', 
        width: '100%',
        animation: 'fadeIn 200ms ease',
      }}>
        {children}
      </main>

      <FloatingActionButton
        onConsumptionClick={() => setShowConsumptionModal(true)}
      />

      {showConsumptionModal && (
        <ConsumptionChoiceModal
          onClose={() => setShowConsumptionModal(false)}
        />
      )}
    </div>
  );
}


