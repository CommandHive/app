'use client'

import React from 'react'
import MagicLinkForm from './MagicLinkForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking the backdrop, not the modal content
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 bg-white bg-opacity-50 flex items-center justify-center"
      onClick={handleBackdropClick}
      style={{
        backgroundImage: 'url(/background.svg)',
        backgroundRepeat: 'repeat',
        backgroundSize: 'contain'
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>
        <main className="w-full">
          <div className=" flex items-center justify-center">
            <div className="space-y-3 text-left">
              <MagicLinkForm />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}