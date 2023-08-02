'use client';

import { Card, Metric, Text, Title, BarList, Flex, Grid } from '@tremor/react';
import Chart from './chart';

const planets = [
  { name: 'Transit', value: 4089 },
  { name: 'Radial Velocity', value: 1044 },
  { name: 'Microlensing', value: 200 },
  { name: 'Direct imaging', value: 67 },
  { name: 'Others', value: 63 }
];

const shop = [
  { name: 'TIC', value: 6500 },
  { name: 'KOI', value: 182 },
  // { name: '/shop', value: 271 },
  // { name: '/pricing', value: 191 }
];

const app = [
  { name: 'TESS', value: 50 },
  { name: 'Exofop', value: 4 }
  // { name: '/about', value: 564 },
  // { name: '/login', value: 234 },
  // { name: '/downloads', value: 191 }
];

const data = [
  {
    category: 'Confirmed planets', // link this up to exofop API
    stat: '5463',
    data: planets
  },
  {
    category: 'TESS Candidates',
    stat: '6682',
    data: shop
  },
  {
    category: 'Planets in Star Sailors',
    stat: '54',
    data: app
  }
];

export default function PlaygroundPage() {
  return (
    <main className="p-4 md:p-10 mx-auto max-w-7xl">
      <Chart /><br />
      {/* <Grid numItemsSm={2} numItemsLg={3} className="gap-6">
        {data.map((item) => (
          <Card key={item.category}>
            <Title>{item.category}</Title>
            <Flex
              justifyContent="start"
              alignItems="baseline"
              className="space-x-2"
            >
              <Metric>{item.stat}</Metric>
              <Text>Total planets</Text>
            </Flex>
            <Flex className="mt-6">
              <Text>Pages</Text>
              <Text className="text-right">Anomalies</Text>
            </Flex>
            <BarList
              data={item.data}
              valueFormatter={(number: number) =>
                Intl.NumberFormat('us').format(number).toString()
              }
              className="mt-2"
            />
          </Card>
        ))}
      </Grid> */}
    </main>
  );
}