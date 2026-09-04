const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512" role="img" aria-label="Persian Shop logo">
  <defs>
    <radialGradient id="bg" cx="36%" cy="24%" r="82%">
      <stop offset="0" stop-color="#ffd83e"/>
      <stop offset="1" stop-color="#f5b900"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="9" flood-color="#b98500" flood-opacity=".22"/>
    </filter>
  </defs>
  <circle cx="256" cy="256" r="252" fill="url(#bg)"/>
  <g fill="#fff" filter="url(#shadow)">
    <path d="M143 195c0-18 15-33 33-33h160c18 0 33 15 33 33v196c0 18-15 33-33 33H176c-18 0-33-15-33-33V195z"/>
    <path d="M194 173v-28c0-39 25-68 62-68s62 29 62 68v28h-19v-28c0-28-17-48-43-48s-43 20-43 48v28h-19z"/>
  </g>
  <path d="M224 238h55c54 0 91 29 91 78 0 51-37 80-92 80h-54V238zm51 112c27 0 43-11 43-34 0-22-16-33-43-33h-1v67h1z" fill="#f5bd0b"/>
  <path d="M330 208c4 29 19 44 48 48-29 4-44 19-48 48-4-29-19-44-48-48 29-4 44-19 48-48z" fill="#fff"/>
</svg>`;

export async function GET() {
  return new Response(LOGO_SVG, {
    headers: {
      "content-type": "image/svg+xml; charset=utf-8",
      "cache-control": "no-store, max-age=0",
      "content-length": String(Buffer.byteLength(LOGO_SVG)),
      "x-logo-version": "complete-vector-20260904-v3",
    },
  });
}
