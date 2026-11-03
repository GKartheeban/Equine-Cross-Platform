// A quiet Tamil touch for the header: two Ayyanar horses (the terracotta guardian horses of
// Tamil Nadu's village shrines) facing each other across a line of kolam loops.
// Drawn in thin lines and shown very light, only on wide screens.

function AyyanarHorse() {
  return (
    <g>
        <path d="M24 110h74M28 110v-5h66v5M33 105v-5h56v5"/>
        <path d="M38 100V78M43 100V79M48 100V79M53 100V78M70 100V78M75 100V79M80 100V79M85 100V78"/>
        <path d="M34 100h11M46 100h10M67 100h11M78 100h11"/>
        <path d="M36 78c-4-3-5-9-2-14 3-5 9-7 15-7h22c4 0 7 1 9 3"/>
        <path d="M36 78h52c2-3 2-7 0-10"/>
        <path d="M52 57v13h18V57"/><path d="M61 59l4 4.5-4 4.5-4-4.5z"/>
        <path d="M80 60c3-10 4-20 3-30M88 68c5-12 6-25 4-36"/>
        <path d="M83 30c-2-8 1-15 8-17 6-1 10 2 11 7l5 15c1 4-1 6-4 6l-9-1c-2-5-2-8-2-10"/>
        <path d="M88 13l-3-8 7 5M95 12l1-8 4 8"/>
        <path d="M90 9c-3-5 0-9 5-9 1 4-1 7-5 9z"/>
        <circle cx="95" cy="21" r="1.1" fill="currentColor" stroke="none"/>
        <circle cx="104" cy="35" r="0.8" fill="currentColor" stroke="none"/>
        <path d="M84 28c5 1 11 0 16-3"/>
        <path d="M80 50q6 3 12 0"/>
        <circle cx="82" cy="54" r="1.3"/><circle cx="86" cy="55" r="1.3"/><circle cx="90" cy="54" r="1.3"/>
        <path d="M81 41q5 2 11 0"/>
        <path d="M34 66c-8 3-10 11-7 19"/>
    </g>
  );
}

export function HeaderMotif({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 300 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {/* Left horse, facing right (towards the centre) */}
      <g transform="translate(4 1) scale(0.4)" strokeWidth="2.6">
        <AyyanarHorse />
      </g>
      {/* Right horse, mirrored, facing left */}
      <g transform="translate(296 1) scale(-0.4 0.4)" strokeWidth="2.6">
        <AyyanarHorse />
      </g>
      {/* Kolam: a chain of loops, each around a dot, with a knot in the middle */}
      <g>
        <path d="M64 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="72" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M80 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="88" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M96 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="104" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M112 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="120" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M172 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="180" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M188 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="196" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M204 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="212" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M220 24c3-7 13-7 16 0c-3 7-13 7-16 0z" />
        <circle cx="228" cy="24" r="1" fill="currentColor" stroke="none" />
        <path d="M150 13c5 4 5 18 0 22c-5-4-5-18 0-22z" />
        <path d="M139 24c4-5 18-5 22 0c-4 5-18 5-22 0z" />
        <circle cx="150" cy="24" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="150" cy="9" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="150" cy="39" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="135" cy="24" r="0.9" fill="currentColor" stroke="none" />
        <circle cx="165" cy="24" r="0.9" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
