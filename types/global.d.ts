// types/global.d.ts
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void
      identify: (distinctId: string, properties?: Record<string, any>) => void
      reset: () => void
      init: (key: string, config?: Record<string, any>) => void
      [key: string]: any
    }
    
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void
    
    dataLayer?: any[]
    SpeechRecognition: any
    webkitSpeechRecognition: any

  }
}

export {}
