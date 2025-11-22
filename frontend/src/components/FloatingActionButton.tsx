import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { ConsumptionChoiceModal } from './ConsumptionChoiceModal';
import { RestockModal } from './RestockModal';
import { FilamentFormModal } from './FilamentFormModal';

interface FloatingActionButtonProps {
  onConsumptionClick: () => void;
}

export function FloatingActionButton({ onConsumptionClick }: FloatingActionButtonProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showFilamentModal, setShowFilamentModal] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleConsumptionClick = () => {
    setIsExpanded(false);
    onConsumptionClick();
  };

  const handleSpoolClick = () => {
    setIsExpanded(false);
    setShowFilamentModal(true);
  };

  const handleRestockClick = () => {
    setIsExpanded(false);
    setShowRestockModal(true);
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}>
        {/* Restock Button */}
        <div
          style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transition: `all ${theme.transitions.medium} ${isExpanded ? '0.1s' : '0s'}`,
            display: 'flex',
            justifyContent: 'center',
            width: '64px',
          }}
        >
          <button
            onClick={handleRestockClick}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: theme.colors.primary.main,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.large,
              transition: `all ${theme.transitions.fast}`,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.primary.hover;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.primary.main;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={t('filament.restock')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              inventory_2
            </span>
            <div
              style={{
                position: 'absolute',
                right: '100%',
                marginRight: '0.75rem',
                background: theme.colors.surface,
                padding: '0.5rem 0.75rem',
                borderRadius: theme.borderRadius.medium,
                fontSize: theme.typography.small,
                color: theme.colors.text.secondary,
                whiteSpace: 'nowrap',
                boxShadow: theme.shadows.medium,
                border: `1px solid ${theme.colors.border}`,
                fontFamily: theme.typography.fontFamily,
                pointerEvents: 'none',
                opacity: isExpanded ? 1 : 0,
                transition: `opacity ${theme.transitions.fast}`,
              }}
              className="fab-tooltip"
            >
              {t('filament.restock')}
            </div>
          </button>
        </div>

        {/* Filament Button */}
        <div
          style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transition: `all ${theme.transitions.medium} ${isExpanded ? '0.2s' : '0s'}`,
            display: 'flex',
            justifyContent: 'center',
            width: '64px',
          }}
        >
          <button
            onClick={handleSpoolClick}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: theme.colors.primary.main,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.large,
              transition: `all ${theme.transitions.fast}`,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.primary.hover;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.primary.main;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={t('filament.add')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              ev_shadow_add
            </span>
            <div
              style={{
                position: 'absolute',
                right: '100%',
                marginRight: '0.75rem',
                background: theme.colors.surface,
                padding: '0.5rem 0.75rem',
                borderRadius: theme.borderRadius.medium,
                fontSize: theme.typography.small,
                color: theme.colors.text.secondary,
                whiteSpace: 'nowrap',
                boxShadow: theme.shadows.medium,
                border: `1px solid ${theme.colors.border}`,
                fontFamily: theme.typography.fontFamily,
                pointerEvents: 'none',
                opacity: isExpanded ? 1 : 0,
                transition: `opacity ${theme.transitions.fast}`,
              }}
              className="fab-tooltip"
            >
              {t('filament.add')}
            </div>
          </button>
        </div>

        {/* Consumption Button */}
        <div
          style={{
            opacity: isExpanded ? 1 : 0,
            transform: isExpanded ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.8)',
            pointerEvents: isExpanded ? 'auto' : 'none',
            transition: `all ${theme.transitions.medium} ${isExpanded ? '0.3s' : '0s'}`,
            display: 'flex',
            justifyContent: 'center',
            width: '64px',
          }}
        >
          <button
            onClick={handleConsumptionClick}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: theme.colors.primary.main,
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: theme.shadows.large,
              transition: `all ${theme.transitions.fast}`,
              position: 'relative',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.colors.primary.hover;
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.colors.primary.main;
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={t('consumption.add')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
              add_chart
            </span>
            <div
              style={{
                position: 'absolute',
                right: '100%',
                marginRight: '0.75rem',
                background: theme.colors.surface,
                padding: '0.5rem 0.75rem',
                borderRadius: theme.borderRadius.medium,
                fontSize: theme.typography.small,
                color: theme.colors.text.secondary,
                whiteSpace: 'nowrap',
                boxShadow: theme.shadows.medium,
                border: `1px solid ${theme.colors.border}`,
                fontFamily: theme.typography.fontFamily,
                pointerEvents: 'none',
                opacity: isExpanded ? 1 : 0,
                transition: `opacity ${theme.transitions.fast}`,
              }}
              className="fab-tooltip"
            >
              {t('consumption.add')}
            </div>
          </button>
        </div>

        {/* Main Plus Button */}
        <button
          onClick={toggleExpanded}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: theme.colors.primary.main,
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            boxShadow: theme.shadows.large,
            transition: `all ${theme.transitions.medium}`,
            transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
            fontFamily: theme.typography.fontFamily,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = theme.colors.primary.hover;
            e.currentTarget.style.transform = isExpanded ? 'rotate(45deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = theme.colors.primary.main;
            e.currentTarget.style.transform = isExpanded ? 'rotate(45deg) scale(1)' : 'rotate(0deg) scale(1)';
          }}
          title={isExpanded ? (t('common.close') || 'Close') : (t('common.add') || 'Add')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
              add
            </span>
          </button>
      </div>

      {showConsumptionModal && (
        <ConsumptionChoiceModal
          onClose={() => setShowConsumptionModal(false)}
        />
      )}

      {showRestockModal && (
        <RestockModal
          onClose={() => setShowRestockModal(false)}
        />
      )}

      {showFilamentModal && (
        <FilamentFormModal
          onClose={() => setShowFilamentModal(false)}
          onSuccess={() => {
            setShowFilamentModal(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

