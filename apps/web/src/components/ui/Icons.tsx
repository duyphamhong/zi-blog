import type { ComponentPropsWithoutRef } from 'react'

type IconProps = ComponentPropsWithoutRef<'svg'>

function IconFrame({ children, ...props }: IconProps) {
  return (
    <svg aria-hidden="true" fill="none" height="20" viewBox="0 0 24 24" width="20" {...props}>
      {children}
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </IconFrame>
  )
}

export function BookIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5Zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconFrame>
  )
}

export function CopyrightIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M14.5 9.75a3.5 3.5 0 1 0 0 4.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </IconFrame>
  )
}

export function HeadsetIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M4.5 13v-1a7.5 7.5 0 0 1 15 0v1M5 13h2.5v5H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Zm14 0h-2.5v5H19a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Zm-2.5 5c0 1.1-.9 2-2 2H12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconFrame>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 11v5m0-8v.01" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </IconFrame>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </IconFrame>
  )
}

export function LightningIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="m13.5 2-8 12H12l-1.5 8 8-12H12l1.5-8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeLinejoin="round"
      />
    </IconFrame>
  )
}

export function MenuIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </IconFrame>
  )
}

export function SearchIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="2" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </IconFrame>
  )
}

export function ShieldIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M12 3.5 19 6v5.7c0 4.3-2.8 7.7-7 8.8-4.2-1.1-7-4.5-7-8.8V6l7-2.5Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </IconFrame>
  )
}

export function ThemeIcon(props: IconProps) {
  return (
    <IconFrame {...props}>
      <path
        d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.36-6.36-1.42 1.42M7.06 16.94l-1.42 1.42m12.72 0-1.42-1.42M7.06 7.06 5.64 5.64"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
      <path d="M15 12a5 5 0 0 1-6.8 4.66A5 5 0 1 0 14.66 8 5 5 0 0 1 15 12Z" fill="currentColor" />
    </IconFrame>
  )
}
