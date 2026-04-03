import type { SVGProps } from "react";
import { ReferenceLine } from "recharts";

interface RebrandAnnotationProps {
  onHoverChange?: (isHovered: boolean) => void;
}

interface ReferenceLineShapeProps extends SVGProps<SVGLineElement> {
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

function RebrandLineShape({
  x1,
  y1,
  x2,
  y2,
  clipPath,
  onMouseEnter,
  onMouseLeave,
}: ReferenceLineShapeProps) {
  if (
    typeof x1 !== "number" ||
    typeof y1 !== "number" ||
    typeof x2 !== "number" ||
    typeof y2 !== "number"
  ) {
    return null;
  }

  return (
    <g>
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        clipPath={clipPath}
        stroke="transparent"
        strokeWidth={14}
        style={{ cursor: "pointer" }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        clipPath={clipPath}
        stroke="#EF4444"
        strokeDasharray="4 4"
        strokeWidth={1.5}
        pointerEvents="none"
      />
    </g>
  );
}

export default function RebrandAnnotation({ onHoverChange }: RebrandAnnotationProps) {
  return (
    <ReferenceLine
      x="2023-07-24"
      shape={<RebrandLineShape />}
      zIndex={500}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    />
  );
}
