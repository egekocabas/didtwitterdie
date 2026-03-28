import { ReferenceLine } from "recharts";

export default function RebrandAnnotation() {
  return (
    <ReferenceLine
      x="2023-07-24"
      stroke="#EF4444"
      strokeDasharray="4 4"
      label={{
        value: "Rebrand to X",
        position: "insideTopRight",
        fontSize: 11,
        fill: "#EF4444",
      }}
    />
  );
}
