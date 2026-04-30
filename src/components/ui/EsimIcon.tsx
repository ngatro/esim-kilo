export default function EsimIcon({ size = 200, color = "#FFA500" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Chip body */}
      <rect
        x="40"
        y="40"
        width="120"
        height="120"
        rx="12"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />

      {/* Top pins */}
      {[60, 80, 100, 120, 140].map((x) => (
        <line key={"top" + x} x1={x} y1="40" x2={x} y2="20" stroke={color} strokeWidth="3" />
      ))}

      {/* Bottom pins */}
      {[60, 80, 100, 120, 140].map((x) => (
        <line key={"bot" + x} x1={x} y1="160" x2={x} y2="180" stroke={color} strokeWidth="3" />
      ))}

      {/* Left pins */}
      {[60, 80, 100, 120, 140].map((y) => (
        <line key={"left" + y} x1="40" y1={y} x2="20" y2={y} stroke={color} strokeWidth="3" />
      ))}

      {/* Right pins */}
      {[60, 80, 100, 120, 140].map((y) => (
        <line key={"right" + y} x1="160" y1={y} x2="180" y2={y} stroke={color} strokeWidth="3" />
      ))}

      {/* Corner notch */}
      <polygon
        points="40,40 55,40 40,55"
        fill="none"
        stroke={color}
        strokeWidth="3"
      />

      {/* Text */}
      <text
        x="100"
        y="110"
        textAnchor="middle"
        fontSize="28"
        fill={color}
        fontFamily="Arial"
        fontWeight="bold"
      >
        eSIM
      </text>
    </svg>
  );
}