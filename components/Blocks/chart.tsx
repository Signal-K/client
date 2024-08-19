'use client';

import { Card, AreaChart, Title, Text } from '@tremor/react';

const data = [
  {
    Month: 'Apr 23',
    TESS: 49,
    Sailors: 4,
    Exofop: 12
  },
  {
    Month: 'May 23',
    TESS: 83,
    Sailors: 10,
    Exofop: 14
  },
  {
    Month: 'Jun 23',
    TESS: 29,
    Sailors: 23,
    Exofop: 2
  },
  {
    Month: 'Jul 23',
    TESS: 39,
    Sailors: 11,
    Exofop: 7
  },
  {
    Month: 'Aug 23',
    TESS: 27,
    Sailors: 18,
    Exofop: 17
  },
  {
    Month: 'Sep 23',
    TESS: 73,
    Sailors: 19,
    Exofop: 43
  }
];

export default function Example() {
  return (
    <Card className="mt-6">
      <Title>Performance</Title>
      <Text>Comparison between Tess & Star Sailors</Text>
      <AreaChart
        className="mt-6 h-80"
        data={data}
        categories={['TESS', 'Sailors', 'Exofop']}
        index="Month"
        colors={['indigo', 'fuchsia', 'lime']}
        valueFormatter={(number: number) =>
          ` ${Intl.NumberFormat('us').format(number).toString()}`
        }
        yAxisWidth={60}
      />
    </Card>
  );
}