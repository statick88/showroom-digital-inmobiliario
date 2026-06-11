import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

interface DonutChartProps {
  disponibles: number;
  separadas: number;
  vendidas: number;
  total: number;
}

const COLORS = [
  "var(--status-success, #22c55e)",
  "var(--status-warning, #eab308)",
  "var(--status-destructive, #ef4444)",
];

export function DonutChart({ disponibles, separadas, vendidas, total }: DonutChartProps) {
  const data = [
    { name: "Disponible", value: disponibles },
    { name: "Separado", value: separadas },
    { name: "Vendido", value: vendidas },
  ];

  const segments = [
    { value: disponibles, label: "Disponible" },
    { value: separadas, label: "Separado" },
    { value: vendidas, label: "Vendido" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center w-full">
      <div className="relative shrink-0">
        <ResponsiveContainer width={140} height={140}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index] ?? "#ccc"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-foreground">{total}</span>
        </div>
      </div>

      <div className="flex-grow space-y-3">
        <h3 className="font-semibold text-foreground">Estado de Inventario</h3>
        {segments.map((seg, i) => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={seg.label} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[i] ?? "#ccc" }}
                />
                <span className="text-sm text-muted-foreground">{seg.label}</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {seg.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
