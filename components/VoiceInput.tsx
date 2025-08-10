// components/VoiceInput.tsx
'use client'

import { useState, useEffect } from 'react'
import { MicIcon, MicOffIcon } from 'lucide-react'

export default function VoiceInput() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      setIsSupported(!!SpeechRecognition)
    }
  }, [])

  const startListening = () => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setTranscript(transcript)
      processVoiceCommand(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const processVoiceCommand = (command: string) => {
    // Simple voice command processing
    const lowerCommand = command.toLowerCase()
    
    // Example: "convert 25 kilometers to miles"
    const convertMatch = lowerCommand.match(/convert\s+(\d+(?:\.\d+)?)\s+(\w+)\s+to\s+(\w+)/)
    
    if (convertMatch) {
      const [, value, fromUnit, toUnit] = convertMatch
      // Here you would integrate with your main converter
      console.log(`Converting ${value} ${fromUnit} to ${toUnit}`)
      
      // For demo purposes, just show the command
      setTranscript(`Converting ${value} ${fromUnit} to ${toUnit}`)
    }
  }

  if (!isSupported) {
    return (
      <div className="text-center p-6 bg-gray-100 rounded-lg">
        <p className="text-gray-600">Voice input is not supported in your browser.</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <button
        onClick={startListening}
        disabled={isListening}
        className={`p-4 rounded-full transition-all ${
          isListening
            ? 'bg-red-600 text-white animate-pulse'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {isListening ? <MicOffIcon className="w-8 h-8" /> : <MicIcon className="w-8 h-8" />}
      </button>
      
      <p className="mt-4 text-sm text-gray-600">
        {isListening ? 'Listening...' : 'Click to start voice conversion'}
      </p>
      
      {transcript && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Voice Command:</strong> {transcript}
          </p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Try saying: "Convert 25 kilometers to miles"</p>
      </div>
    </div>
  )
}
