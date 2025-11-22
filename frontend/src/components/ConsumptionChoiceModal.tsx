import { useState } from 'react';
import { useTheme } from '../theme/ThemeContext';
import { useI18n } from '../contexts/I18nContext';
import { Button } from './Button';
import { Card } from './Card';
import { GCodeUpload } from './GCodeUpload';
import { ConsumptionFormModal } from './ConsumptionFormModal';
import { FilamentFormModal } from './FilamentFormModal';

interface ConsumptionChoiceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
  filamentId?: number;
}

export function ConsumptionChoiceModal({ onClose, onSuccess, filamentId }: ConsumptionChoiceModalProps) {
  const { theme } = useTheme();
  const { t } = useI18n();
  const [choice, setChoice] = useState<'gcode' | 'manual' | null>(null);
  const [showFilamentModal, setShowFilamentModal] = useState(false);
  const [gcodeData, setGcodeData] = useState<{ materialId?: number; colorId?: number; name?: string } | null>(null);

  const handleGCodeChoice = () => {
    setChoice('gcode');
  };

  const handleManualChoice = () => {
    setChoice('manual');
  };

  const handleSuccess = () => {
    onClose();
    if (onSuccess) {
      onSuccess();
    } else {
      // Fallback: reload the page
      window.location.reload();
    }
  };

  if (choice === 'gcode') {
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
          onClick={onClose}
        />
        {/* G-code Upload */}
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          width: '90%',
          maxWidth: '600px',
        }}>
          <GCodeUpload
            filamentId={filamentId}
            onSuccess={handleSuccess}
            onError={(error) => {
              alert(error);
            }}
            onCancel={onClose}
            onCreateFilament={(data) => {
              setGcodeData(data);
              setShowFilamentModal(true);
            }}
          />
        </div>
      </>
    );
  }

  if (choice === 'manual') {
    return (
      <ConsumptionFormModal
        filamentId={filamentId}
        onClose={onClose}
        onSuccess={handleSuccess}
      />
    );
  }

  if (showFilamentModal && gcodeData) {
    return (
      <FilamentFormModal
        gcodeData={gcodeData}
        onClose={() => {
          setShowFilamentModal(false);
          setGcodeData(null);
          onClose();
        }}
        onSuccess={() => {
          setShowFilamentModal(false);
          setGcodeData(null);
          if (onSuccess) {
            onSuccess();
          }
        }}
      />
    );
  }

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
        onClick={onClose}
      />
      {/* Modal */}
      <Card style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000,
        maxWidth: '500px',
        width: '90%',
        background: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: theme.shadows.large,
          animation: 'modalContentFade 200ms ease',
      }}>
        <h2 style={{
          fontSize: theme.typography.h2,
          fontWeight: 600,
          color: theme.colors.text.primary,
          marginTop: 0,
          marginBottom: '1rem',
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('consumption.add') || 'Log Consumption'}
        </h2>

        <p style={{
          fontSize: theme.typography.body,
          color: theme.colors.text.secondary,
          marginBottom: '1.5rem',
          fontFamily: theme.typography.fontFamily,
        }}>
          {t('consumption.chooseMethod') || 'How would you like to log consumption?'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <Button
            variant="primary"
            onClick={handleGCodeChoice}
            fullWidth
            style={{ justifyContent: 'center' }}
          >
            {t('consumption.uploadGcode') || 'Upload G-code File'}
          </Button>
          <Button
            variant="secondary"
            onClick={handleManualChoice}
            fullWidth
            style={{ justifyContent: 'center' }}
          >
            {t('consumption.manualEntry') || 'Manual Entry'}
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel') || 'Cancel'}
          </Button>
        </div>
      </Card>
    </>
  );
}

