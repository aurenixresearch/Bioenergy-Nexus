export interface InsightArticle {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: 'Renewable Energy' | 'Climate Tech' | 'Bioenergy' | 'Energy Storage' | 'Energy Policy' | 'Smart Grids';
  author: {
    name: string;
    role: string;
    institution: string;
    avatar: string;
  };
  publishedDate: string;
  readTime: string;
  summary: string;
  content: string; // Markdown or rich structured text
  sections: {
    heading: string;
    body: string;
  }[];
  tags: string[];
  relatedResearchAreaSlug: string;
  relatedPaperIds: string[];
}

export const INSIGHTS_ARTICLES: InsightArticle[] = [
  {
    id: 'art-001',
    slug: 'african-energy-transition-2026',
    title: 'Accelerating Africa’s Clean Energy Transition: Technology, Policy, and Investment Roadmap',
    subtitle: 'How decentralised renewable energy grids, green hydrogen, and climate finance are transforming power resilience across Sub-Saharan Africa.',
    category: 'Renewable Energy',
    author: {
      name: 'Dr. Kwame Mensah',
      role: 'Lead Energy Systems Policy Researcher',
      institution: 'African Clean Energy Institute & Aurenix Network',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'
    },
    publishedDate: '2026-06-15',
    readTime: '7 min read',
    summary: 'An authoritative analysis of Sub-Saharan Africa’s clean energy transition, highlighting local technology adaptation, solar-wind hybridization, and cross-border energy trade policy.',
    content: `Sub-Saharan Africa possesses the world’s richest solar potential, yet access to reliable electricity remains a critical constraint to sustainable economic development. In 2026, the convergence of declining battery storage costs, localized power generation algorithms, and innovative climate finance models is unlocking an unprecedented surge in decentralized clean energy infrastructure.`,
    sections: [
      {
        heading: '1. The Paradigm Shift to Hybrid Decentralized Microgrids',
        body: 'Traditional centralized utility grids in developing economies face high transmission losses and severe capital constraints. Modern hybrid microgrids—combining high-efficiency monocrystalline solar photovoltaics, localized biomass micro-generators, and lithium-iron-phosphate (LFP) energy storage—offer a resilient, scalable solution. By deploying localized smart meters and AI-driven load management, rural communities achieve uninterrupted power for healthcare, agriculture, and educational institutions.'
      },
      {
        heading: '2. Catalyzing Climate Finance & University-Industry Synergies',
        body: 'Unlocking capital requires robust empirical data and risk mitigation frameworks. Aurenix’s open research portal bridges academic rigor with private sector investment by providing verifiable performance analytics, open-source economic modeling, and peer-reviewed feasibility studies conducted across West and East Africa.'
      },
      {
        heading: '3. Policy Recommendations for National Energy Authorities',
        body: 'Key policy priorities include simplifying power purchase agreements (PPAs) for off-grid producers, standardizing grid interconnection standards, and eliminating import tariffs on essential clean tech components like inverters, deep-cycle storage, and sensor telemetry systems.'
      }
    ],
    tags: ['Renewable Energy', 'African Energy Transition', 'Smart Microgrids', 'Climate Finance', 'Solar Energy'],
    relatedResearchAreaSlug: 'solar-energy',
    relatedPaperIds: ['res-001', 'res-003']
  },
  {
    id: 'art-002',
    slug: 'solar-cold-storage-agriculture',
    title: 'Solar-Powered Cold Storage: Mitigating Post-Harvest Food Loss in Rural Agriculture',
    subtitle: 'Empowering smallholder farmers with off-grid thermal energy storage and localized solar cooling hubs.',
    category: 'Climate Tech',
    author: {
      name: 'Prof. Amara Diallo',
      role: 'Professor of Agricultural Engineering',
      institution: 'West African Center for Sustainable Technology',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
    },
    publishedDate: '2026-05-20',
    readTime: '6 min read',
    summary: 'Post-harvest agricultural loss affects up to 40% of fresh produce in rural African markets. Solar-powered thermal energy storage provides cost-effective, zero-emission cold chain logistics.',
    content: `Maintaining continuous refrigeration in off-grid agricultural communities has long been a technical challenge due to high battery wear and energy demands. Recent breakthroughs in phase-change materials (PCM) enable solar cooling systems to store thermal cold during peak sunlight hours, eliminating expensive battery replacements.`,
    sections: [
      {
        heading: '1. Technical Innovation in Phase-Change Cooling',
        body: 'By surrounding cold rooms with latent heat storage materials, solar power can be dedicated directly to compressor work during daylight hours. Ice-chilled water thermal batteries keep agricultural cold rooms at a constant 2°C to 8°C throughout the night without consuming electricity from secondary chemical batteries.'
      },
      {
        heading: '2. Economic Impact for Smallholder Farmer Cooperatives',
        body: 'Farmer cooperatives implementing shared solar cold hubs report a 60% reduction in food spoilage, allowing produce to reach high-value urban markets and boosting household income by an average of 35% within the first season.'
      }
    ],
    tags: ['Solar Energy', 'Cold Storage', 'Agricultural Innovation', 'Climate Tech', 'Food Security'],
    relatedResearchAreaSlug: 'solar-energy',
    relatedPaperIds: ['res-001', 'res-004']
  },
  {
    id: 'art-003',
    slug: 'biomass-waste-to-energy-scale',
    title: 'Biomass Waste-to-Energy Systems: Circular Bioeconomy for Urban & Industrial Processing',
    subtitle: 'Converting agricultural residue, organic municipal solid waste, and forestry biowaste into clean biogas and high-value biochar.',
    category: 'Bioenergy',
    author: {
      name: 'Dr. Fatima Al-Hassan',
      role: 'Senior Bioenergy Scientist',
      institution: 'Renewable Materials & Bioenergy Laboratory',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250'
    },
    publishedDate: '2026-04-12',
    readTime: '8 min read',
    summary: 'A deep dive into anaerobic digestion technology, pyrolytic biochar production, and organic waste valorization for sustainable municipal energy supply.',
    content: `Rapid urbanization across developing nations creates twin challenges: mounting municipal waste management costs and rising power demand. Circular bioeconomy frameworks turn organic waste streams into continuous baseload power and agricultural soil enhancers.`,
    sections: [
      {
        heading: '1. Anaerobic Digestion Efficiency & Gas Purification',
        body: 'Integrating two-stage anaerobic digesters with membrane biogas scrubbing produces biomethane with over 97% purity, suitable for industrial boiler heating, vehicle fuel, or grid injection.'
      },
      {
        heading: '2. Biochar Pyrolysis and Carbon Sequestration',
        body: 'Pyrolyzing residual solid digestate converts recalcitrant carbon into stable biochar, permanently locking away atmospheric carbon dioxide while providing a soil amendment that enhances water retention and nutrient availability.'
      }
    ],
    tags: ['Bioenergy', 'Waste-to-Energy', 'Circular Economy', 'Biogas', 'Carbon Capture'],
    relatedResearchAreaSlug: 'bioenergy',
    relatedPaperIds: ['res-002']
  },
  {
    id: 'art-004',
    slug: 'hybrid-microgrids-rural-electrification',
    title: 'Optimizing Microgrid Architecture for Extreme Reliability in Remote Communities',
    subtitle: 'Combining machine learning, predictive solar modeling, and decentralized control for 99.9% uptime.',
    category: 'Smart Grids',
    author: {
      name: 'Eng. Samuel Osei',
      role: 'Microgrid Automation Engineer',
      institution: 'Aurenix Smart Grid Lab',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250'
    },
    publishedDate: '2026-03-08',
    readTime: '5 min read',
    summary: 'Explore how smart inverter controls and predictive cloud computing prevent grid collapses and balance intermittent renewable loads in islanded distribution networks.',
    content: `Managing voltage fluctuation and sudden cloud cover drops in isolated power grids requires rapid, automated grid response. Next-generation edge computing microgrid controllers enable droop control and peer-to-peer energy sharing between community assets.`,
    sections: [
      {
        heading: '1. Peer-to-Peer Energy Trading and Smart Inverters',
        body: 'Smart inverters operating under virtual synchronous generator protocols allow decentralized rooftop solar arrays to stabilize grid frequency without needing fossil-fuel backup generators.'
      }
    ],
    tags: ['Smart Grids', 'Energy Storage', 'Microgrids', 'Renewable Energy', 'Automation'],
    relatedResearchAreaSlug: 'smart-grids',
    relatedPaperIds: ['res-003']
  }
];
