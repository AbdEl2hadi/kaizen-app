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
      src="/assets/moscot-noback.png"
      alt="Kaizen tortoise"
      className={className}
      {...props}
    />
  )
}
