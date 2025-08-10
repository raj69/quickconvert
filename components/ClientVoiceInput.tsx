// components/ClientVoiceInput.tsx
'use client'

import dynamic from 'next/dynamic'

// This dynamic import with ssr: false is now in a Client Component
const VoiceInput = dynamic(() => import('./VoiceInput'), {
  ssr: false,
  loading: () => (
    <div className="text-center p-6 bg-gray-100 rounded-lg animate-pulse">
      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
      <p className="text-gray-500">Loading voice input...</p>
    </div>
  ),
})

export default function ClientVoiceInput() {
  return <VoiceInput />
}
