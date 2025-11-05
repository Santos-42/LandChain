import React, { useState, useEffect } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import ConnectWallet from './components/ConnectWallet';
import { CONTRACT_CONFIG, testNetworkConnection } from './utils/contract';
import {
  getInfoTanah,
  readContractGlobalState,
  createMethodCallTxn
} from './utils/contract';
import algosdk from 'algosdk';

const algodClient = new algosdk.Algodv2(
  '',
  'https://testnet-api.algonode.cloud',
  ''
);

// Modern color scheme
const colors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  accent: {
    emerald: '#10b981',
    violet: '#8b5cf6',
    amber: '#f59e0b',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    indigo: '#6366f1',
    pink: '#ec4899',
    teal: '#14b8a6'
  }
};

// --- Tipe Props untuk Komponen ---

interface ModernButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  variant?: string;
  disabled?: boolean;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: React.CSSProperties;
  type?: 'button' | 'submit' | 'reset';
  [key: string]: any; // Untuk props tambahan
}

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  variant?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

interface ModernModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

interface InputFieldProps {
  label: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  [key: string]: any;
}

interface RegisterTanahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<boolean>;
  loading: boolean;
}

interface TanahCardProps {
  tanah: any;
  onVerifikasi: (tanahId: string) => void;
  loading: boolean;
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  colorVariant?: string;
}

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  variant?: string;
  onClick: () => void;
}

interface HeroSectionProps {
  onConnectWallet: () => void;
  activeAddress: string | null;
  onDisconnect: () => void;
}

interface BuatSertifikatModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTanah: any;
  onSubmit: (formData: any, selectedTanah: any) => Promise<boolean>;
  loading: boolean;
}

interface TransferKepemilikanModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTanah: any;
  onSubmit: (formData: any, selectedTanah: any) => Promise<boolean>;
  loading: boolean;
}

interface LihatInformasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTanah: any;
}

interface PilihTanahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTanahSelected: (tanah: any) => void;
  title: string;
  actionLabel: string;
  userLands: any[];
}


// --- Komponen-Komponen UI ---

const ModernButton: React.FC<ModernButtonProps> = ({ children, onClick, variant = 'primary', disabled = false, loading = false, size = 'md', ...props }) => {
  const sizes: { [key: string]: any } = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.75rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '0.875rem' },
    lg: { padding: '1rem 2rem', fontSize: '1rem' }
  };

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    borderRadius: '10px',
    fontWeight: 600,
    transition: 'all 0.2s ease-in-out',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    outline: 'none',
    position: 'relative',
    overflow: 'hidden',
    ...sizes[size]
  };

  const variants: { [key: string]: any } = {
    primary: {
      background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.25)',
    },
    secondary: {
      background: 'rgba(255, 255, 255, 0.9)',
      color: colors.secondary[700],
      border: `1px solid ${colors.secondary[200]}`,
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
    },
    emerald: {
      background: `linear-gradient(135deg, ${colors.accent.emerald}, #059669)`,
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.25)',
    },
    violet: {
      background: `linear-gradient(135deg, ${colors.accent.violet}, #7c3aed)`,
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.25)',
    },
    amber: {
      background: `linear-gradient(135deg, ${colors.accent.amber}, #d97706)`,
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(245, 158, 11, 0.25)',
    },
    rose: {
      background: `linear-gradient(135deg, ${colors.accent.rose}, #e11d48)`,
      color: 'white',
      boxShadow: '0 4px 14px 0 rgba(244, 63, 94, 0.25)',
    }
  };

  return (
    <button
      style={{
        ...baseStyle,
        ...variants[variant],
        ...props.style
      }}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};

const ModernCard: React.FC<ModernCardProps> = ({ children, className = '', hover = false, variant = 'default', ...props }) => {
  const cardVariants: { [key: string]: any } = {
    default: {
      background: 'rgba(255, 255, 255, 0.95)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    },
    primary: {
      background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.primary[100]})`,
      border: `1px solid ${colors.primary[200]}`,
    },
    emerald: {
      background: `linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.1))`,
      border: `1px solid rgba(16, 185, 129, 0.2)`,
    },
    violet: {
      background: `linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(124, 58, 237, 0.1))`,
      border: `1px solid rgba(139, 92, 246, 0.2)`,
    },
    amber: {
      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.1))`,
      border: `1px solid rgba(245, 158, 11, 0.2)`,
    }
  };

  return (
    <div
      style={{
        backdropFilter: 'blur(20px)',
        borderRadius: '1.25rem',
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.12)',
        overflow: 'hidden',
        transition: 'all 0.3s ease-in-out',
        ...cardVariants[variant],
        ...(hover && {
          cursor: 'pointer',
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 50px 0 rgba(31, 38, 135, 0.2)',
        }),
        ...props.style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

const ModernModal: React.FC<ModernModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizes: { [key: string]: any } = {
    sm: { maxWidth: '24rem' },
    md: { maxWidth: '32rem' },
    lg: { maxWidth: '48rem' }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      padding: '1rem',
    }}>
      <div style={{
        ...sizes[size],
        width: '100%',
        maxHeight: '90vh',
        overflow: 'hidden',
        animation: 'scaleIn 0.2s ease-out',
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1.5rem 1.5rem 1rem 1.5rem',
          borderBottom: `1px solid ${colors.secondary[200]}`
        }}>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            color: colors.secondary[900],
            margin: 0
          }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'transparent',
              color: colors.secondary[500],
              cursor: 'pointer',
              fontSize: '1.25rem',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = colors.secondary[100])}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            ✕
          </button>
        </div>
        <div style={{
          padding: '0 1.5rem 1.5rem 1.5rem',
          maxHeight: 'calc(90vh - 80px)',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, placeholder, required = false, disabled = false, style, ...props }) => (
  <div style={{ marginBottom: '1.25rem' }}>
    <label style={{
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: 600,
      color: colors.secondary[700],
      marginBottom: '0.5rem'
    }}>
      {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: `1px solid ${colors.secondary[300]}`,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          resize: 'vertical',
          minHeight: '80px',
          transition: 'all 0.2s ease-in-out',
          background: disabled ? colors.secondary[100] : '#f8fafc',
          color: colors.secondary[800],
          outline: 'none',
          fontFamily: 'inherit',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          ...style
        }}
        {...props}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: `1px solid ${colors.secondary[300]}`,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
          background: disabled ? colors.secondary[100] : '#f8fafc',
          color: colors.secondary[800],
          outline: 'none',
          fontFamily: 'inherit',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          ...style
        }}
        {...props}
      />
    )}
  </div>
);

const RegisterTanahModal: React.FC<RegisterTanahModalProps> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    tanah_id: '',
    pemilik: '',
    luas: '',
    lokasi: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tanah_id || !formData.pemilik || !formData.luas || !formData.lokasi) {
      alert('Harap isi semua field yang wajib diisi.');
      return;
    }

    const success = await onSubmit(formData);
    if (success) {
      setFormData({ tanah_id: '', pemilik: '', luas: '', lokasi: '' });
      onClose();
    }
  };

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title="📝 Daftarkan Tanah Baru">
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'grid',
          gap: '1rem',
          maxWidth: '100%',
          overflow: 'hidden'
        }}>
          <InputField
            label="ID Tanah *"
            value={formData.tanah_id}
            onChange={(e) => setFormData({ ...formData, tanah_id: e.target.value })}
            placeholder="Contoh: TNH-001"
            required
            style={{ background: '#f8fafc' }}
          />
          <InputField
            label="Nama Pemilik *"
            value={formData.pemilik}
            onChange={(e) => setFormData({ ...formData, pemilik: e.target.value })}
            placeholder="Nama lengkap pemilik"
            required
            style={{ background: '#f8fafc' }}
          />
          <InputField
            label="Luas Tanah *"
            value={formData.luas}
            onChange={(e) => setFormData({ ...formData, luas: e.target.value })}
            placeholder="Contoh: 500 m²"
            required
            style={{ background: '#f8fafc' }}
          />
          <InputField
            label="Lokasi Tanah *"
            type="textarea"
            value={formData.lokasi}
            onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
            placeholder="Alamat lengkap lokasi tanah"
            required
            style={{ background: '#f8fafc' }}
          />
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'flex-end',
          marginTop: '2rem',
          borderTop: `1px solid ${colors.secondary[200]}`,
          paddingTop: '1.5rem'
        }}>
          <ModernButton
            variant="secondary"
            onClick={onClose}
            type="button"
            size="lg"
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.25)',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '120px'
            }}
          >
            Batal
          </ModernButton>
          <ModernButton
            type="submit"
            loading={loading}
            size="lg"
            style={{
              background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`,
              color: 'white',
              borderRadius: '12px',
              border: 'none',
              padding: '1rem 2rem',
              fontSize: '1rem',
              fontWeight: 600,
              minWidth: '160px',
              boxShadow: '0 4px 14px 0 rgba(14, 165, 233, 0.25)'
            }}
          >
            {loading ? 'Memproses...' : '📝 Daftarkan Tanah'}
          </ModernButton>
        </div>
      </form>
    </ModernModal>
  );
};

const TanahCard: React.FC<TanahCardProps> = ({ tanah, onVerifikasi, loading }) => {
  const isVerified = tanah.status_verifikasi === 1;

  return (
    <ModernCard hover variant="primary" style={{ height: 'fit-content' }}>
      <div style={{
        background: `linear-gradient(135deg, ${colors.accent.violet}, ${colors.accent.indigo})`,
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.3)'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '200%',
          background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
          transform: 'rotate(-45deg)',
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <h3 style={{ color: 'white', fontWeight: 700, fontSize: '1.125rem', margin: 0 }}>
              {tanah.tanah_id}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
              Sertifikat Tanah Digital
            </p>
          </div>
          <div style={{
            background: isVerified ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
            padding: '0.375rem 0.75rem',
            borderRadius: '2rem',
            backdropFilter: 'blur(10px)',
            border: isVerified ? '1px solid rgba(255,255,255,0.3)' : 'none',
            boxShadow: '0 2px 8px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>
              {isVerified ? '✅ Terverifikasi' : '⏳ Pending'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              background: colors.primary[50],
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: colors.primary[600],
              fontSize: '1.125rem',
              flexShrink: 0,
              boxShadow: '0 2px 8px 0 rgba(14, 165, 233, 0.15)'
            }}>
              👤
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: 0 }}>Pemilik</p>
              <p style={{ fontWeight: 600, color: colors.secondary[800], margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tanah.pemilik}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Luas</p>
              <p style={{ fontWeight: 600, color: colors.secondary[800], margin: 0 }}>{tanah.luas}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Sertifikat</p>
              <p style={{ fontWeight: 600, color: colors.secondary[800], fontSize: '0.875rem', margin: 0 }}>
                {tanah.nomor_sertifikat || 'Belum ada'}
              </p>
            </div>
          </div>

          <div>
            <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Lokasi</p>
            <p style={{ fontWeight: 500, color: colors.secondary[700], fontSize: '0.875rem', margin: 0, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {tanah.lokasi}
            </p>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: `1px solid ${colors.secondary[100]}` }}>
          <ModernButton
            variant={isVerified ? "secondary" : "primary"}
            onClick={() => onVerifikasi(tanah.tanah_id)}
            disabled={isVerified || loading}
            loading={loading}
            style={{
              width: '100%', justifyContent: 'center', borderRadius: '10px',
              border: 'none'
            }}
            size="md"
          >
            {isVerified ? '✅ Sudah Diverifikasi' : (loading ? 'Memverifikasi...' : '✓ Verifikasi Tanah')}
          </ModernButton>
        </div>
      </div>
    </ModernCard>
  );
};

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, value, description, colorVariant = 'primary' }) => {
  const colorMap: { [key: string]: string } = {
    primary: colors.primary[500],
    emerald: colors.accent.emerald,
    violet: colors.accent.violet,
    amber: colors.accent.amber,
    rose: colors.accent.rose
  };

  return (
    <ModernCard variant={colorVariant} style={{ padding: '1.5rem', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{
          width: '3rem',
          height: '3rem',
          background: `linear-gradient(135deg, ${colorMap[colorVariant]}, ${colorMap[colorVariant]}dd)`,
          borderRadius: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0,
          boxShadow: `0 4px 14px 0 ${colorMap[colorVariant]}40`
        }}>
          {icon}
        </div>
      </div>
      <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: colors.secondary[900], margin: '0 0 0.25rem 0' }}>
        {value}
      </h3>
      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: colors.secondary[600], margin: '0 0 0.25rem 0' }}>
        {title}
      </p>
      <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: 0 }}>
        {description}
      </p>
    </ModernCard>
  );
};

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ icon, label, description, variant = 'primary', onClick }) => {
  const variantStyles: { [key: string]: any } = {
    primary: {
      background: colors.primary[50],
      border: `1px solid ${colors.primary[200]}`,
      color: colors.primary[700],
    },
    emerald: {
      background: colors.accent.emerald + '15',
      border: `1px solid ${colors.accent.emerald}30`,
      color: colors.accent.emerald,
    },
    violet: {
      background: colors.accent.violet + '15',
      border: `1px solid ${colors.accent.violet}30`,
      color: colors.accent.violet,
    },
    amber: {
      background: colors.accent.amber + '15',
      border: `1px solid ${colors.accent.amber}30`,
      color: colors.accent.amber,
    }
  };

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    if (onClick && typeof onClick === 'function') {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick(e);
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={label}
      style={{
        background: variantStyles[variant]?.background || variantStyles.primary.background,
        color: variantStyles[variant]?.color || variantStyles.primary.color,
        border: variantStyles[variant]?.border || variantStyles.primary.border,
        padding: '1.25rem',
        borderRadius: '0.75rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        textAlign: 'left',
        height: 'auto',
        minHeight: 'auto',
        pointerEvents: 'auto',
        userSelect: 'none',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = variantStyles[variant]?.background.replace('15', '25') || colors.primary[100];
        e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = variantStyles[variant]?.background || variantStyles.primary.background;
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        width: '100%'
      }}>
        <span style={{
          fontSize: '1.5rem',
          flexShrink: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '0.5rem',
          width: '3rem',
          height: '3rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight: 600,
            fontSize: '0.875rem',
            marginBottom: '0.25rem'
          }}>
            {label}
          </div>
          <div style={{
            fontSize: '0.75rem',
            opacity: 0.8,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {description}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroSection: React.FC<HeroSectionProps> = ({ onConnectWallet, activeAddress, onDisconnect }) => (
  <div style={{
    background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[700]})`,
    borderRadius: '1.5rem',
    padding: '4rem 2rem',
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    marginBottom: '3rem',
    boxShadow: '0 20px 50px -12px rgba(14, 165, 233, 0.3)'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255,255,255,0.05) 0%, transparent 50%)
      `,
      pointerEvents: 'none'
    }} />

    <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
      <div style={{
        width: '5rem',
        height: '5rem',
        background: 'rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 2rem',
        fontSize: '2rem',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.1)'
      }}>
        🏘️
      </div>

      <h1 style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        color: 'white',
        margin: '0 0 1rem 0',
        lineHeight: 1.1,
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }}>
        LandChain Program
      </h1>

      <p style={{
        fontSize: '1.25rem',
        color: 'rgba(255, 255, 255, 0.9)',
        margin: '0 0 3rem 0',
        lineHeight: 1.6
      }}>
        Sistem Sertifikat Tanah Digital Berbasis Blockchain Algorand
      </p>

      {activeAddress ? (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '1rem',
          background: 'rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)',
          padding: '1rem 2rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{
            width: '2.5rem',
            height: '2.5rem',
            background: 'rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem'
          }}>
            👤
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)', margin: 0 }}>Terhubung</p>
            <p style={{
              fontWeight: 600,
              color: 'white',
              margin: 0,
              fontFamily: 'monospace',
              fontSize: '0.875rem'
            }}>
              {activeAddress.slice(0, 8)}...{activeAddress.slice(-6)}
            </p>
          </div>
          <button
            onClick={onDisconnect}
            style={{
              padding: '0.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
          >
            🔌
          </button>
        </div>
      ) : (
        <ModernButton
          onClick={onConnectWallet}
          size="lg"
          style={{
            background: 'rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            fontSize: '1.125rem',
            padding: '1.25rem 3rem',
            boxShadow: '0 8px 32px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          🗃️ Connect Wallet untuk Memulai
        </ModernButton>
      )}
    </div>
  </div>
);

const BuatSertifikatModal: React.FC<BuatSertifikatModalProps> = ({ isOpen, onClose, selectedTanah, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    nomor_sertifikat: '',
    tanggal_terbit: '',
    masa_berlaku: '',
    jenis_sertifikat: 'SHM'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData, selectedTanah);
    if (success) {
      setFormData({ nomor_sertifikat: '', tanggal_terbit: '', masa_berlaku: '', jenis_sertifikat: 'SHM' });
      onClose();
    }
  };

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title="🏛️ Buat Sertifikat Digital">
      {selectedTanah && (
        <div style={{
          background: colors.primary[50],
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          border: `1px solid ${colors.primary[200]}`
        }}>
          <p style={{ fontSize: '0.875rem', color: colors.primary[700], margin: 0, fontWeight: 600 }}>
            Tanah: {selectedTanah.tanah_id}
          </p>
          <p style={{ fontSize: '0.75rem', color: colors.primary[600], margin: '0.25rem 0 0 0' }}>
            Pemilik: {selectedTanah.pemilik}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <InputField
            label="Nomor Sertifikat"
            value={formData.nomor_sertifikat}
            onChange={(e) => setFormData({ ...formData, nomor_sertifikat: e.target.value })}
            placeholder="Contoh: SHM-123456789"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <InputField
              label="Tanggal Terbit"
              type="date"
              value={formData.tanggal_terbit}
              onChange={(e) => setFormData({ ...formData, tanggal_terbit: e.target.value })}
              required
            />
            <InputField
              label="Masa Berlaku"
              value={formData.masa_berlaku}
              onChange={(e) => setFormData({ ...formData, masa_berlaku: e.target.value })}
              placeholder="Contoh: 30 Tahun"
              required
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: colors.secondary[700],
              marginBottom: '0.5rem'
            }}>
              Jenis Sertifikat
            </label>
            <select
              value={formData.jenis_sertifikat}
              onChange={(e) => setFormData({ ...formData, jenis_sertifikat: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: `1px solid ${colors.secondary[200]}`,
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                background: 'white',
                color: colors.secondary[800],
                outline: 'none',
                fontFamily: 'inherit',
              }}
            >
              <option value="SHM">Sertifikat Hak Milik (SHM)</option>
              <option value="SHGB">Sertifikat Hak Guna Bangunan (SHGB)</option>
              <option value="SHP">Sertifikat Hak Pakai (SHP)</option>
              <option value="SHU">Sertifikat Hak Usaha (SHU)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <ModernButton variant="secondary" onClick={onClose} type="button" disabled={loading}>
            Batal
          </ModernButton>
          <ModernButton type="submit" loading={loading} variant="amber" disabled={loading}>
            🏛️ Buat Sertifikat
          </ModernButton>
        </div>
      </form>
    </ModernModal>
  );
};

const TransferKepemilikanModal: React.FC<TransferKepemilikanModalProps> = ({ isOpen, onClose, selectedTanah, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    pemilik_baru: '',
    alamat_pemilik_baru: '',
    tanggal_transfer: '',
    alasan_transfer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData, selectedTanah);
    if (success) {
      setFormData({ pemilik_baru: '', alamat_pemilik_baru: '', tanggal_transfer: '', alasan_transfer: '' });
      onClose();
    }
  };

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title="🔄 Transfer Kepemilikan">
      {selectedTanah && (
        <div style={{
          background: colors.accent.violet + '15',
          padding: '1rem',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          border: `1px solid ${colors.accent.violet}30`
        }}>
          <p style={{ fontSize: '0.875rem', color: colors.accent.violet, margin: 0, fontWeight: 600 }}>
            Tanah: {selectedTanah.tanah_id}
          </p>
          <p style={{ fontSize: '0.75rem', color: colors.accent.violet, margin: '0.25rem 0 0 0' }}>
            Pemilik Saat Ini: {selectedTanah.pemilik}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          <InputField
            label="Nama Pemilik Baru"
            value={formData.pemilik_baru}
            onChange={(e) => setFormData({ ...formData, pemilik_baru: e.target.value })}
            placeholder="Nama lengkap pemilik baru"
            required
          />
          <InputField
            label="Alamat Pemilik Baru"
            type="textarea"
            value={formData.alamat_pemilik_baru}
            onChange={(e) => setFormData({ ...formData, alamat_pemilik_baru: e.target.value })}
            placeholder="Alamat lengkap pemilik baru"
            required
          />
          <InputField
            label="Tanggal Transfer"
            type="date"
            value={formData.tanggal_transfer}
            onChange={(e) => setFormData({ ...formData, tanggal_transfer: e.target.value })}
            required
          />
          <InputField
            label="Alasan Transfer"
            type="textarea"
            value={formData.alasan_transfer}
            onChange={(e) => setFormData({ ...formData, alasan_transfer: e.target.value })}
            placeholder="Jelaskan alasan transfer kepemilikan"
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <ModernButton variant="secondary" onClick={onClose} type="button" disabled={loading}>
            Batal
          </ModernButton>
          <ModernButton type="submit" loading={loading} variant="violet" disabled={loading}>
            🔄 Transfer Kepemilikan
          </ModernButton>
        </div>
      </form>
    </ModernModal>
  );
};

const LihatInformasiModal: React.FC<LihatInformasiModalProps> = ({ isOpen, onClose, selectedTanah }) => {
  const [infoTanah, setInfoTanah] = useState<string>('');

  useEffect(() => {
    const loadInfo = async () => {
      if (isOpen && selectedTanah) {
        try {
          const info = await getInfoTanah();
          setInfoTanah(info);
        } catch (error) {
          console.error('Error loading tanah info:', error);
          setInfoTanah('Gagal memuat informasi tanah');
        }
      }
    };
    loadInfo();
  }, [isOpen, selectedTanah]);

  if (!selectedTanah) return null;

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title="📋 Informasi Detail Tanah" size="lg">
      <div style={{ display: 'grid', gap: '2rem' }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.accent.emerald}, ${colors.accent.emerald}dd)`,
          padding: '1.5rem',
          borderRadius: '1rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '100%',
            height: '200%',
            background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)',
            transform: 'rotate(-45deg)',
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{selectedTanah.tanah_id}</h3>
            <p style={{ margin: 0, opacity: 0.9 }}>Sertifikat Tanah Digital</p>
          </div>
        </div>

        <div style={{
          background: colors.secondary[50],
          padding: '1.5rem',
          borderRadius: '0.75rem',
          border: `1px solid ${colors.secondary[200]}`
        }}>
          <pre style={{
            whiteSpace: 'pre-wrap',
            fontFamily: 'inherit',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: 0
          }}>
            {infoTanah || 'Memuat informasi...'}
          </pre>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
        <ModernButton variant="secondary" onClick={onClose}>
          Tutup
        </ModernButton>
      </div>
    </ModernModal>
  );
};

const PilihTanahModal: React.FC<PilihTanahModalProps> = ({ isOpen, onClose, onTanahSelected, title, actionLabel, userLands }) => {
  const handleTanahSelect = (tanah: any) => {
    onTanahSelected(tanah);
    onClose();
  };

  return (
    <ModernModal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: colors.secondary[600], margin: '0 0 1rem 0' }}>
          Pilih tanah yang ingin {actionLabel}:
        </p>

        <div style={{ display: 'grid', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
          {userLands.map((tanah: any) => (
            <div
              key={tanah.tanah_id}
              onClick={() => handleTanahSelect(tanah)}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${colors.secondary[200]}`,
                borderRadius: '1rem',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colors.primary[50];
                e.currentTarget.style.borderColor = colors.primary[300];
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
                e.currentTarget.style.borderColor = colors.secondary[200];
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <h4 style={{ color: colors.secondary[900], margin: '0 0 0.25rem 0', fontSize: '1rem' }}>
                    {tanah.tanah_id}
                  </h4>
                  <p style={{ color: colors.secondary[600], margin: 0, fontSize: '0.875rem' }}>
                    {tanah.pemilik}
                  </p>
                </div>
                <div style={{
                  background: tanah.status_verifikasi === 1 ? colors.accent.emerald + '20' : colors.accent.amber + '20',
                  color: tanah.status_verifikasi === 1 ? colors.accent.emerald : colors.accent.amber,
                  padding: '0.25rem 0.75rem',
                  borderRadius: '2rem',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {tanah.status_verifikasi === 1 ? '✅ Terverifikasi' : '⏳ Pending'}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Luas</p>
                  <p style={{ fontWeight: 600, color: colors.secondary[800], margin: 0, fontSize: '0.875rem' }}>
                    {tanah.luas}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Sertifikat</p>
                  <p style={{ fontWeight: 600, color: colors.secondary[800], margin: 0, fontSize: '0.875rem' }}>
                    {tanah.nomor_sertifikat || 'Belum ada'}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: '0.75rem' }}>
                <p style={{ fontSize: '0.75rem', color: colors.secondary[500], margin: '0 0 0.25rem 0' }}>Lokasi</p>
                <p style={{ color: colors.secondary[700], margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>
                  {tanah.lokasi}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        <ModernButton variant="secondary" onClick={onClose}>
          Batal
        </ModernButton>
      </div>
    </ModernModal>
  );
};


// --- Komponen Utama Home ---

const Home: React.FC = () => {
  const { activeAddress, transactionSigner, wallets, signTransactions } = useWallet();
  const [registerModal, setRegisterModal] = useState(false);
  const [contractData, setContractData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [buatSertifikatModal, setBuatSertifikatModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [lihatInfoModal, setLihatInfoModal] = useState(false);
  const [selectedTanah, setSelectedTanah] = useState<any>(null);

  const [openWalletModal, setOpenWalletModal] = useState(false);

  const [modalTerbuka, setModalTerbuka] = useState<'none' | 'daftar' | 'sertifikat' | 'transfer' | 'info'>('none');
  const [tanahTerpilih, setTanahTerpilih] = useState<any>(null);

  // Fungsi untuk memuat data dari contract
  const loadContractData = async () => {
    if (!activeAddress) return;
    try {
      setLoading(true);
      const data = await readContractGlobalState();
      setContractData(data);
    } catch (error) {
      console.error('Error loading contract data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil saat wallet terhubung
  useEffect(() => {
    if (activeAddress) {
      loadContractData();
    }
  }, [activeAddress]);

  // Data fallback jika contract belum ada data
  const userLands = contractData && contractData.tanah_id ? [{
    tanah_id: contractData.tanah_id || "TNH-001",
    pemilik: contractData.pemilik || "Belum diatur",
    luas: contractData.luas || "0 m²",
    lokasi: contractData.lokasi || "Belum diatur",
    nomor_sertifikat: contractData.nomor_sertifikat || "",
    status_verifikasi: contractData.status_verifikasi || 0
  }] : [];

  const stats = {
    total: userLands.length,
    verified: userLands.filter((t: any) => t.status_verifikasi === 1).length,
    pending: userLands.filter((t: any) => t.status_verifikasi === 0).length,
    area: userLands.reduce((total: number, tanah: any) => {
      const luasNumber = parseInt(tanah.luas) || 0;
      return total + luasNumber;
    }, 0)
  };

  const bukaModal = (jenis: 'daftar' | 'sertifikat' | 'transfer' | 'info') => {
    setModalTerbuka(jenis);
    setTanahTerpilih(null); // Reset pilihan tanah saat membuka modal baru
  };

  const tutupModal = () => {
    setModalTerbuka('none');
    setTanahTerpilih(null);
  };

  const pilihTanah = (tanah: any) => {
    setTanahTerpilih(tanah);
    // Logika untuk membuka modal spesifik setelah memilih tanah
    if (modalTerbuka === 'sertifikat') {
      setSelectedTanah(tanah);
      setBuatSertifikatModal(true);
    } else if (modalTerbuka === 'transfer') {
      setSelectedTanah(tanah);
      setTransferModal(true);
    } else if (modalTerbuka === 'info') {
      setSelectedTanah(tanah);
      setLihatInfoModal(true);
    }
    // Tutup modal pemilihan
    tutupModal();
  };

  const connectWallet = () => {
    setOpenWalletModal(true);
  };

  const disconnectWallet = async () => {
    if (wallets) {
      const activeWallet = wallets.find((w) => w.isActive);
      if (activeWallet) {
        await activeWallet.disconnect();
      } else {
        localStorage.removeItem('@txnlab/use-wallet:v3');
        window.location.reload();
      }
    }
  };

  const handleVerifikasi = async (tanahId: string) => {
    if (!activeAddress || !signTransactions) {
      alert('Wallet tidak terhubung dengan benar.');
      return;
    }

    try {
      setLoading(true);
      const method = "verifikasi_tanah";

      // ✅ PERBAIKAN: Pastikan activeAddress adalah string
      if (!activeAddress) {
        throw new Error('Active address is null.');
      }

      const appArgs: (string | number | bigint)[] = []; // ABI call butuh array
      const tx = await createMethodCallTxn(activeAddress, method, appArgs);

      const signedTxn = await signTransactions([tx]);
      const validSignedTxns = signedTxn?.filter((tx): tx is Uint8Array => tx !== null) || [];

      if (validSignedTxns.length === 0) {
        throw new Error('Transaction signing failed');
      }

      const response = await algodClient.sendRawTransaction(validSignedTxns).do();
      const txId = response.txid;
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      alert(`Tanah berhasil diverifikasi! TX: ${txId}`);
      await loadContractData();
    } catch (error: any) {
      console.error('Verifikasi error:', error);
      alert(`Gagal memverifikasi tanah: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRegister = async (formData: any) => {
    if (!activeAddress || !signTransactions) {
      alert('Wallet tidak terhubung. Silakan connect wallet terlebih dahulu.');
      return false;
    }

    try {
      setLoading(true);

      const isConnected = await testNetworkConnection();
      if (!isConnected) {
        alert('Koneksi jaringan gagal.');
        return false;
      }

      const method = "register_tanah";
      const appArgs = [
        formData.tanah_id,
        formData.pemilik,
        formData.luas,
        formData.lokasi
      ];

      // Pastikan pemanggilan createMethodCallTxn memiliki 3 argumen
      if (!activeAddress) {
        throw new Error('Active address became null before transaction creation');
      }

      const tx = await createMethodCallTxn(activeAddress, method, appArgs);
      const signedTxn = await signTransactions([tx]);
      const validSignedTxns = signedTxn?.filter((tx: Uint8Array | null): tx is Uint8Array => tx !== null) || [];

      if (validSignedTxns.length === 0) {
        throw new Error('Transaction signing failed or was cancelled by user');
      }

      const response = await algodClient.sendRawTransaction(validSignedTxns).do();
      const txId = response.txid;
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      alert(`✅ Tanah berhasil didaftarkan!\nTX ID: ${txId}`);
      await loadContractData();
      return true;

    } catch (error: any) {
      console.error('❌ [DEBUG] Register error:', error);
      alert(`Gagal mendaftarkan tanah: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSertifikat = async (formData: any, selectedTanah: any) => {
    if (!activeAddress || !signTransactions) {
      alert('Wallet tidak terhubung dengan benar.');
      return false;
    }

    try {
      setLoading(true);
      const method = "buat_sertifikat";
      const appArgs = [formData.nomor_sertifikat];

      // ✅ PERBAIKAN: Tambahkan guard untuk TypeScript
      if (!activeAddress) {
        throw new Error('Active address is null.');
      }

      const tx = await createMethodCallTxn(activeAddress, method, appArgs);
      const signedTxn = await signTransactions([tx]);
      const validSignedTxns = signedTxn?.filter((tx): tx is Uint8Array => tx !== null) || [];

      if (validSignedTxns.length === 0) {
        throw new Error('Transaction signing failed');
      }

      const response = await algodClient.sendRawTransaction(validSignedTxns).do();
      const txId = response.txid;
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      alert(`Sertifikat berhasil dibuat! TX: ${txId}`);
      await loadContractData();
      return true;
    } catch (error: any) {
      console.error('Sertifikat error:', error);
      alert(`Gagal membuat sertifikat: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransfer = async (formData: any, selectedTanah: any) => {
    if (!activeAddress || !signTransactions) {
      alert('Wallet tidak terhubung dengan benar.');
      return false;
    }

    try {
      setLoading(true);
      const method = "pindah_kepemilikan";
      const appArgs = [formData.pemilik_baru];

      // ✅ PERBAIKAN: Tambahkan guard untuk TypeScript
      if (!activeAddress) {
        throw new Error('Active address is null.');
      }

      const tx = await createMethodCallTxn(activeAddress, method, appArgs);
      const signedTxn = await signTransactions([tx]);
      const validSignedTxns = signedTxn?.filter((tx): tx is Uint8Array => tx !== null) || [];

      if (validSignedTxns.length === 0) {
        throw new Error('Transaction signing failed');
      }

      const response = await algodClient.sendRawTransaction(validSignedTxns).do();
      const txId = response.txid;
      await algosdk.waitForConfirmation(algodClient, txId, 4);

      alert(`Kepemilikan berhasil dipindahkan! TX: ${txId}`);
      await loadContractData();
      return true;
    } catch (error: any) {
      console.error('Transfer error:', error);
      alert(`Gagal memindahkan kepemilikan: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${colors.primary[50]}, ${colors.secondary[50]}, ${colors.primary[100]})`,
      backgroundSize: '400% 400%',
      animation: 'gradient 15s ease infinite'
    }}>

      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 20% 80%, ${colors.primary[100]}22 0%, transparent 50%),
                   radial-gradient(circle at 80% 20%, ${colors.accent.cyan}11 0%, transparent 50%),
                   radial-gradient(circle at 40% 40%, ${colors.accent.violet}11 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />

      <div style={{
        position: 'relative',
        zIndex: 1,
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '2rem 1rem',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>

        <HeroSection
          onConnectWallet={() => setOpenWalletModal(true)}
          activeAddress={activeAddress}
          onDisconnect={disconnectWallet}
        />

        <ConnectWallet
          openModal={openWalletModal}
          closeModal={() => setOpenWalletModal(false)}
        />

        {activeAddress && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3rem'
            }}>
              <StatsCard
                icon="📊"
                title="Total Tanah"
                value={stats.total}
                description="Properti terdaftar"
                colorVariant="primary"
              />
              <StatsCard
                icon="✅"
                title="Terverifikasi"
                value={stats.verified}
                description="Sertifikat aktif"
                colorVariant="emerald"
              />
              <StatsCard
                icon="⏳"
                title="Pending"
                value={stats.pending}
                description="Menunggu verifikasi"
                colorVariant="amber"
              />
              <StatsCard
                icon="📐"
                title="Total Luas"
                value={`${stats.area} m²`}
                description="Area properti"
                colorVariant="violet"
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: '280px 1fr',
              gap: '2rem',
              flex: 1
            }}>
              <div style={{ position: 'sticky', top: '2rem', alignSelf: 'flex-start' }}>
                <ModernCard variant="emerald" style={{ padding: '1.5rem' }}>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: colors.secondary[900],
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <span>⚡</span> Quick Actions
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <QuickActionButton
                      icon="📝"
                      label="Daftarkan Tanah"
                      description="Tambahkan properti baru"
                      onClick={() => setRegisterModal(true)}
                    />
                    <QuickActionButton
                      icon="🏛️"
                      label="Buat Sertifikat"
                      description="Generate sertifikat digital"
                      variant="amber"
                      onClick={() => bukaModal('sertifikat')}
                    />
                    <QuickActionButton
                      icon="🔄"
                      label="Transfer Kepemilikan"
                      description="Pindahkan kepemilikan tanah"
                      variant="violet"
                      onClick={() => bukaModal('transfer')}
                    />
                    <QuickActionButton
                      icon="📋"
                      label="Lihat Informasi"
                      description="Detail properti dan riwayat"
                      variant="emerald"
                      onClick={() => bukaModal('info')}
                    />
                  </div>
                </ModernCard>
              </div>

              <div>
                <ModernCard variant="primary" style={{
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 700,
                      color: colors.secondary[900],
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      📋 Daftar Tanah
                    </h2>
                    <span style={{
                      color: colors.secondary[500],
                      fontSize: '0.875rem',
                      background: colors.secondary[100],
                      padding: '0.375rem 0.75rem',
                      borderRadius: '2rem',
                      fontWeight: 500
                    }}>
                      {userLands.length} properti
                    </span>
                  </div>
                </ModernCard>

                {userLands.length > 0 ? (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                    gap: '1.5rem',
                    alignContent: 'flex-start'
                  }}>
                    {userLands.map((tanah: any) => (
                      <TanahCard
                        key={tanah.tanah_id}
                        tanah={tanah}
                        onVerifikasi={handleVerifikasi}
                        loading={loading}
                      />
                    ))}
                  </div>
                ) : (
                  <ModernCard variant="amber" style={{
                    padding: '3rem',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '400px'
                  }}>
                    <div style={{
                      width: '5rem',
                      height: '5rem',
                      background: `linear-gradient(135deg, ${colors.accent.amber}, ${colors.accent.amber}dd)`,
                      borderRadius: '1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 1.5rem',
                      fontSize: '2rem',
                      color: 'white'
                    }}>
                      🏠
                    </div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      color: colors.secondary[900],
                      marginBottom: '0.5rem'
                    }}>
                      Belum Ada Tanah Terdaftar
                    </h3>
                    <p style={{
                      color: colors.secondary[600],
                      marginBottom: '1.5rem',
                      maxWidth: '300px'
                    }}>
                      Mulai dengan mendaftarkan properti tanah pertama Anda untuk mendapatkan sertifikat digital.
                    </p>
                    <ModernButton
                      onClick={() => setRegisterModal(true)}
                      size="lg"
                    >
                      📝 Daftarkan Tanah Pertama
                    </ModernButton>
                  </ModernCard>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <RegisterTanahModal
        isOpen={registerModal}
        onClose={() => setRegisterModal(false)}
        onSubmit={handleSubmitRegister}
        loading={loading}
      />
      <BuatSertifikatModal
        isOpen={buatSertifikatModal}
        onClose={() => setBuatSertifikatModal(false)}
        selectedTanah={selectedTanah}
        onSubmit={handleSubmitSertifikat}
        loading={loading}
      />
      <TransferKepemilikanModal
        isOpen={transferModal}
        onClose={() => setTransferModal(false)}
        selectedTanah={selectedTanah}
        onSubmit={handleSubmitTransfer}
        loading={loading}
      />
      <LihatInformasiModal
        isOpen={lihatInfoModal}
        onClose={() => setLihatInfoModal(false)}
        selectedTanah={selectedTanah}
      />
      <PilihTanahModal
        isOpen={modalTerbuka !== 'none' && modalTerbuka !== 'daftar'}
        onClose={tutupModal}
        onTanahSelected={pilihTanah}
        userLands={userLands}
        title={
          modalTerbuka === 'sertifikat' ? "🏛️ Pilih Tanah untuk Buat Sertifikat" :
            modalTerbuka === 'transfer' ? "🔄 Pilih Tanah untuk Transfer Kepemilikan" :
              modalTerbuka === 'info' ? "📋 Pilih Tanah untuk Lihat Informasi" : ""
        }
        actionLabel={
          modalTerbuka === 'sertifikat' ? "dibuatkan sertifikat" :
            modalTerbuka === 'transfer' ? "ditransfer kepemilikannya" :
              modalTerbuka === 'info' ? "dilihat informasinya" : ""
        }
      />

      {/* Global Styles */}
      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes scaleIn {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.15) !important;
          }
          
          .modern-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 50px 0 rgba(31, 38, 135, 0.2);
          }
        `}
      </style>
    </div>
  );
};

export default Home;