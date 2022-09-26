'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';

const data = [
  {
    Month: 'Apr 23',
    TESS: 49,
    Sailors: 4
  },
  {
    Month: 'May 21',
    TESS: 83,
    Sailors: 10
  },
  {
    Month: 'Jun 22',
    TESS: 29,
    Sailors: 23
  }
];

export default function Example() {
  return (
    <Card className="mt-8">
      <Title>Performance</Title>
      <Text>Comparison between Tess & Star Sailors</Text>
      <AreaChart
        className="mt-4 h-80"
        data={data}
        categories={['TESS', 'Star Sailors']}
        index="Month"
        colors={['indigo', 'fuchsia']}
        valueFormatter={(number: number) =>
          ` ${Intl.NumberFormat('us').format(number).toString()}`
        }
        yAxisWidth={60}
      />
    </Card>
  );
}