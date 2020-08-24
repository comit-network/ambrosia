import React from 'react';
import {Chart} from "react-google-charts";

export default function MockChart() {
  return <Chart
      width={'100%'}
      chartType="CandlestickChart"
      loader={<div>Loading Chart</div>}
      data={[
        ['day', 'a', 'b', 'c', 'd'],
        ['9:00', 20, 28, 38, 45],
        ['9:10', 31, 38, 55, 66],
        ['9:20', 50, 55, 77, 80],
        ['9:30', 77, 77, 66, 50],
        ['9:40', 68, 66, 22, 15],
        ['9:00', 20, 28, 38, 45],
        ['9:10', 31, 38, 55, 66],
        ['9:20', 50, 55, 77, 80],
        ['9:30', 77, 77, 66, 50],
        ['9:40', 68, 66, 22, 15],
        ['9:00', 20, 28, 38, 45],
        ['9:10', 31, 38, 55, 66],
        ['9:20', 50, 55, 77, 80],
        ['9:30', 77, 77, 66, 50],
        ['9:40', 68, 66, 22, 15],
        ['9:00', 20, 28, 38, 45],
        ['9:10', 31, 38, 55, 66],
        ['9:20', 50, 55, 77, 80],
        ['9:30', 77, 77, 66, 50],
        ['9:40', 68, 66, 22, 15],
      ]}
      options={{
        legend: 'none',
        bar: { groupWidth: '100%' }, // Remove space between bars.
        candlestick: {
          fallingColor: { strokeWidth: 0, fill: '#a52714' }, // red
          risingColor: { strokeWidth: 0, fill: '#0f9d58' }, // green
        },
      }}
      rootProps={{ 'data-testid': '2' }}
  />;
}
