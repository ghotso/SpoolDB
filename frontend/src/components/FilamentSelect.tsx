import { useRef, useState, useEffect, useMemo } from 'react';
import type { Filament } from '../types';
import { useI18n } from '../contexts/I18nContext';
import { useTheme } from '../theme/ThemeContext';

interface FilamentSelectProps {
  filaments: Filament[];
  selectedFilamentId: number;
  onFilamentChange: (filamentId: number) => void;
  label: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
}

export function FilamentSelect({
  filaments,
  selectedFilamentId,
  onFilamentChange,
  label,
  required = false,
  placeholder = 'Select...',
  error
}: FilamentSelectProps) {
  const { t } = useI18n();
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectedFilament = selectedFilamentId > 0 ? filaments.find(f => f.id === selectedFilamentId) : undefined;

  // Filter filaments based on search query
  const filteredFilaments = useMemo(() => {
    if (!searchQuery.trim()) return filaments;
    const query = searchQuery.toLowerCase();
    return filaments.filter(f => 
      f.name.toLowerCase().includes(query) ||
      f.material?.name.toLowerCase().includes(query) ||
      f.color?.name.toLowerCase().includes(query) ||
      f.manufacturer?.toLowerCase().includes(query)
    );
  }, [filaments, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input when dropdown opens
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset search when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  return (
    <div style={{ width: '100%', position: 'relative' }} ref={dropdownRef}>
      <label style={{ 
        display: 'block', 
        marginBottom: '0.5rem', 
        fontWeight: 500, 
        fontSize: theme.typography.small,
        color: theme.colors.text.primary,
        fontFamily: theme.typography.fontFamily,
      }}>
        {label}
        {required && <span style={{ color: theme.colors.status.danger, marginLeft: '0.25rem' }}>*</span>}
      </label>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '0.75rem',
          borderRadius: theme.borderRadius.small,
          border: `1px solid ${error ? theme.colors.status.danger : theme.colors.border}`,
          fontSize: theme.typography.body,
          background: theme.colors.background,
          color: theme.colors.text.primary,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          userSelect: 'none',
          fontFamily: theme.typography.fontFamily,
          transition: `all ${theme.transitions.fast}`,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = theme.colors.border;
          }
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = theme.colors.primary.main;
          e.currentTarget.style.outline = 'none';
          e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary.main}20`;
        }}
        onBlur={(e) => {
          if (!isOpen) {
            e.currentTarget.style.borderColor = theme.colors.border;
            e.currentTarget.style.boxShadow = 'none';
          }
        }}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          {selectedFilament ? (
            <>
              {selectedFilament.color?.hex && (
                <div
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: selectedFilament.color.hex,
                    border: `1px solid ${theme.colors.border}`,
                    flexShrink: 0
                  }}
                />
              )}
              <span>{selectedFilament.name}</span>
            </>
          ) : (
            <span style={{ color: theme.colors.text.secondary }}>{placeholder}</span>
          )}
        </div>
        <span style={{ color: theme.colors.text.secondary }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div 
          className="modal-content"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: theme.colors.background,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: theme.borderRadius.medium,
            boxShadow: theme.shadows.large,
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            marginTop: '0.25rem'
          }}
        >
          {/* Search input */}
          <div style={{ padding: '0.75rem', borderBottom: `1px solid ${theme.colors.border}` }}>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('common.search') || 'Search...'}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: theme.borderRadius.small,
                border: `1px solid ${theme.colors.border}`,
                background: theme.colors.surface,
                color: theme.colors.text.primary,
                fontSize: theme.typography.body,
                fontFamily: theme.typography.fontFamily,
                outline: 'none',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setIsOpen(false);
                  setSearchQuery('');
                }
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Filtered filaments list */}
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {filteredFilaments.length === 0 ? (
              <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: theme.colors.text.secondary,
                fontSize: theme.typography.small,
                fontFamily: theme.typography.fontFamily,
              }}>
                {t('common.noResults') || 'No results found'}
              </div>
            ) : (
              filteredFilaments.map(filament => (
            <div
              key={filament.id}
              onClick={() => {
                onFilamentChange(filament.id);
                setIsOpen(false);
              }}
              style={{
                padding: '0.75rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: selectedFilamentId === filament.id ? theme.colors.surface : theme.colors.background,
                borderBottom: `1px solid ${theme.colors.border}`,
                transition: `background ${theme.transitions.fast}`,
              }}
              onMouseEnter={(e) => {
                if (selectedFilamentId !== filament.id) {
                  e.currentTarget.style.background = theme.colors.surface;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedFilamentId !== filament.id) {
                  e.currentTarget.style.background = theme.colors.background;
                }
              }}
            >
              {filament.color?.hex && (
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: filament.color.hex,
                    border: `1px solid ${theme.colors.border}`,
                    flexShrink: 0
                  }}
                  title={filament.color.hex}
                />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: selectedFilamentId === filament.id ? 600 : 400,
                  color: theme.colors.text.primary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {filament.name}
                </div>
                <div style={{ 
                  fontSize: theme.typography.small, 
                  color: theme.colors.text.secondary,
                  fontFamily: theme.typography.fontFamily,
                }}>
                  {filament.material?.name} • {filament.color?.name}
                </div>
              </div>
            </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <div
          style={{
            marginTop: '0.25rem',
            fontSize: theme.typography.small,
            color: theme.colors.status.danger,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}

