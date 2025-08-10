// lib/analytics.ts
export const trackPerformance = () => {
  if (typeof window !== 'undefined') {
    // Updated Web Vitals API - FID is deprecated, replaced with INP
    import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onINP(sendToAnalytics) // INP replaces FID
      onFCP(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    })
  }
}

interface WebVitalMetric {
  name: string
  value: number
  id: string
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
}

function sendToAnalytics(metric: WebVitalMetric) {
  if (process.env.NODE_ENV === 'production') {
    // PostHog tracking
    if (window.posthog) {
      window.posthog.capture('performance_metric', {
        metric_name: metric.name,
        metric_value: metric.value,
        metric_id: metric.id,
        metric_rating: metric.rating,
      })
    }
    
    // Google Analytics 4
    if (window.gtag) {
      window.gtag('event', 'web_vitals', {
        event_category: 'performance',
        event_label: metric.name,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        metric_id: metric.id,
        non_interaction: true,
      })
    }
  }
}
