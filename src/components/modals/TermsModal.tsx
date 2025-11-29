import TermsContent from '../content/TermsContent'

interface TermsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid #e5e5e7',
          position: 'relative'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1c1c1e',
            margin: 0,
            paddingRight: '40px'
          }}>
            Terms of Service
          </h2>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#8e8e93',
              padding: '4px',
              lineHeight: '1'
            }}
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', fontSize: '14px', lineHeight: '1.6', color: '#1c1c1e', overflowY: 'auto' }}>
          <TermsContent />
        </div>
      </div>
    </div>
  )
}
