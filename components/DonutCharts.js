// components/DonutCharts.jsx

const TRANCHE_COLORS = [
  "#6366f1","#3b82f6","#06b6d4","#10b981",
  "#f59e0b","#ef4444","#ec4899","#8b5cf6","#64748b",
];

function computeArcs(data, total) {
  let cumAngle = -Math.PI / 2;
  return data.map((d) => {
    const angle = total > 0 ? (d.value / total) * 2 * Math.PI : 0;
    const startAngle = cumAngle;
    const endAngle = cumAngle + angle;
    const midAngle = cumAngle + angle / 2;
    cumAngle = endAngle;
    return { ...d, startAngle, endAngle, midAngle };
  });
}

function polarToXY(cx, cy, r, angle) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

export function CiviliteDonut({ hommes, femmes }) {
  const cx = 90, cy = 90, R = 58, strokeW = 24;
  const total = hommes + femmes;
  const circ = 2 * Math.PI * R;

  const data = [
    { label: "Hommes", value: hommes, color: "#3b82f6", textColor: "#93c5fd" },
    { label: "Femmes", value: femmes, color: "#ec4899", textColor: "#f9a8d4" },
  ];
  const arcs = computeArcs(data, total);

  return (
    <svg viewBox="0 0 180 180" width="100%" style={{ maxWidth: 180, display: "block", margin: "0 auto" }}>
      {arcs.map((arc, i) => {
        const dashLen = total > 0 ? (arc.value / total) * circ : 0;
        const dashOffset = -(arc.startAngle + Math.PI / 2) / (2 * Math.PI) * circ;
        const labelR = R + strokeW / 2 + 18;
        const lp = polarToXY(cx, cy, labelR, arc.midAngle);

        return (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {arc.value > 0 && (
              <g>
                <text x={lp.x} y={lp.y - 5} textAnchor="middle" fontSize="12" fontWeight="700" fill={arc.textColor}>
                  {arc.value}
                </text>
                <text x={lp.x} y={lp.y + 8} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.55)">
                  {arc.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function TranchesDonut({ data }) {
  const cx = 100, cy = 100, R = 58, strokeW = 22;
  const total = data.reduce((s, d) => s + d.count, 0);
  const circ = 2 * Math.PI * R;

  const items = data.map((d, i) => ({
    label: d.tranche,
    value: d.count,
    color: TRANCHE_COLORS[i % TRANCHE_COLORS.length],
    textColor: TRANCHE_COLORS[i % TRANCHE_COLORS.length],
  }));
  const arcs = computeArcs(items, total);

  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ maxWidth: 200, display: "block", margin: "0 auto" }}>
      {arcs.map((arc, i) => {
        const dashLen = total > 0 ? (arc.value / total) * circ : 0;
        const dashOffset = -(arc.startAngle + Math.PI / 2) / (2 * Math.PI) * circ;
        const labelR = R + strokeW / 2 + 16;
        const lp = polarToXY(cx, cy, labelR, arc.midAngle);

        return (
          <g key={i}>
            <circle
              cx={cx} cy={cy} r={R}
              fill="none"
              stroke={arc.color}
              strokeWidth={strokeW}
              strokeDasharray={`${dashLen} ${circ - dashLen}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
            />
            {arc.value > 0 && (
              <g>
                <text x={lp.x} y={lp.y - 4} textAnchor="middle" fontSize="10" fontWeight="700" fill={arc.textColor}>
                  {arc.value}
                </text>
                <text x={lp.x} y={lp.y + 7} textAnchor="middle" fontSize="8" fill="rgba(255,255,255,0.55)">
                  {arc.label.length > 10 ? arc.label.slice(0, 9) + "…" : arc.label}
                </text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
