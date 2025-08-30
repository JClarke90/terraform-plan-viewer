import type React from "react"
interface TildeIconProps {
  className?: string
  style?: React.CSSProperties
}

export function TildeIcon({ className, style }: TildeIconProps) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M3 10c1.5-2 2.5-2 4 0s2.5 2 4 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
