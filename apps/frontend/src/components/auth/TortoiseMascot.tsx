import type { HTMLAttributes } from 'react'

interface TortoiseMascotProps extends HTMLAttributes<HTMLImageElement> {
  pose: 'walking' | 'celebrating'
}

export function TortoiseMascot({
  pose,
  className,
  ...props
}: TortoiseMascotProps) {
  return (
    <img
      src="/moscot-noback.png"
      alt="Kaizen tortoise"
      className={className}
      {...props}
    />
  )
}
