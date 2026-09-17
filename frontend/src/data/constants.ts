export interface MoilMineInfo {
  id: string;
  name: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  annual_capacity: string;
  type: string;
  status: string;
}

export const MOIL_MINES: MoilMineInfo[] = [
  {
    id: 'MINE_BALAGHAT_01',
    name: 'Balaghat Mine (Bharveli)',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.8129,
    lon: 80.1835,
    annual_capacity: '650,000 Tonnes/Yr',
    type: 'Underground / Deep Bench',
    status: 'Operational — Priority Concession'
  },
  {
    id: 'MINE_GUMGAON_02',
    name: 'Gumgaon Manganese Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.3854,
    lon: 78.9812,
    annual_capacity: '180,000 Tonnes/Yr',
    type: 'Underground',
    status: 'Operational'
  },
  {
    id: 'MINE_TIRODI_03',
    name: 'Tirodi Manganese Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.6836,
    lon: 79.7247,
    annual_capacity: '280,000 Tonnes/Yr',
    type: 'Opencast & Underground',
    status: 'Operational'
  },
  {
    id: 'MINE_DONGRI_04',
    name: 'Dongri Buzurg Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    lat: 21.5500,
    lon: 79.6833,
    annual_capacity: '420,000 Tonnes/Yr',
    type: 'Opencast / Beneficiation',
    status: 'Operational'
  },
  {
    id: 'MINE_KANDRI_05',
    name: 'Kandri Manganese Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.4167,
    lon: 79.2667,
    annual_capacity: '210,000 Tonnes/Yr',
    type: 'Underground',
    status: 'Operational'
  },
  {
    id: 'MINE_MANSAR_06',
    name: 'Mansar Manganese Mine',
    state: 'Maharashtra',
    district: 'Nagpur',
    lat: 21.4000,
    lon: 79.2833,
    annual_capacity: '190,000 Tonnes/Yr',
    type: 'Underground / Open Cast',
    status: 'Operational'
  },
  {
    id: 'MINE_CHIKLA_07',
    name: 'Chikla Manganese Mine',
    state: 'Maharashtra',
    district: 'Bhandara',
    lat: 21.5667,
    lon: 79.7667,
    annual_capacity: '230,000 Tonnes/Yr',
    type: 'Underground',
    status: 'Operational'
  },
  {
    id: 'MINE_UKWA_08',
    name: 'Ukwa Mine',
    state: 'Madhya Pradesh',
    district: 'Balaghat',
    lat: 21.9667,
    lon: 80.4667,
    annual_capacity: '260,000 Tonnes/Yr',
    type: 'Underground',
    status: 'Operational'
  }
];

export const APP_METADATA = {
  title: 'MOIL AI/ML Mining Intelligence Platform',
  organization: 'MOIL Limited',
  version: '1.0.0'
};
