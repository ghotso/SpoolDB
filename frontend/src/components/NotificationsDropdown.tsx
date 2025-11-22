import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../api/client';
import type { Filament } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';

export function NotificationsDropdown() {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Filament[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    // Refresh notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const loadNotifications = async () => {
    try {
      const data = await notificationsApi.list();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const notificationCount = notifications.length;

  if (loading && notificationCount === 0) {
    return null;
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'relative',
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
        title={t('notifications.title')}
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
        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
          notifications
        </span>
        {notificationCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: theme.colors.status.danger,
              color: '#FFFFFF',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 600,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.medium,
            boxShadow: theme.shadows.large,
            zIndex: 1000,
            minWidth: '320px',
            maxWidth: '400px',
            maxHeight: '500px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              padding: '1rem',
              borderBottom: `1px solid ${theme.colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: theme.typography.h3,
                fontWeight: 600,
                color: theme.colors.text.primary,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {t('notifications.title')}
            </h3>
            {notificationCount > 0 && (
              <span
                style={{
                  background: theme.colors.status.danger,
                  color: '#FFFFFF',
                  borderRadius: theme.borderRadius.small,
                  padding: '0.25rem 0.5rem',
                  fontSize: theme.typography.small,
                  fontWeight: 600,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {notificationCount}
              </span>
            )}
          </div>

          <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
            {notificationCount === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.body,
                  fontFamily: theme.typography.fontFamily,
                }}
              >
                {t('notifications.empty')}
              </div>
            ) : (
              notifications.map((filament) => (
                <Link
                  key={filament.id}
                  to={`/filaments/${filament.id}`}
                  onClick={() => setIsOpen(false)}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    color: 'inherit',
                    borderBottom: `1px solid ${theme.colors.border}`,
                    transition: `background ${theme.transitions.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.colors.surface;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.colors.background;
                  }}
                >
                  <div
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    {filament.color?.hex && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: filament.color.hex,
                          border: `2px solid ${theme.colors.border}`,
                          flexShrink: 0,
                        }}
                        title={filament.color.hex}
                      />
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: theme.colors.text.primary,
                          fontSize: theme.typography.body,
                          fontFamily: theme.typography.fontFamily,
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {filament.name}
                      </div>
                      <div
                        style={{
                          fontSize: theme.typography.small,
                          color: theme.colors.text.secondary,
                          fontFamily: theme.typography.fontFamily,
                        }}
                      >
                        {t('notifications.restockThresholdReached')}: {(filament.remaining_weight_g || 0).toFixed(1)}g
                      </div>
                    </div>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: theme.colors.text.secondary,
                        fontSize: '20px',
                        flexShrink: 0,
                      }}
                    >
                      chevron_right
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

