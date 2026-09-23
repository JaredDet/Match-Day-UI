export function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0])
    .join("");
}
export function teamColor(name: string) {
  return ["#255b47", "#4265a5", "#b05b46", "#8b73ac"][
    Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0) % 4
  ];
}
export function teamCrestDataUri(name: string) {
  const primary = teamColor(name);
  const secondary = "#f4f7fb";
  const accent = "#ffffff";
  const badge = initials(name).toUpperCase().slice(0, 2);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" role="img" aria-label="Escudo de ${name}">
      <defs>
        <linearGradient id="shield-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${primary}" />
          <stop offset="100%" stop-color="${primary}" stop-opacity="0.9" />
        </linearGradient>
      </defs>
      <path d="M300 30 L480 95 L480 286 C480 384 422 472 300 545 C178 472 120 384 120 286 L120 95 Z" fill="url(#shield-grad)"/>
      <path d="M300 62 L447 118 L447 281 C447 360 400 434 300 500 C200 434 153 360 153 281 L153 118 Z" fill="none" stroke="${accent}" stroke-opacity="0.75" stroke-width="12"/>
      <path d="M300 117 L377 145 L377 270 C377 316 343 358 300 392 C257 358 223 316 223 270 L223 145 Z" fill="${secondary}" fill-opacity="0.18"/>
      <circle cx="300" cy="232" r="110" fill="${secondary}" fill-opacity="0.16"/>
      <path d="M210 359 H390" stroke="${accent}" stroke-opacity="0.65" stroke-width="12" stroke-linecap="round"/>
      <path d="M245 404 H355" stroke="${accent}" stroke-opacity="0.55" stroke-width="12" stroke-linecap="round"/>
      <text x="300" y="285" text-anchor="middle" font-size="118" font-weight="800" font-family="Arial, Helvetica, sans-serif" fill="${accent}" letter-spacing="-7">${badge}</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

