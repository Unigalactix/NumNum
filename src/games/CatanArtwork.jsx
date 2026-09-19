export const RESOURCE_LABELS = { wood: 'Wood', brick: 'Brick', sheep: 'Wool', wheat: 'Grain', ore: 'Ore', desert: 'Desert' }
export const TERRAIN_COLORS = { wood: '#799781', brick: '#d29986', sheep: '#b2cda0', wheat: '#e3c776', ore: '#a2b0bf', desert: '#dfcbb2' }

export function ResourceSticker({ resource, ...props }) {
  return (
    <svg viewBox="0 0 64 64" role="img" aria-label={RESOURCE_LABELS[resource]} {...props}>
      <title>{RESOURCE_LABELS[resource]}</title>
      <g stroke="#fffdf7" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke fill">
        {resource === 'wood' && <path d="M9 30 36 12 56 23 54 48 28 57 7 45Z" fill="#80503a" />}
        {resource === 'brick' && <path d="M7 28 23 20 23 10 43 8 55 17 55 32 59 35 59 48 38 57 6 43Z" fill="#ac5446" />}
        {resource === 'sheep' && <path d="M14 19Q13 9 24 12Q31 5 39 13Q51 11 51 24L57 33 52 48 43 49 42 56 36 56 33 49 24 49 22 56 15 55 14 46Q4 42 7 31Q3 22 14 19Z" fill="#f2eee2" />}
        {resource === 'wheat' && <path d="M13 12 25 13 30 5 41 7 44 17 54 20 50 35 43 43 35 58 19 53 22 37 12 28Z" fill="#dca936" />}
        {resource === 'ore' && <path d="M6 39 16 19 29 17 36 7 49 15 58 37 53 52 26 57 8 50Z" fill="#63758c" />}
        {resource === 'desert' && <path d="M6 48 25 35 27 12Q34 3 40 12L40 27 45 27 45 20 51 20 52 33 40 40 57 48 58 54 7 54Z" fill="#c9a775" />}
      </g>
      {resource === 'wood' && <g stroke="#613f30" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M9 31 35 15 47 22 22 40Z" fill="#9c6441" /><path d="M24 38 46 25 54 31 32 46Z" fill="#a2714e" />
        <path d="M10 42 34 28 49 39 27 54Z" fill="#845038" />
        <ellipse cx="17" cy="38" rx="9" ry="11" fill="#e2bc81" /><ellipse cx="17" cy="38" rx="4" ry="6" fill="none" />
        <ellipse cx="46" cy="41" rx="9" ry="11" fill="#e2bc81" /><ellipse cx="46" cy="41" rx="4" ry="6" fill="none" />
        <path d="m27 24 11-6m-9 30 8-5" stroke="#c59868" />
      </g>}
      {resource === 'brick' && <g stroke="#873f36" strokeWidth="1.5" strokeLinejoin="round">
        <path d="m8 31 20-8 27 13-19 9Z" fill="#e3a18a" /><path d="M8 31v12l28 13V45Z" fill="#c76d58" /><path d="m36 45 19-9v12l-19 8Z" fill="#9e4e43" />
        <path d="m24 13 18-3 12 8-18 5Z" fill="#efb39b" /><path d="M24 13v14l12 9V23Z" fill="#ce7c65" /><path d="m36 23 18-5v14l-18 4Z" fill="#ac5546" /><path d="M21 38v11m22-7v11" />
      </g>}
      {resource === 'sheep' && <g>
        <path d="m17 43-1 12h6l3-12m11 0 1 12h6l-1-12" fill="#53515a" />
        <g fill="#fffdf4" stroke="#dedbcc" strokeWidth="1.5"><circle cx="19" cy="30" r="12" /><circle cx="25" cy="22" r="11" /><circle cx="36" cy="22" r="11" /><circle cx="30" cy="35" r="15" /></g>
        <path d="M39 27q13-8 15 5l-3 15q-9 7-15-3Z" fill="#58545c" /><ellipse cx="35" cy="30" rx="6" ry="3" fill="#6d6370" /><ellipse cx="54" cy="29" rx="6" ry="3" fill="#6d6370" />
        <circle cx="43" cy="34" r="1.8" fill="white" /><circle cx="50" cy="34" r="1.8" fill="white" /><path d="m44 43 4 0" stroke="#ded4ce" strokeLinecap="round" />
      </g>}
      {resource === 'wheat' && <g stroke="#9f7327" strokeWidth="1.5" strokeLinecap="round">
        <path d="m25 55 9-43m-4 44-10-38m14 38 13-31" fill="none" strokeWidth="3" />
        {[0, 1, 2].map((index) => <g key={index} transform={`translate(${index * 1.8},${-index * 9})`} fill="#f4d16c"><ellipse cx="28" cy="34" rx="4" ry="7" transform="rotate(-35 28 34)" /><ellipse cx="37" cy="31" rx="4" ry="7" transform="rotate(35 37 31)" /></g>)}
        <path d="M22 34q-12-8-7-17 10 2 10 12m14 14q-1-15 13-20 1 11-13 20" fill="#e9bd4e" /><path d="m20 48 19 4m-19-1 18 4" stroke="#986d4b" strokeWidth="3" />
      </g>}
      {resource === 'ore' && <g stroke="#516179" strokeWidth="1.5" strokeLinejoin="round">
        <path d="m27 24 10-14 11 8 8 22-22 8Z" fill="#a6b9cc" /><path d="m37 10 3 24 16 6-8-22Z" fill="#748da8" />
        <path d="m8 39 10-18 13 0 9 22-13 11-18-7Z" fill="#b5c5d2" /><path d="m18 21 8 15 14 7-9-22Z" fill="#8197ad" /><path d="m26 36 1 18 13-11Z" fill="#607b96" />
        <path d="m39 41 9-6 7 9-5 9-16-1Z" fill="#8fa6bb" /><path d="m13 38 6-8m22-11 3 7" stroke="#dde6ec" strokeWidth="2" />
      </g>}
      {resource === 'desert' && <g>
        <path d="M7 49q13-22 29-7 14-5 21 9H7Z" fill="#edce93" /><path d="M29 44V14q5-8 9 0v15h8V22h4v10q-2 5-12 5v10Z" fill="#789477" stroke="#52745b" strokeWidth="1.5" />
        <path d="M29 31h-7q-5 0-5-6v-6h4v7h8" fill="#789477" stroke="#52745b" strokeWidth="1.5" /><path d="M33 16v25" stroke="#acc29b" />
      </g>}
    </svg>
  )
}

export function BuildingSticker({ city = false, color, ...props }) {
  return <svg viewBox="0 0 32 32" {...props} aria-hidden="true">
    <path d={city ? 'M3 28V12l7-7 7 7v5l5-5 7 7v9Z' : 'M5 27V15L16 5l11 10v12Z'} fill={color} stroke="#fffdf7" strokeWidth="3" strokeLinejoin="round" />
    <path d={city ? 'M8 28v-8h5v8m7 0v-6h5v6' : 'M13 27v-9h6v9'} fill="#ffffffb3" />
  </svg>
}