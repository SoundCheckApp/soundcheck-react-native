import React from 'react';
import Svg, { Path, Rect, Line, Text as SvgText } from 'react-native-svg';
import { View } from 'react-native';

export const ChartLine = ({ data, width = 320, height = 200, color = '#3b82f6', padding = 24 }) => {
  if (!data || data.length === 0) {
    return null;
  }

  const labels = data.map((item) => item.date || item.period);
  const values = data.map((item) => item.amount);
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const stepX = chartWidth / Math.max(labels.length - 1, 1);

  const points = values.map((value, index) => {
    const x = padding + index * stepX;
    const y = padding + chartHeight - ((value - minValue) / range) * chartHeight;
    return { x, y };
  });

  const path = points.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  return (
    <View style={{ backgroundColor: '#0f172a', borderRadius: 12, padding: 8 }}>
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#334155"
          strokeWidth={1}
        />
        <Line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#334155"
          strokeWidth={1}
        />

        {points.map((point, index) => (
          <Rect
            key={`dot-${index}`}
            x={point.x - 3}
            y={point.y - 3}
            width={6}
            height={6}
            rx={3}
            fill={color}
          />
        ))}

        <Path d={path} fill="none" stroke={color} strokeWidth={2} />

        {labels.map((label, index) => {
          const x = padding + index * stepX;
          return (
            <SvgText key={`label-${label}-${index}`} x={x} y={height - padding + 16} fontSize="10" fill="#94a3b8" textAnchor="middle">
              {label}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

