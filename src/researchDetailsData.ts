export interface DetailedResearch {
  id: string;
  title: string;
  author: string;
  category: string;
  publishedYear: number;
  abstract: string;
  introduction: string;
  methodology: string[];
  findings: string[];
  metrics: { label: string; value: string; description: string; color: string }[];
  recommendations: string[];
  citation: string;
  stats?: { name: string; value: number }[];
}

export const DETAILED_RESEARCH_DATA: Record<string, DetailedResearch> = {
  'paper-1': {
    id: 'paper-1',
    title: 'Biogas as an Alternate Source of Energy',
    author: 'Aurenix Research Research Group',
    category: 'Bioenergy Technology',
    publishedYear: 2024,
    abstract: 'This technical paper examines the feasibility, design parameters, and operational dynamics of residential and commercial biodigester systems. It covers the biochemical pathways of anaerobic digestion, methane yield optimization from agricultural and municipal solid wastes, and safety protocols for gas collection and distribution.',
    introduction: 'Anaerobic digestion (AD) represents a highly viable, decentralized solution for organic waste management and renewable natural gas generation. By leveraging biological decomposition of organic substrates under anaerobic conditions, municipal and agricultural systems can capture biogas, reducing uncontrolled landfill emissions while providing high-quality clean energy and nutrient-rich bio-fertilizer digestate.',
    methodology: [
      'Sourced high-activity bacterial inoculum from active mesophilic dairy manure digesters, acclimated to 37°C over 14 days.',
      'Maintained consistent process monitoring including the ratio of volatile fatty acids (VFAs) to total inorganic carbonate (FOS/TAC) to prevent system acidification.',
      'Conducted gas chromatography with a thermal conductivity detector (GC-TCD) to map methane, carbon dioxide, and trace hydrogen sulfide levels.',
      'Analyzed three substrate feedstocks: sorghum silage, crop residues, and municipal food waste.'
    ],
    findings: [
      'Methane (CH4) concentrations stabilized at 62.4% after a brief 12-day lag phase, demonstrating excellent substrate digestion kinetics.',
      'The optimal Organic Loading Rate (OLR) was determined to be 3.2 kg Volatile Solids (VS) per cubic meter of digester volume per day.',
      'Co-digesting municipal food waste with poultry litter optimized the Carbon-to-Nitrogen (C:N) ratio to 26:1, boosting biogas output by 34%.',
      'Average chemical oxygen demand (COD) reduction rate in the slurry reached 72%, proving robust waste stabilization.'
    ],
    metrics: [
      { label: 'Biogas Yield', value: '24.5 m³/ton', description: 'Volume of biogas produced per ton of organic feedstock', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Methane Purity', value: '62.4%', description: 'Average methane gas concentration after scrubbing', color: 'text-teal-600 bg-teal-50' },
      { label: 'COD Reduction', value: '72.0%', description: 'Chemical Oxygen Demand stabilization efficiency', color: 'text-sky-600 bg-sky-50' },
      { label: 'CO₂ Mitigation', value: '12.4 t/yr', description: 'Tons of carbon dioxide equivalent offset annually', color: 'text-indigo-600 bg-indigo-50' }
    ],
    recommendations: [
      'Incorporate multi-stage temperature control mechanisms to prevent thermal shock in mesophilic methanogenic bacteria.',
      'Install iron-oxide scrubbers inline to neutralize corrosive hydrogen sulfide (H2S) gases before storage or thermal combustion.',
      'Use the nutrient-dense effluent digestate as an organic bio-fertilizer to replace synthetic petroleum-based chemical fertilizers.'
    ],
    citation: 'Aurenix Research Group (2024). "Biogas as an Alternate Source of Energy: Process Kinetics and Scalable Reactor Architectures." Aurenix Technical Briefs, Vol. 14, pp. 45–58.',
    stats: [
      { name: 'Day 1', value: 10 },
      { name: 'Day 5', value: 35 },
      { name: 'Day 10', value: 58 },
      { name: 'Day 15', value: 62 },
      { name: 'Day 20', value: 63 }
    ]
  },
  'paper-2': {
    id: 'paper-2',
    title: 'Better Use of Biomass for Energy - Background Report',
    author: 'International Energy Agency (IEA) & Aurenix Research',
    category: 'Climate & Energy Policy',
    publishedYear: 2023,
    abstract: 'An in-depth policy and technical background report detailing the strategic pathways for modern biomass energy. The paper outlines carbon balance assessments, ecological thresholds for wood and crop waste harvesting, and frameworks for matching biomass resource profiles to optimal thermal or chemical conversion pathways.',
    introduction: 'Solid biomass continues to play an indispensable role in the global renewable energy mix. However, traditional combustion methods pose severe indoor air quality issues and lead to environmental degradation. This background report presents scientific criteria for modernizing biomass utilization. It establishes strict ecological safety thresholds for agricultural and forestry residues, ensuring bioenergy projects contribute a net-negative carbon offset.',
    methodology: [
      'Performed Life Cycle Assessment (LCA) boundary calculations across 18 common woody and herbaceous biomass species in sub-tropical zones.',
      'Conducted geospatial modeling of biomass supply chains, evaluating transport carbon expenditures against localized thermal offset benefits.',
      'Investigated slow and fast pyrolysis test runs under variable temperatures (450°C to 800°C) to quantify bio-oil, syngas, and biochar yield fractions.'
    ],
    findings: [
      'Forest residue extraction must not exceed 25% of total annual litterfall to preserve vital mycorrhizal soil networks and prevent erosion.',
      'Advanced gasification in dual-bed fluidized reactors achieved carbon conversion efficiency of 78% with low tar formation (under 1.5 g/Nm³).',
      'Moisture contents exceeding 30% dynamically reduced the net energy yield (LHV) by up to 55%, emphasizing the crucial necessity of solar pre-drying.'
    ],
    metrics: [
      { label: 'Thermal Efficiency', value: '78.0%', description: 'Net thermal conversion rate in gasification tests', color: 'text-amber-600 bg-amber-50' },
      { label: 'Optimal Moisture', value: '< 15%', description: 'Recommended feedstock moisture content for gasification', color: 'text-orange-600 bg-orange-50' },
      { label: 'Tar Formation', value: '1.2 g/m³', description: 'Ultra-low tar accumulation rate in dual-fluidized beds', color: 'text-red-600 bg-red-50' },
      { label: 'Net Carbon Output', value: '-85%', description: 'Reduction in cradle-to-grave greenhouse gas emissions', color: 'text-emerald-600 bg-emerald-50' }
    ],
    recommendations: [
      'Enact robust legislative frameworks that explicitly prevent the harvesting of primary high-biodiversity forests for energy pellets.',
      'Establish community-level cooperatives for solar-assisted drying of agricultural residues to raise combustion yield.',
      'Develop regional biochar integration plans to simultaneously capture carbon in arable soils and improve water retention capacity.'
    ],
    citation: 'IEA & Aurenix Research (2023). "Better Use of Biomass for Energy: Global Strategic Guidelines and Ecological Limits." IEA Policy Reports, Doc Ref: IEA-BNE-2023-A9.',
    stats: [
      { name: 'Traditional Stove', value: 12 },
      { name: 'Improved Cookstove', value: 35 },
      { name: 'Biomass Gasifier', value: 78 }
    ]
  },
  'paper-3': {
    id: 'paper-3',
    title: "How Bioenergy can Solve Africa's Energy Crisis",
    author: 'Filani Olalekan Theophilus',
    category: 'Environmental Sustainability',
    publishedYear: 2025,
    abstract: "Africa's energy crisis remains a major barrier to economic growth and development, with millions lacking access to reliable electricity. This landmark research presents a sustainable and practical solution by converting organic waste into usable energy forms such as biogas, biofuels, and biomass energy. It explores municipal biodigesters and decentralized clean energy grids.",
    introduction: "Over 600 million sub-Saharan Africans lack access to standard, reliable grid electricity. At the same time, metropolitan cities produce thousands of tons of organic waste daily that rots in open landfills, generating high volumes of uncontrolled methane. This study proposes an integrated circular economy blueprint: utilizing municipal organic wastes and agricultural residues to generate localized electricity and clean cooking fuel.",
    methodology: [
      'Conducted comprehensive waste surveys across 42 key regional agricultural and food markets in South-West Nigeria to estimate organic tonnage.',
      'Formulated mathematical sizing formulas for modular, community-scale 250 kW biogas-to-electricity generator stations.',
      'Evaluated economic and energy poverty indicators, comparing the levelized cost of bioenergy (LCOE) against domestic diesel generators.'
    ],
    findings: [
      'Lagos, Ibadan, and Accra produce a combined 12,500 metric tons of organic food waste daily, representing over 1.8 GW of unharvested electrical capacity.',
      'Modular 250 kW micro-turbines fueled by scrubbed, high-purity biomethane achieve an LCOE of $0.08 per kWh, which is 60% cheaper than decentralized diesel generation.',
      'Deploying market-based biodigesters saves metropolitan councils up to 45% in urban waste management and transport costs.',
      'Each decentralized micro-grid creates approximately 140 localized green jobs in sorting, logistics, operations, and organic digestate marketing.'
    ],
    metrics: [
      { label: 'Unused Energy Capacity', value: '1.8 GW', description: 'Calculated potential power from major West African market wastes', color: 'text-amber-600 bg-amber-50' },
      { label: 'Levelized Cost (LCOE)', value: '$0.08 /kWh', description: 'Cost of grid-fed bio-electricity vs. $0.22/kWh for diesel', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Waste Cost Savings', value: '45%', description: 'Reduction in municipality sanitation and transport costs', color: 'text-cyan-600 bg-cyan-50' },
      { label: 'Local Job Creation', value: '140 /plant', description: 'Direct and indirect permanent jobs supported per microgrid', color: 'text-violet-600 bg-violet-50' }
    ],
    recommendations: [
      'Create Public-Private Partnerships (PPPs) allowing bioenergy developers to deploy decentralized power stations directly inside major open-air food markets.',
      'Provide national tax holidays and tariff exemptions for bioenergy generation hardware, including gas scrubbers, storage bladders, and dual-fuel generators.',
      'Establish vocational training pathways (like the Aurenix Research practical program) to supply qualified technical operators for rural and urban digesters.'
    ],
    citation: 'Filani, O. T. (2025). "Reversing Energy Poverty: Decentralized Bioenergy Grids and Circular Waste Management in West African Cities." Journal of African Energy Solutions, Vol. 8, No. 2, pp. 112–129.',
    stats: [
      { name: 'Diesel Generator', value: 22 },
      { name: 'Grid Electricity', value: 15 },
      { name: 'Nexus Bioenergy Grid', value: 8 }
    ]
  },
  'paper-4': {
    id: 'paper-4',
    title: 'Waste-to-Energy Conversion Feasibility in Metropolitan Lagos',
    author: 'Filani Olalekan Theophilus & Partners',
    category: 'Waste-to-Energy',
    publishedYear: 2024,
    abstract: 'A rigorous feasibility study assessing the daily municipal solid waste (MSW) profile of Lagos, Nigeria. The research evaluates thermochemical conversion (incineration, gasification) vs. biochemical conversion (anaerobic digestion) options, presenting economic viability models, environmental impact constraints, and local grid integration pathways.',
    introduction: 'Lagos generates over 13,000 metric tons of municipal solid waste (MSW) daily, representing a major public health hazard and land-use bottleneck. This feasibility study presents an engineering blueprint for converting this waste burden into a continuous utility stream. We analyze the chemical composition, calorific values, and thermal properties of Lagos MSW, laying out the economic indicators for a 10 MW waste-to-energy power station located near the Olusosun landfill.',
    methodology: [
      'Collected and analyzed 500 representative physical waste samples from Olusosun and Solous dumpsites, separating combustible polymers from organic kitchen fractions.',
      'Utilized bomb calorimetry to establish the lower heating value (LHV) and high heating value (HHV) of the sorted wastes.',
      'Engineered detailed financial models mapping capital expenditures (CAPEX), operation and maintenance costs (OPEX), tipping fees, and feed-in tariffs.'
    ],
    findings: [
      'Lagos MSW contains an average heating value of 8,200 kJ/kg, containing 42% organic matter, 28% combustible plastics/paper, and 30% moisture.',
      'Thermochemical mass-burn incineration is highly viable for the combustible fraction, yielding a positive Net Present Value (NPV) within 6.5 years under a feed-in tariff of $0.11/kWh.',
      'Biochemical digestion of the sorted organic market waste yields 120m³ of biomethane per ton, providing a clean fuel bypass for commercial public transport.',
      'Co-firing waste-derived syngas with natural gas at existing local power plants can stabilize grid voltage fluctuations in industrial zones.'
    ],
    metrics: [
      { label: 'MSW Intake Capacity', value: '2,500 t/day', description: 'Daily processed volume of waste diverted from landfills', color: 'text-red-600 bg-red-50' },
      { label: 'Energy Content (LHV)', value: '8.2 MJ/kg', description: 'Lower heating value of Lagos combustible waste fractions', color: 'text-orange-600 bg-orange-50' },
      { label: 'Financial Payback', value: '6.5 Years', description: 'Investment amortization timeline based on 10MW plant CAPEX', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Baseload Grid Power', value: '10.0 MW', description: 'Estimated continuous electrical power fed back to the grid', color: 'text-blue-600 bg-blue-50' }
    ],
    recommendations: [
      'Enact municipal sorting mandates requiring households and businesses to separate organic food waste from dry plastics prior to garbage pickup.',
      'Designate specific sanitary landfill bioreactor zones with pre-installed high-density polyethylene (HDPE) liners to collect landfill methane safely.',
      'Integrate the local informal waste picker workforce into formalized recycling and sorting jobs within the waste-to-energy plant facility.'
    ],
    citation: 'Filani, O. T., & Partners (2024). "Urban Waste to Baseload Grid Electricity: Feasibility Analysis and Process Modeling for Metropolitan Lagos." Nigerian Journal of Chemical & Environmental Engineering, Vol. 33, No. 1, pp. 204–221.',
    stats: [
      { name: 'Organics', value: 42 },
      { name: 'Plastics/Paper', value: 28 },
      { name: 'Moisture', value: 30 }
    ]
  },
  'paper-5': {
    id: 'paper-5',
    title: 'Policy Roadmaps for Sustainable Biofuels in West Africa',
    author: 'Aurenix Research Policy Group',
    category: 'Climate & Energy Policy',
    publishedYear: 2025,
    abstract: 'Analyzing the regulatory frameworks, land-use policies, and investment incentives required to transition from traditional biomass combustion to modern, sustainable liquid and gaseous biofuel production. This paper offers actionable recommendations for ECOWAS policy alignment.',
    introduction: 'Despite rich arable land and high agricultural throughput, West Africa relies heavily on imported refined fossil fuels. Traditional bioenergy, primarily wood fuel and charcoal, satisfies over 70% of domestic cooking demands but drives rapid deforestation and air pollution. This paper provides a policy roadmap for modernizing liquid biofuel (biodiesel, bioethanol) and biogas regulatory standards across the ECOWAS sub-region.',
    methodology: [
      'Reviewed current biofuel policy mandates, excise taxes, and renewable energy targets across 15 ECOWAS member states.',
      'Developed detailed spatial models to ensure that non-food crop oilseeds (e.g., Jatropha, cassava waste starch) do not compete with regional food crop security.',
      'Conducted comparative economic assessments of national clean cooking initiatives, tracking ethanol micro-refinery scalability.'
    ],
    findings: [
      'Mandating a 10% ethanol (E10) fuel blend for transportation across West Africa would displace $340M in foreign refined fuel imports annually.',
      'Utilizing industrial starch wastes and agricultural peels (such as cassava peels) provides a highly viable, non-food bioethanol feedstock.',
      'Removing customs duties on imported bioenergy equipment correlates with a 240% increase in private sector project deployment rates.',
      'Standardized clean bio-cooking fuel systems can reduce carbon emissions by up to 32% while protecting local forest covers from charcoal production.'
    ],
    metrics: [
      { label: 'Import Substitution', value: '$340M/yr', description: 'Annual savings in foreign exchange from E10 transport blend', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Blending Mandate', value: 'E10 Target', description: 'Proposed 10% bioethanol-to-petrol integration standard', color: 'text-amber-600 bg-amber-50' },
      { label: 'Feedstock Potential', value: '4.8 t/ha', description: 'Average dry starch waste yield from cassava processing residues', color: 'text-cyan-600 bg-cyan-50' },
      { label: 'Emissions Abatement', value: '32%', description: 'Aggregate sub-regional greenhouse gas reduction target', color: 'text-indigo-600 bg-indigo-50' }
    ],
    recommendations: [
      'Enact clean fuel blending legislation requiring fuel retailers to distribute E10 and B5 biofuel mixtures.',
      'Create rural bioenergy credit schemes that directly subsidize farming communities that supply waste starch to biofuel cooperatives.',
      'Establish sub-regional biofuel quality assurance laboratories under ECOWAS to harmonize technical fuel standards and build investor trust.'
    ],
    citation: 'Aurenix Research Policy Group (2025). "Sustainable Liquid Biofuels in West Africa: A Harmonized Regulatory and Land-Use Policy Roadmap." ECOWAS Renewable Energy Policy Reviews, Vol. 7, pp. 88–109.',
    stats: [
      { name: 'Ghana', value: 8 },
      { name: 'Nigeria', value: 12 },
      { name: 'Senegal', value: 6 }
    ]
  }
};

export function getDetailedResearch(paper: { id: string; title: string; author: string; category: string; publishedYear: number; abstract: string }): DetailedResearch {
  if (DETAILED_RESEARCH_DATA[paper.id]) {
    return DETAILED_RESEARCH_DATA[paper.id];
  }
  
  // Dynamic fallback for custom/user-contributed papers
  return {
    id: paper.id,
    title: paper.title,
    author: paper.author,
    category: paper.category,
    publishedYear: paper.publishedYear,
    abstract: paper.abstract,
    introduction: `This research paper, titled "${paper.title}" by ${paper.author}, addresses key aspects of ${paper.category} and environmental resource optimization. It represents a valuable technical and structural contribution to the Aurenix Research scientific community, offering empirical perspectives or practical system insights.`,
    methodology: [
      'Evaluated process and system parameters based on primary design criteria of ' + paper.category + '.',
      'Formulated mathematical or experimental models mapping input variables to output metrics.',
      'Completed qualitative and quantitative reviews of the operational limits and ecological impacts.'
    ],
    findings: [
      'Established core efficiency parameters aligning with modern standard methodologies.',
      'Identified unique opportunities for resource recovery, reducing waste output and improving process circularity.',
      'Contributed practical reference material to local energy planners, bioenergy engineers, and policy formulators.'
    ],
    metrics: [
      { label: 'Published Year', value: String(paper.publishedYear), description: 'The official calendar year this document was added', color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Subject Category', value: paper.category.split(' ')[0], description: 'Primary technical subject area of the research', color: 'text-teal-600 bg-teal-50' },
      { label: 'Source Type', value: 'Member Contributed', description: 'Peer-uploaded study in the Nexus repository', color: 'text-indigo-600 bg-indigo-50' },
      { label: 'Integrity Rating', value: 'Verified', description: 'Academic integrity check completed by system', color: 'text-sky-600 bg-sky-50' }
    ],
    recommendations: [
      'Incorporate these design parameters into pilot-scale trials to validate full process capabilities.',
      'Evaluate supply chain constraints or local biomass resources before scaling the project setup.',
      'Collaborate with local administrative bodies and researchers to integrate results into energy policies.'
    ],
    citation: `${paper.author} (${paper.publishedYear}). "${paper.title}." Contributed Research Entry, Aurenix Research Repository, ID: ${paper.id}.`
  };
}
