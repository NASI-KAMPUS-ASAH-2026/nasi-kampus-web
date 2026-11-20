// Ikon garis 24px dengan ketebalan konsisten (stroke 2).
const PATHS = {
  bag: 'M6 8h12l-1 12H7L6 8zm3 0a3 3 0 016 0',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6L6 18',
  search: 'M11 18a7 7 0 110-14 7 7 0 010 14zm9 3l-4.5-4.5',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  back: 'M19 12H5m6-6l-6 6 6 6',
  arrow: 'M5 12h14m-6-6l6 6-6 6',
  arrowUpRight: 'M7 17L17 7M8 7h9v9',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  trash: 'M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3',
  check: 'M5 13l4 4L19 7',
  info: 'M12 22a10 10 0 110-20 10 10 0 010 20zm0-6v-5m0-3h.01',
  alert: 'M12 3l10 18H2L12 3zm0 7v4m0 3h.01',
  calendar: 'M4 6h16v14H4V6zm0 4h16M8 3v4m8-4v4',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z',
  chat: 'M4 5h16v11H8l-4 4V5z',
  copy: 'M9 9h11v11H9V9zM5 15H4V4h11v1',
  box: 'M3 8l9-5 9 5v8l-9 5-9-5V8zm0 0l9 5 9-5M12 13v8',
  rice: 'M3 12h18a9 9 0 01-18 0zm4-3c0-2 2-2 2-4m3 4c0-2 2-2 2-4m3 4c0-2 2-2 2-4',
  cookie: 'M12 3a9 9 0 109 9 3 3 0 01-3-3 3 3 0 01-3-3 3 3 0 01-3-3zM8 11h.01M11 16h.01M15 14h.01',
  clock: 'M12 21a9 9 0 110-18 9 9 0 010 18zm0-13v4l3 2',
  home: 'M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1v-9z',
  grid: 'M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  chart: 'M4 20V10m6 10V4m6 16v-7m6 7H2',
  logout: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11',
  external: 'M14 4h6v6m0-6L10 14M18 14v6H4V6h6',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
  lock: 'M6 11h12v10H6V11zm2 0V7a4 4 0 018 0v4',
  filter: 'M4 5h16l-6 8v6l-4-2v-4L4 5z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z',
  receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zm3 5h6m-6 4h6m-6 4h3',
  wallet: 'M3 7h16a2 2 0 012 2v9a2 2 0 01-2 2H3V7zm0 0V5a2 2 0 012-2h11M16 13h.01',
  x: 'M15 9l-6 6m0-6l6 6M12 22a10 10 0 110-20 10 10 0 010 20z',
  loader: 'M12 3a9 9 0 109 9',
  pin: 'M12 21s-7-6.5-7-12a7 7 0 0114 0c0 5.5-7 12-7 12zm0-9a3 3 0 100-6 3 3 0 000 6z',
  mail: 'M4 6h16v12H4V6zm0 1l8 6 8-6',
  flame: 'M12 3c2 3 5 5.5 5 9.5a5 5 0 01-10 0c0-2.5 1.5-4.5 3-6.5 0 2 1 3 2 3 0-2 0-4 0-6z',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  heart: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z',
  bell: 'M18 8A6 6 0 006 8c0 7-3 9-3 9h24s-3-2-3-9M13.73 21a2 2 0 01-3.46 0',
  sun: 'M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414m12.728 0l-1.414-1.414M7.05 7.05L5.636 5.636M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon: 'M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z',
};

export default function Icon({ name, size = 20, className, strokeWidth = 2 }) {
  if (name === 'whatsapp') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
        focusable="false"
      >
        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.275-.1-.476-.15-.676.15-.2.301-.776.978-.952 1.179-.175.2-.351.226-.652.075-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.783-1.674-2.084-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.151-.175.201-.301.301-.501.101-.2.05-.376-.025-.526-.075-.15-.677-1.632-.927-2.233-.244-.586-.492-.507-.677-.516-.175-.008-.376-.01-.576-.01-.201 0-.527.075-.802.376-.276.301-1.053 1.028-1.053 2.508 0 1.48 1.078 2.909 1.229 3.11.15.2 2.122 3.24 5.141 4.544.718.31 1.278.495 1.715.634.721.23 1.377.197 1.895.12.577-.087 1.78-.727 2.03-1.43.25-.702.25-1.304.175-1.43-.075-.125-.276-.201-.577-.351zM12.042 21.666c-1.74 0-3.447-.468-4.947-1.354l-.354-.21-3.676.964.98-3.582-.231-.368a9.61 9.61 0 01-1.472-5.116c0-5.32 4.327-9.646 9.646-9.646 2.578 0 4.999 1.005 6.822 2.828a9.589 9.589 0 012.824 6.824c0 5.322-4.329 9.648-9.592 9.648zM12.042 0C5.402 0 0 5.402 0 12.042c0 2.121.554 4.192 1.606 6.014L0 24l6.103-1.601a11.97 11.97 0 005.939 1.564c6.64 0 12.042-5.402 12.042-12.042C24.084 5.402 18.682 0 12.042 0z"/>
      </svg>
    );
  }

  if (name === 'cart') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="8" cy="21" r="1.6" />
        <circle cx="18" cy="21" r="1.6" />
        <path d="M1.5 2h3.2l2.3 12.2a1.5 1.5 0 001.5 1.3h10.8a1.5 1.5 0 001.5-1.2L22.5 6.2H5.3" />
        <path d="M6 10.5h15.5" />
        <path d="M10.5 6.2v8.5" />
        <path d="M15.5 6.2v8.5" />
      </svg>
    );
  }

  if (name === 'gmail' || name === 'mail') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className={className}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="2.5" y="4" width="19" height="15" rx="2.5" />
        <path d="M2.5 6.5l9.5 6 9.5-6" />
        <path d="M3 18l5.5-5" />
        <path d="M21 18l-5.5-5" />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={PATHS[name] || PATHS.info} />
    </svg>
  );
}
