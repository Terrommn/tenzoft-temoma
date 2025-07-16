import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface PieChartData {
  percentage: number;
  color: string;
}

interface PieChartProps {
  data: PieChartData[];
  size?: number;
  innerRadius?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
  data,
  size = 140,
  innerRadius = 45,
}) => {
  const radius = size / 2;
  const strokeWidth = radius - innerRadius;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Filter out data with 0 percentage
  const filteredData = data.filter(item => item.percentage > 0);

  if (filteredData.length === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        <Svg width={size} height={size}>
          <Circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
          />
        </Svg>
      </View>
    );
  }

  let cumulativePercentage = 0;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="#374151"
          strokeWidth={strokeWidth}
          opacity={0.2}
        />
        
        {/* Pie segments */}
        {filteredData.map((item, index) => {
          const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -cumulativePercentage / 100 * circumference;
          
          cumulativePercentage += item.percentage;
          
          return (
            <Circle
              key={index}
              cx={radius}
              cy={radius}
              r={normalizedRadius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90 ${radius} ${radius})`}
            />
          );
        })}
        
        {/* Inner circle to create hollow effect */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="transparent"
        />
      </Svg>
    </View>
  );
}; 