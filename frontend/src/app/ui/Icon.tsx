import type { SVGProps } from 'react'

const PATHS = {
  cal: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </>
  ),
  menu: <path d="M6 3v8a2 2 0 0 0 4 0V3M8 11v10M16 3c-1.7 1-2.5 3-2.5 6s1 4 2.5 4v8" />,
  box: (
    <>
      <path d="M4 8l8-4 8 4v8l-8 4-8-4z" />
      <path d="M4 8l8 4 8-4M12 12v8" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  l: <path d="M15 5l-7 7 7 7" />,
  r: <path d="M9 5l7 7-7 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  cam: (
    <>
      <path d="M4 8h3l2-2.5h6L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </>
  ),
  receipt: (
    <>
      <path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  bell: <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15zM10 20a2 2 0 0 0 4 0" />,
}
export type IconName = keyof typeof PATHS

/** 굵은 선(2px)으로 그리는 아이콘 */
const BOLD: IconName[] = ['plus', 'l', 'r', 'x']

export default function Icon({ name, size, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  const sz = size ?? (name === 'x' ? 20 : undefined)
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      width={sz}
      height={sz}
      fill="none"
      stroke="currentColor"
      strokeWidth={BOLD.includes(name) ? 2 : 1.7}
      {...rest}
    >
      {PATHS[name]}
    </svg>
  )
}
