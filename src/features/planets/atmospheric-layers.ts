import { AtmosphericLayer, CloudComposition } from '@/types/Generators/JVH/atmosphere'

const hydrogenComposition: CloudComposition = {
  name: 'Hydrogen',
  colorRanges: {
    shallow: ['#e0f7fa', '#b2ebf2'],
    medium: ['#80deea', '#4dd0e1'],
    deep: ['#26c6da', '#00bcd4']
  },
  description: 'Hydrogen is a primary component in this layer.'
};

const heliumComposition: CloudComposition = {
  name: 'Helium',
  colorRanges: {
    shallow: ['#fff3e0', '#ffe0b2'],
    medium: ['#ffcc80', '#ffb74d'],
    deep: ['#ffa726', '#fb8c00']
  },
  description: 'Helium is present in significant amounts.'
};

export const atmosphericLayers: AtmosphericLayer[] = [
  {
    name: 'Exosphere',
    minAltitude: 3000,
    maxAltitude: 10000,
    primaryComposition: [hydrogenComposition, heliumComposition],
    temperature: '< 100K',
    pressure: '< 0.1 nbar',
    color: 'from-purple-900 to-purple-800'
  },
  {
    name: 'Thermosphere',
    minAltitude: 1000,
    maxAltitude: 3000,
    primaryComposition: [hydrogenComposition, heliumComposition],
    temperature: '100K - 200K',
    pressure: '0.1 µbar - 1 nbar',
    color: 'from-red-700 to-red-600'
  },
  {
    name: 'Stratosphere',
    minAltitude: 320,
    maxAltitude: 1000,
    primaryComposition: [hydrogenComposition],
    temperature: '200K - 400K',
    pressure: '1 bar - 0.1 µbar',
    color: 'from-orange-600 to-yellow-500'
  },
  {
    name: 'Troposphere',
    minAltitude: 0,
    maxAltitude: 320,
    primaryComposition: [hydrogenComposition, heliumComposition],
    temperature: '400K - 1000K',
    pressure: '100 bar - 1 bar',
    color: 'from-blue-600 to-blue-400'
  }
];