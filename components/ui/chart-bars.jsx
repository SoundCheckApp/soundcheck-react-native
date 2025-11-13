import React from 'react';
import Svg, { Rect, G, Text as SvgText, Line } from 'react-native-svg';
import { View } from 'react-native';

export const ChartBars = ({ data, width = 320, height = 200, padding = 24, color = '#10B981' }) => {
  const maxValue = Math.max(...data.map(item => item.amount), 10);
  const barWidth = (width - padding * 2) / data.length - 12;

  return (
    <View style={{ backgroundColor: '#111827', borderRadius: 12, padding: 16 }}>
      <Svg width={width} height={height}>
        <Line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#374151"
          strokeWidth={1}
        />
        {data.map((item, index) => {
          const barHeight = ((height - padding * 2) * item.amount) / maxValue;
          const x = padding + index * (barWidth + 12);
          const y = height - padding - barHeight;

          return (
            <G key={item.period}>
              <Rect x={x} y={y} width={barWidth} height={barHeight} fill={color} rx={6} />
              <SvgText
                x={x + barWidth / 2}
                y={height - padding + 16}
                textAnchor="middle"
                fontSize="10"
                fill="#9CA3AF"
              >
                {item.period}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
};

