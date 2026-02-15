import {
  RadialBarChart,
  RadialBar,
  Legend,
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
    <div className="w-full h-64 flex flex-col items-center justify-center bg-white rounded-xl shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">AI Match Score</h3>
      <div className="w-full h-48 relative">
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
              background
              dataKey="value"
              cornerRadius={30}
              fill="#8884d8"
            />
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-gray-700 text-3xl font-bold"
            >
              {score}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-500 mt-2 text-center">
        {score > 75
          ? "Excellent Match! 🚀"
          : score > 50
          ? "Good Potential. 🤔"
          : "Needs Improvement. 📉"}
      </p>
    </div>
  );
}
