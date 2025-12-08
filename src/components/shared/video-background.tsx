import { useRef, useEffect } from 'react'

// Import video from assets
import loginVideo from '@/assets/videos/loginpage_video.mp4'

interface VideoBackgroundProps {
  overlayOpacity?: number
  className?: string
}

/**
 * Full-screen video background component with dark overlay
 * Used on login/signup pages as an engaging visual element
 */
export function VideoBackground({ 
  overlayOpacity = 0.5,
  className = ''
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Ensure video plays on mount
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.log('Video autoplay prevented:', err)
      })
    }
  }, [])

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          minWidth: '100%',
          minHeight: '100%'
        }}
      >
        <source src={loginVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Dark Overlay */}
      <div 
        className="absolute inset-0 bg-black"
        style={{ opacity: overlayOpacity }}
      />

      {/* Subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/20" />
      
      {/* Optional: Add subtle animated particles for extra visual interest */}
      <div className="absolute inset-0">
        {/* Animated glow effects */}
        <div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '8s' }}
        />
        <div 
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: '12s', animationDelay: '2s' }}
        />
      </div>
    </div>
  )
}

