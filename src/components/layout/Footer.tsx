'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import TermsModal from '../modals/TermsModal'
import PrivacyModal from '../modals/PrivacyModal'
import SupportModal from '../modals/SupportModal'

export default function Footer() {
  const router = useRouter()
  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)

  return (
    <>
      {/* Footer */}
      <div style={{
        textAlign: "center",
        padding: "24px 20px 5px",
        fontSize: "12px",
        color: "#8e8e93",
        fontWeight: "500"
      }}>
        <span
          onClick={() => setTermsModalOpen(true)}
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Terms
        </span>
        {' · '}
        <span
          onClick={() => setPrivacyModalOpen(true)}
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Privacy
        </span>
        {' · '}
        <span
          onClick={() => setSupportModalOpen(true)}
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Support
        </span>
        {' · '}
        <span
          onClick={() => router.push('/mini-app/docs')}
          style={{ cursor: 'pointer', textDecoration: 'none' }}
        >
          Docs
        </span>
      </div>

      {/* Modals */}
      <TermsModal isOpen={termsModalOpen} onClose={() => setTermsModalOpen(false)} />
      <PrivacyModal isOpen={privacyModalOpen} onClose={() => setPrivacyModalOpen(false)} />
      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </>
  )
}
