import { Company } from "../types";

// Define types for the dependency network
export interface NetworkNode extends Company {
  id: string;
  type: 'producer' | 'supplier' | 'material';
  level: number; // 0 = end producer, 1 = tier 1 supplier, 2 = material provider, etc.
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number; // Strength of dependency from 1-10
  description: string; // Description of the dependency relationship
}

export interface DependencyNetwork {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

// Create the network data
export const dependencyNetwork: DependencyNetwork = {
  nodes: [
    // Level 0: End Product Manufacturers (Weapon Systems, Vehicles, etc.)
    {
      id: "rheinmetall",
      name: "Rheinmetall",
      ticker: "RHM.DE",
      country: "Germany",
      products: "Tanks, artillery systems, ammunition",
      type: "producer",
      level: 0,
      sector: "Defense Manufacturing"
    },
    {
      id: "bae",
      name: "BAE Systems",
      ticker: "BA.L",
      country: "United Kingdom",
      products: "Combat vehicles, naval ships, electronics",
      type: "producer",
      level: 0,
      sector: "Defense Manufacturing"
    },
    {
      id: "dassault",
      name: "Dassault Aviation",
      ticker: "AM.PA", 
      country: "France",
      products: "Fighter jets, military aircraft",
      type: "producer",
      level: 0,
      sector: "Aerospace & Defense"
    },
    {
      id: "leonardo",
      name: "Leonardo",
      ticker: "LDO.MI",
      country: "Italy",
      products: "Helicopters, defense electronics, naval systems",
      type: "producer",
      level: 0,
      sector: "Aerospace & Defense"
    },
    {
      id: "saab",
      name: "Saab AB",
      ticker: "SAAB-B.ST",
      country: "Sweden",
      products: "Fighter aircraft, missile systems, radar",
      type: "producer",
      level: 0,
      sector: "Aerospace & Defense"
    },

    // Level 1: Major Tier 1 Suppliers
    {
      id: "thales",
      name: "Thales",
      ticker: "HO.PA",
      country: "France",
      products: "Electronics, radar systems, communication systems",
      type: "supplier",
      level: 1,
      sector: "Defense Electronics"
    },
    {
      id: "hensoldt",
      name: "Hensoldt",
      ticker: "HAG.DE",
      country: "Germany",
      products: "Sensors, electronic warfare systems, avionics",
      type: "supplier",
      level: 1,
      sector: "Defense Electronics"
    },
    {
      id: "safran",
      name: "Safran",
      ticker: "SAF.PA",
      country: "France",
      products: "Aircraft engines, navigation systems, defense optics",
      type: "supplier",
      level: 1,
      sector: "Aerospace & Defense"
    },
    {
      id: "rolls-royce",
      name: "Rolls-Royce",
      ticker: "RR.L",
      country: "United Kingdom",
      products: "Aircraft engines, power systems, naval propulsion",
      type: "supplier",
      level: 1,
      sector: "Aerospace & Defense"
    },
    {
      id: "mbda",
      name: "MBDA",
      ticker: "PRIVATE:MBDA",
      country: "Multinational (UK/FR/IT)",
      products: "Missile systems, guided weapons",
      type: "supplier",
      level: 1,
      sector: "Defense Systems",
      description: "Joint venture between BAE Systems, Airbus, and Leonardo that develops and manufactures missiles and missile systems."
    },

    // Level 2: Key Systems & Components Suppliers
    {
      id: "infineon",
      name: "Infineon Technologies",
      ticker: "IFX.DE",
      country: "Germany",
      products: "Semiconductors, power systems, microcontrollers",
      type: "supplier",
      level: 2,
      sector: "Semiconductors",
      category: "electronics"
    },
    {
      id: "stmicro",
      name: "STMicroelectronics",
      ticker: "STM.PA",
      country: "Switzerland/France/Italy",
      products: "Semiconductors, sensors, microcontrollers",
      type: "supplier",
      level: 2,
      sector: "Semiconductors",
      category: "electronics"
    },
    {
      id: "eurenco",
      name: "Eurenco",
      ticker: "PRIVATE:EURENCO",
      country: "France",
      products: "Propellants, explosives, specialty chemicals",
      type: "supplier",
      level: 2,
      sector: "Defense Chemicals",
      category: "explosives",
      description: "European leader in energetic materials, producing explosives and propellants for defense applications."
    },
    {
      id: "kongsberg",
      name: "Kongsberg Gruppen",
      ticker: "KOG.OL",
      country: "Norway",
      products: "Missile systems, defense communications, maritime systems",
      type: "supplier",
      level: 2,
      sector: "Defense Technology"
    },
    {
      id: "indra",
      name: "Indra Sistemas",
      ticker: "IDR.MC",
      country: "Spain",
      products: "Defense electronics, air traffic management, cybersecurity",
      type: "supplier",
      level: 2,
      sector: "Defense Technology"
    },

    // Level 3: Raw Materials & Base Components
    {
      id: "thyssenkrupp",
      name: "ThyssenKrupp",
      ticker: "TKA.DE", 
      country: "Germany",
      products: "Steel, industrial components, naval construction",
      type: "material",
      level: 3,
      sector: "Steel & Engineering",
      category: "steel"
    },
    {
      id: "arcelormittal",
      name: "ArcelorMittal",
      ticker: "MT.AS",
      country: "Luxembourg/Multinational",
      products: "Steel, high-strength alloys",
      type: "material",
      level: 3,
      sector: "Steel & Mining",
      category: "steel"
    },
    {
      id: "umicore",
      name: "Umicore",
      ticker: "UMI.BR",
      country: "Belgium",
      products: "Precious metals, battery materials, catalysts",
      type: "material",
      level: 3,
      sector: "Materials Technology",
      category: "rareEarth"
    },
    {
      id: "basf",
      name: "BASF",
      ticker: "BAS.DE",
      country: "Germany",
      products: "Chemicals, materials, catalysts",
      type: "material",
      level: 3,
      sector: "Chemicals",
      category: "explosives"
    },
    {
      id: "sgl-carbon",
      name: "SGL Carbon",
      ticker: "SGL.DE",
      country: "Germany",
      products: "Carbon fiber, composites, carbon materials",
      type: "material",
      level: 3,
      sector: "Advanced Materials",
      category: "composites"
    }
  ],
  links: [
    // Level 0 to Level 1 connections
    { source: "rheinmetall", target: "thales", value: 7, description: "Electronic systems for tanks and artillery" },
    { source: "rheinmetall", target: "hensoldt", value: 8, description: "Sensor systems for armored vehicles" },
    { source: "bae", target: "rolls-royce", value: 9, description: "Engines and propulsion systems for military vehicles and ships" },
    { source: "bae", target: "mbda", value: 10, description: "Missile systems integration for aircraft and naval vessels" },
    { source: "dassault", target: "thales", value: 9, description: "Avionics and radar systems for fighter jets" },
    { source: "dassault", target: "safran", value: 10, description: "Engines and navigation systems for aircraft" },
    { source: "dassault", target: "mbda", value: 8, description: "Integration of missile systems on Rafale jets" },
    { source: "leonardo", target: "mbda", value: 8, description: "Missile systems for helicopters and naval platforms" },
    { source: "leonardo", target: "thales", value: 7, description: "Electronic warfare systems" },
    { source: "saab", target: "kongsberg", value: 6, description: "Missile components and systems" },
    { source: "saab", target: "hensoldt", value: 7, description: "Radar and sensing systems" },

    // Level 1 to Level 2 connections
    { source: "thales", target: "infineon", value: 8, description: "Semiconductor components for defense electronics" },
    { source: "thales", target: "stmicro", value: 7, description: "Microcontrollers and sensors for defense systems" },
    { source: "thales", target: "indra", value: 6, description: "Collaboration on defense electronics" },
    { source: "hensoldt", target: "infineon", value: 9, description: "Advanced semiconductor components for sensor systems" },
    { source: "hensoldt", target: "stmicro", value: 8, description: "Electronic components for radar systems" },
    { source: "safran", target: "eurenco", value: 7, description: "Propellants for missile systems" },
    { source: "rolls-royce", target: "kongsberg", value: 5, description: "Components for naval propulsion systems" },
    { source: "mbda", target: "eurenco", value: 9, description: "Explosives and propellants for missile warheads" },
    { source: "mbda", target: "stmicro", value: 7, description: "Guidance system electronics" },

    // Level 2 to Level 3 connections
    { source: "infineon", target: "basf", value: 6, description: "Chemical materials for semiconductor production" },
    { source: "infineon", target: "umicore", value: 8, description: "Precious metals and materials for electronics" },
    { source: "stmicro", target: "umicore", value: 7, description: "Specialized materials for semiconductor manufacturing" },
    { source: "eurenco", target: "basf", value: 9, description: "Chemical precursors for explosives and propellants" },
    { source: "kongsberg", target: "thyssenkrupp", value: 6, description: "Steel components for missile systems" },
    { source: "kongsberg", target: "sgl-carbon", value: 7, description: "Carbon fiber components for missile structures" },
    { source: "indra", target: "arcelormittal", value: 5, description: "Metal components for radar housings and structures" },
    
    // Direct Level 0 to Level 3 connections (some major manufacturers source directly)
    { source: "rheinmetall", target: "thyssenkrupp", value: 10, description: "Steel for tank armor and structural components" },
    { source: "rheinmetall", target: "basf", value: 7, description: "Chemical components for ammunition" },
    { source: "bae", target: "arcelormittal", value: 8, description: "Steel for naval vessels and armored vehicles" },
    { source: "bae", target: "sgl-carbon", value: 7, description: "Carbon composites for aircraft components" },
    { source: "dassault", target: "sgl-carbon", value: 9, description: "Carbon fiber components for aircraft structures" },
    { source: "leonardo", target: "sgl-carbon", value: 8, description: "Advanced composites for helicopter structures" },
    { source: "leonardo", target: "thyssenkrupp", value: 6, description: "Steel components for naval systems" },
    { source: "saab", target: "umicore", value: 5, description: "Specialized materials for electronic components" }
  ]
};