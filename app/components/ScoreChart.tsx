import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
  PolarAngleAxis,
} from "recharts";

type ScoreProps = {
  score: number;
};

export default function ScoreChart({ score }: ScoreProps) {
  const data = [
    {
      name: "Score",
      value: score,
      fill: score > 75 ? "#10b981" : score > 50 ? "#f59e0b" : "#ef4444",
    },
  ];

  return (
    <div className="glass-card" style={{ margin: 0, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 24px" }}>
      <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-tertiary)", marginBottom: 12, width: "100%" }}>
        AI Match Score
      </div>
      <div style={{ width: "100%", height: 180, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            barSize={10}
            data={data}
            startAngle={90}
            endAngle={-270}
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 100]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: "var(--bg-hover)" }}
              dataKey="value"
              cornerRadius={30}
              fill="#8884d8"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fill: "var(--text-primary)", fontSize: 32, fontWeight: 800 }}
            >
              {score}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p style={{ fontSize: 13, color: "var(--text-tertiary)", marginTop: 8, textAlign: "center" }}>
        {score > 75
          ? "Excellent Match! 🚀"
          : score > 50
          ? "Good Potential. 🤔"
          : "Needs Improvement. 📉"}
      </p>
    </div>
  );
}
