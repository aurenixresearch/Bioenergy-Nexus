export interface ResearchArea {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  iconName: string;
  description: string;
  overview: string;
  keySubtopics: string[];
  impactMetrics: {
    label: string;
    value: string;
  }[];
  searchKeywords: string[];
}

export const RESEARCH_AREAS: ResearchArea[] = [
  {
    id: 'ra-solar',
    slug: 'solar-energy',
    title: 'Solar Energy & Photovoltaic Technologies',
    tagline: 'High-efficiency solar cells, agrivoltaics, and off-grid solar innovation.',
    iconName: 'Sun',
    description: 'Advancing next-generation perovskite-silicon tandem cells, floating solar arrays, and decentralized solar cold chain applications.',
    overview: 'Solar power is the cornerstone of the clean energy transition. Our global research network focuses on improving PV efficiency under high-temperature African environments, reducing degradation, and deploying low-cost agrivoltaic systems that combine food production with renewable energy generation.',
    keySubtopics: [
      'Perovskite-Silicon Tandem Solar Cells',
      'Agrivoltaics & Dual-Land Use Systems',
      'Floating Solar Photovoltaics (FPV)',
      'Solar Thermal & Solar Cooling Hubs',
      'Off-grid DC Solar Appliances'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '140+' },
      { label: 'Active Projects', value: '28' },
      { label: 'Partner Institutions', value: '45' }
    ],
    searchKeywords: ['solar energy', 'photovoltaics', 'agrivoltaics', 'solar cold storage', 'solar cells', 'clean tech africa']
  },
  {
    id: 'ra-bioenergy',
    slug: 'bioenergy',
    title: 'Bioenergy & Circular Biomass Conversion',
    tagline: 'Converting agricultural residues, biowaste, and microalgae into clean power and green fuels.',
    iconName: 'Leaf',
    description: 'Researching advanced anaerobic digestion, gasification, biohydrogen, and sustainable biofuel production from non-food feedstocks.',
    overview: 'Biomass represents a continuous, dispatchable renewable energy source. Through thermochemical and biochemical conversion pathways, Aurenix researchers turn agricultural waste into biomethane, bio-oil, and nutrient-rich organic fertilizers.',
    keySubtopics: [
      'High-Rate Anaerobic Digesters',
      'Biomass Pyrolysis & Biochar Sequestration',
      'Microalgae Biofuel Cultivation',
      'Agricultural Residue Pelletization',
      'Waste-to-Energy Municipal Systems'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '95+' },
      { label: 'Active Projects', value: '19' },
      { label: 'Partner Institutions', value: '32' }
    ],
    searchKeywords: ['bioenergy', 'biogas', 'waste to energy', 'anaerobic digestion', 'biochar', 'circular economy']
  },
  {
    id: 'ra-storage',
    slug: 'energy-storage',
    title: 'Energy Storage & Battery Innovation',
    tagline: 'Sodium-ion batteries, thermal storage, and flow batteries for long-duration grid storage.',
    iconName: 'Zap',
    description: 'Developing affordable, non-toxic, and high-temperature resilient battery chemistries for stationary energy storage.',
    overview: 'Intermittent renewable power requires robust, scalable energy storage. Our research highlights sodium-ion alternatives, redox flow batteries, and phase-change thermal storage solutions optimized for harsh ambient conditions.',
    keySubtopics: [
      'Sodium-Ion & LFP Battery Optimization',
      'Vanadium Redox Flow Batteries',
      'Phase-Change Material (PCM) Cold Storage',
      'Battery Second-Life & Recycling Systems',
      'Supercapacitors for Fast Frequency Response'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '110+' },
      { label: 'Active Projects', value: '24' },
      { label: 'Partner Institutions', value: '38' }
    ],
    searchKeywords: ['energy storage', 'batteries', 'sodium ion battery', 'flow battery', 'thermal storage', 'grid resilience']
  },
  {
    id: 'ra-smart-grids',
    slug: 'smart-grids',
    title: 'Smart Grids, Microgrids & Automation',
    tagline: 'AI-driven load balancing, peer-to-peer energy trading, and resilient power distribution.',
    iconName: 'Cpu',
    description: 'Pioneering decentralized energy management systems, smart metering, and islanded microgrid architectures.',
    overview: 'Modern power grids must intelligently coordinate millions of distributed energy resources. Aurenix microgrid engineering research combines machine learning, IoT telemetry, and automated switchgear for peak grid stability.',
    keySubtopics: [
      'Decentralized Microgrid Controllers',
      'Peer-to-Peer Energy Trading Protocols',
      'Virtual Power Plants (VPP)',
      'Automated Fault Detection & Self-Healing',
      'IoT Smart Meters & Demand Response'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '88+' },
      { label: 'Active Projects', value: '16' },
      { label: 'Partner Institutions', value: '29' }
    ],
    searchKeywords: ['smart grids', 'microgrids', 'energy automation', 'peer to peer trading', 'grid stability', 'demand response']
  },
  {
    id: 'ra-climate-policy',
    slug: 'climate-policy',
    title: 'Climate Policy, Economics & Just Transition',
    tagline: 'Evidence-based policy frameworks, carbon markets, and inclusive clean energy strategy.',
    iconName: 'Globe',
    description: 'Analyzing carbon offset mechanisms, climate financial instruments, and national power sector reform.',
    overview: 'Technology deployment requires supportive regulatory environments. Our policy research group delivers econometric modeling, policy briefs, and carbon credit market evaluations to guide government and multilateral decisions.',
    keySubtopics: [
      'Carbon Credit Verification & Article 6 Markets',
      'Just Transition Frameworks for Coal Dependencies',
      'Renewable Energy Tariff Architecture',
      'Cross-Border Power Pool Economics',
      'Gender Inclusion in Energy Value Chains'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '75+' },
      { label: 'Active Projects', value: '14' },
      { label: 'Partner Institutions', value: '26' }
    ],
    searchKeywords: ['climate policy', 'energy policy africa', 'carbon credits', 'just transition', 'renewable energy tariffs']
  },
  {
    id: 'ra-hydro-wind',
    slug: 'wind-and-hydro',
    title: 'Wind Energy & Small-Scale Hydropower',
    tagline: 'Run-of-river turbines, low-wind-speed blades, and regional wind farm integration.',
    iconName: 'Wind',
    description: 'Harnessing low-wind resources and river energy without requiring large, environmentally disruptive dam infrastructures.',
    overview: 'Combining wind and run-of-river hydro resources provides valuable complementary power profiles to solar energy. Our research explores micro-hydro kinetic turbines and localized low-wind speed rotor designs.',
    keySubtopics: [
      'Low-Wind Speed Aerodynamic Rotor Blades',
      'Run-of-River Hydrokinetic Turbines',
      'Offshore and Coastal Wind Feasibility',
      'Hybrid Solar-Wind Hydropower Plants',
      'Environmental Impact Mitigation'
    ],
    impactMetrics: [
      { label: 'Published Studies', value: '62+' },
      { label: 'Active Projects', value: '11' },
      { label: 'Partner Institutions', value: '21' }
    ],
    searchKeywords: ['wind energy', 'hydropower', 'small hydro', 'run of river', 'renewable energy technology']
  }
];
