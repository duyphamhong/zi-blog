import { getCoverArtworkVariant } from '@/modules/content/presentation/coverArtwork'

export function TechnicalArtwork({ className = '', seed }: { className?: string; seed: string }) {
  const variant = getCoverArtworkVariant(seed)
  const background = {
    architecture: 'from-[#061b67] via-[#073ab9] to-[#0e84ff]',
    operations: 'from-[#003b53] via-[#006d77] to-[#08a6a1]',
    tooling: 'from-[#081b51] via-[#123ca4] to-[#3967ee]',
  }[variant]

  return (
    <div
      aria-hidden="true"
      className={`relative isolate overflow-hidden bg-gradient-to-br ${background} ${className}`}
    >
      <div className="absolute inset-0 opacity-30 zi-grid-surface" />
      <div className="absolute -right-10 -top-10 size-44 rounded-full bg-cyan-300/25 blur-3xl" />
      {variant === 'architecture' ? <ArchitectureArtwork /> : null}
      {variant === 'tooling' ? <ToolingArtwork /> : null}
      {variant === 'operations' ? <OperationsArtwork /> : null}
    </div>
  )
}

function ArchitectureArtwork() {
  return (
    <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 640 360">
      <g stroke="#9eeaff" strokeOpacity=".38">
        <path d="M70 282c98-90 148-34 224-100s155-72 277-14" />
        <path d="M80 76c112 54 178 5 253 66s154 50 235 2" strokeDasharray="7 9" />
      </g>
      <g transform="translate(195 54)">
        <path d="m125 0 116 65-116 65L9 65 125 0Z" fill="#68dcff" fillOpacity=".84" />
        <path d="m9 65 116 65v142L9 207V65Z" fill="#1472ff" fillOpacity=".86" />
        <path d="m241 65-116 65v142l116-65V65Z" fill="#42baff" fillOpacity=".78" />
        <path d="m125 130 116-65M125 130 9 65M125 130v142" stroke="#d7f8ff" strokeOpacity=".7" />
        <path d="m69 98 56-31 55 31-55 32-56-32Z" fill="#d4f7ff" fillOpacity=".5" />
      </g>
      <g fill="#b7ecff">
        <circle cx="89" cy="285" r="5" />
        <circle cx="567" cy="167" r="5" />
        <circle cx="482" cy="288" r="4" />
      </g>
    </svg>
  )
}

function ToolingArtwork() {
  return (
    <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 640 360">
      <g stroke="#5ec9ff" strokeOpacity=".26">
        <path d="M0 77h640M0 150h640M0 223h640M0 296h640M100 0v360M220 0v360M340 0v360M460 0v360M580 0v360" />
      </g>
      <path
        d="M320 50 462 102v89c0 75-58 113-142 139-84-26-142-64-142-139v-89L320 50Z"
        fill="#0b2a83"
        stroke="#7ee4ff"
        strokeWidth="5"
      />
      <path
        d="m278 146-42 42 42 42m84-84 42 42-42 42m-56 20 30-124"
        stroke="#b9f3ff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="13"
      />
      <circle cx="91" cy="85" r="9" fill="#59dfff" />
      <circle cx="543" cy="274" r="7" fill="#59dfff" />
    </svg>
  )
}

function OperationsArtwork() {
  return (
    <svg className="absolute inset-0 size-full" fill="none" viewBox="0 0 640 360">
      <g stroke="#7df9ea" strokeOpacity=".24">
        <path d="M54 72h532v222H54z" />
        <path d="M54 130h532M140 72v222M524 72v222" />
      </g>
      <path
        d="M88 240h77l35-71 49 104 58-142 52 96 36-43h97"
        stroke="#8affec"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="9"
      />
      <g fill="#b5fff6">
        <circle cx="165" cy="240" r="7" />
        <circle cx="249" cy="273" r="7" />
        <circle cx="359" cy="227" r="7" />
        <circle cx="492" cy="184" r="7" />
      </g>
      <circle cx="478" cy="112" r="35" fill="#0b897f" stroke="#8affec" strokeWidth="4" />
      <path d="m478 91 8 17 18 3-13 13 3 18-16-8-16 8 3-18-13-13 18-3 8-17Z" fill="#cafff8" />
    </svg>
  )
}
