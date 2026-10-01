const width = 720;
const height = 320;
const left = 64;
const right = 32;
const top = 24;
const bottom = 64;

function ProgressChart({ points, exerciseName }) {
  if (!points.length) return null;

  const firstTime = Date.parse(points[0].completedAtUtc);
  const lastTime = Date.parse(points[points.length - 1].completedAtUtc);
  const plotWidth = width - left - right;
  const plotHeight = height - top - bottom;
  const maximumWeight = Math.max(...points.map((point) => point.weightKg));
  // Give the highest point some space and keep the scale valid for 0 kg.
  const upperWeight = Math.max(1, Math.ceil(maximumWeight * 1.1));
  const x = (point) => lastTime === firstTime
    ? left + plotWidth / 2
    : left + (Date.parse(point.completedAtUtc) - firstTime) / (lastTime - firstTime) * plotWidth;
  const y = (point) => top + plotHeight * (1 - point.weightKg / upperWeight);
  const dateLabel = (date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  return (
    <svg className="progress-chart" viewBox={`0 0 ${width} ${height}`}
      role="img" aria-label={`${exerciseName}: heaviest weight per workout. Exact values are listed in the table below.`}>
      {[0, 1, 2, 3, 4].map((tick) => {
        const weight = upperWeight * tick / 4;
        const position = top + plotHeight * (1 - tick / 4);
        return <g key={tick}>
          <line className="progress-grid" x1={left} x2={width - right} y1={position} y2={position} />
          <text x={left - 10} y={position + 4} textAnchor="end">{Number(weight.toFixed(1))}</text>
        </g>;
      })}
      <text x={left} y={14}>kg</text>
      {points.length > 1 && <polyline className="progress-line" fill="none"
        points={points.map((point) => `${x(point)},${y(point)}`).join(" ")} />}
      {points.map((point) => (
        <circle className="progress-point" key={point.workoutId} cx={x(point)} cy={y(point)} r="5">
          <title>{new Date(point.completedAtUtc).toLocaleString()}: {point.weightKg} kg ({point.routineName})</title>
        </circle>
      ))}
      {firstTime === lastTime ? (
        <text x={left + plotWidth / 2} y={height - 36} textAnchor="middle">{dateLabel(points[0].completedAtUtc)}</text>
      ) : <>
        <text x={left} y={height - 36}>{dateLabel(points[0].completedAtUtc)}</text>
        <text x={width - right} y={height - 36} textAnchor="end">{dateLabel(points[points.length - 1].completedAtUtc)}</text>
      </>}
      <text x={left + plotWidth / 2} y={height - 10} textAnchor="middle">Workout date</text>
    </svg>
  );
}

export default ProgressChart;
