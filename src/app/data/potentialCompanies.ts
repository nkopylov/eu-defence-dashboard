import { Company } from "../types";

export const potentialDefenceCompanies: Company[] = [
  // Public Companies with Defense Conversion Potential
  { 
    name: "Volkswagen AG", 
    ticker: "VOW3.DE", 
    country: "Germany", 
    sector: "Automotive",
    products: "Vehicle manufacturing, autonomous systems, electronics",
    defensePotential: "Factory conversion for armored vehicles, engines for military vehicles, logistics vehicles",
    revenue: 322.3, // EUR billions (2023)
    marketCap: 64.2, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a focus for EU defense funding
  },
  { 
    name: "Siemens", 
    ticker: "SIE.DE", 
    country: "Germany", 
    sector: "Industrial/Technology",
    products: "Electronics, automation, digitalization, energy systems",
    defensePotential: "Command & control systems, radar components, secure communications",
    revenue: 77.8, // EUR billions (2023)
    marketCap: 143.0, // EUR billions (Mar 2025)
    euFundFocus: true // Potential focus for EU defense technological sovereignty initiatives
  },
  { 
    name: "Fiat/Stellantis", 
    ticker: "STLA.MI", 
    country: "Italy/Multinational", 
    sector: "Automotive",
    products: "Vehicle manufacturing, commercial vehicles",
    defensePotential: "Military transport vehicles, tactical vehicles, parts production",
    revenue: 189.5, // EUR billions (2023)
    marketCap: 54.8, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a major focus for EU defense funding
  },
  { 
    name: "Nokia", 
    ticker: "NOKIA.HE", 
    country: "Finland", 
    sector: "Telecommunications",
    products: "Network infrastructure, communications systems",
    defensePotential: "Secure military communications, electronic warfare components",
    revenue: 23.0, // EUR billions (2023)
    marketCap: 21.7, // EUR billions (Mar 2025)
    euFundFocus: true // Strategic for EU secure communications networks
  },
  { 
    name: "Ericsson", 
    ticker: "ERIC-B.ST", 
    country: "Sweden", 
    sector: "Telecommunications",
    products: "Network equipment, 5G infrastructure",
    defensePotential: "Military communications systems, signal intelligence",
    revenue: 24.8, // EUR billions (2023)
    marketCap: 17.9, // EUR billions (Mar 2025)
    euFundFocus: true // Strategic for EU secure communications
  },
  { 
    name: "BASF", 
    ticker: "BAS.DE", 
    country: "Germany", 
    sector: "Chemicals",
    products: "Chemicals, advanced materials, coatings",
    defensePotential: "Materials for armor, explosives components, specialty chemicals",
    revenue: 68.3, // EUR billions (2023)
    marketCap: 43.7, // EUR billions (Mar 2025)
    euFundFocus: false // Not a primary focus for EU defense funding
  },
  { 
    name: "Volvo Group", 
    ticker: "VOLV-B.ST", 
    country: "Sweden", 
    sector: "Automotive/Industrial",
    products: "Trucks, construction equipment, engines",
    defensePotential: "Military vehicles, logistics support vehicles, armor manufacturing",
    revenue: 47.9, // EUR billions (2023)
    marketCap: 42.5, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a focus for EU defense funding
  },
  { 
    name: "Renault", 
    ticker: "RNO.PA", 
    country: "France", 
    sector: "Automotive",
    products: "Vehicle manufacturing, EV technology",
    defensePotential: "Light tactical vehicles, military transport vehicles",
    revenue: 52.4, // EUR billions (2023)
    marketCap: 12.8, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a major focus for EU defense funding
  },
  { 
    name: "Konecranes", 
    ticker: "KCR.HE", 
    country: "Finland", 
    sector: "Industrial Equipment",
    products: "Cranes, lifting equipment, port solutions",
    defensePotential: "Heavy equipment for military logistics, specialized lifting equipment",
    revenue: 3.6, // EUR billions (2023)
    marketCap: 2.9, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a focus for EU defense funding
  },
  
  // Private Companies with Defense Conversion Potential
  { 
    name: "Bosch", 
    ticker: "PRIVATE:BOSCH", 
    country: "Germany", 
    sector: "Technology/Industrial",
    products: "Electronics, sensors, automotive components, IoT",
    defensePotential: "Sensors for defense systems, electronic components, vehicle systems",
    description: "Robert Bosch GmbH is one of Europe's largest industrial companies with significant capabilities in sensors, electronics, and automotive systems that could be adapted for defense use.",
    revenue: 91.6, // EUR billions (2023)
    euFundFocus: true // Potential strategic partner for EU defense electronics
  },
  { 
    name: "Damen Shipyards", 
    ticker: "PRIVATE:DAMEN", 
    country: "Netherlands", 
    sector: "Maritime/Shipbuilding",
    products: "Civilian and military vessels, shipbuilding",
    defensePotential: "Patrol vessels, naval vessels, offshore patrol vessels",
    description: "Family-owned shipbuilding group that already produces vessels for naval and coast guard applications, with capacity to expand military vessel production.",
    revenue: 2.8, // EUR billions (estimated, 2023)
    euFundFocus: true // Already involved in EU naval defense projects
  },
  { 
    name: "Liebherr Group", 
    ticker: "PRIVATE:LIEBHERR", 
    country: "Switzerland", 
    sector: "Industrial/Construction",
    products: "Heavy equipment, cranes, aircraft components",
    defensePotential: "Military logistics equipment, specialized vehicle platforms",
    description: "Swiss-based family business with extensive capabilities in heavy equipment and aerospace components that could be redirected to defense applications.",
    revenue: 14.3, // EUR billions (2023)
    euFundFocus: false // Non-EU headquarters, limited focus for EU defense funding
  },
  { 
    name: "Ferrovial", 
    ticker: "FER.MC", 
    country: "Spain", 
    sector: "Infrastructure/Construction",
    products: "Infrastructure construction, transportation, engineering",
    defensePotential: "Military infrastructure, fortifications, rapid deployment structures",
    revenue: 7.8, // EUR billions (2023)
    marketCap: 24.3, // EUR billions (Mar 2025)
    euFundFocus: false // Not a primary focus for EU defense funding
  },
  { 
    name: "EDAG Engineering", 
    ticker: "ED4.DE", 
    country: "Germany", 
    sector: "Automotive Engineering",
    products: "Vehicle design, engineering services, prototyping",
    defensePotential: "Military vehicle design, armor solutions, specialized vehicle development",
    revenue: 0.8, // EUR billions (2023)
    marketCap: 0.2, // EUR billions (Mar 2025)
    euFundFocus: false // Not currently a focus for EU defense funding
  },
  { 
    name: "Festo", 
    ticker: "PRIVATE:FESTO", 
    country: "Germany", 
    sector: "Automation/Pneumatics",
    products: "Pneumatic systems, automation technology, robotics",
    defensePotential: "Actuation systems for military vehicles, robotics for defense purposes",
    description: "Family-owned industrial control and automation company with pneumatic and robotic systems applicable to defense systems.",
    revenue: 3.8, // EUR billions (2023)
    euFundFocus: false // Not currently a focus for EU defense funding
  },
  { 
    name: "Trumpf", 
    ticker: "PRIVATE:TRUMPF", 
    country: "Germany", 
    sector: "Manufacturing/Laser",
    products: "Laser cutting systems, machine tools, electronics",
    defensePotential: "Precision manufacturing for weapons systems, laser technology",
    description: "Leading manufacturer of machine tools and industrial lasers with high precision manufacturing capabilities applicable to defense production.",
    revenue: 5.1, // EUR billions (2023)
    euFundFocus: true // Key supplier for precision manufacturing technology
  },
  { 
    name: "Škoda Transportation", 
    ticker: "PRIVATE:SKODA", 
    country: "Czech Republic", 
    sector: "Transportation/Engineering",
    products: "Rail vehicles, transportation systems, electrical equipment",
    defensePotential: "Military vehicles, specialized transport platforms",
    description: "Czech engineering company with capabilities in transportation equipment that could be converted to military applications.",
    revenue: 0.7, // EUR billions (2023)
    euFundFocus: false // Not currently a primary focus for EU defense funding
  },
  { 
    name: "Wärtsilä", 
    ticker: "WRT1V.HE", 
    country: "Finland", 
    sector: "Marine/Energy",
    products: "Marine engines, power plants, energy solutions",
    defensePotential: "Naval propulsion systems, power solutions for military applications",
    revenue: 5.6, // EUR billions (2023)
    marketCap: 8.4, // EUR billions (Mar 2025)
    euFundFocus: true // Strategic for naval propulsion technology
  },
  { 
    name: "Fokker Technologies", 
    ticker: "PRIVATE:FOKKER", 
    country: "Netherlands", 
    sector: "Aerospace",
    products: "Aircraft components, structures, wiring",
    defensePotential: "Military aircraft components, specialized aerospace systems",
    description: "Historic Dutch aerospace manufacturer (now part of GKN Aerospace) with capabilities in aircraft structures and components.",
    revenue: 1.1, // EUR billions (estimated, 2023)
    euFundFocus: true // Part of EU aerospace supply chains
  }
];