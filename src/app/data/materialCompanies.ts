import { Company } from "../types";
import type { MaterialCategory } from "../types";

export const materialCompanies: (Company & { category: MaterialCategory })[] = [
  // Steel & Metals Category
  {
    name: "ArcelorMittal",
    ticker: "MT.AS",
    country: "Luxembourg/Multinational",
    products: "Steel, carbon materials, high-strength alloys",
    sector: "Steel & Mining",
    category: "steel",
    defenseUses: "Armor plating, naval vessels, military vehicles, structural elements for defense infrastructure"
  },
  {
    name: "ThyssenKrupp",
    ticker: "TKA.DE",
    country: "Germany",
    products: "Steel, shipbuilding, industrial components",
    sector: "Steel & Engineering",
    category: "steel",
    defenseUses: "Naval vessels, submarines, armor plating, military vehicle components"
  },
  {
    name: "Voestalpine",
    ticker: "VOE.VI",
    country: "Austria",
    products: "High-performance steels, railway systems, tool steel",
    sector: "Steel Products",
    category: "steel",
    defenseUses: "Specialized armor plates, railway track systems for military logistics, high-strength components"
  },
  {
    name: "SSAB",
    ticker: "SSAB-A.ST",
    country: "Sweden",
    products: "High-strength steel, advanced steel solutions",
    sector: "Steel",
    category: "steel",
    defenseUses: "Armor plating for vehicles, hardened steel for defense applications, naval shipbuilding"
  },
  {
    name: "Salzgitter AG",
    ticker: "SZG.DE",
    country: "Germany",
    products: "Steel products, tubes, trading",
    sector: "Steel & Technology",
    category: "steel",
    defenseUses: "Components for military vehicles, structural elements for defense systems"
  },

  // Rare Earth & Critical Minerals Category
  {
    name: "Umicore",
    ticker: "UMI.BR",
    country: "Belgium",
    products: "Precious metals, battery materials, catalyst technologies",
    sector: "Materials Technology",
    category: "rareEarth",
    defenseUses: "Critical components for electronics, guidance systems, battery technology for military applications"
  },
  {
    name: "Neo Performance Materials",
    ticker: "NEO.TO",
    country: "Canada/Europe operations",
    products: "Rare earth processing, magnetic materials, specialty chemicals",
    sector: "Advanced Materials",
    category: "rareEarth",
    defenseUses: "Magnets for guidance systems, specialty materials for defense electronics"
  },
  {
    name: "Iluka Resources",
    ticker: "ILU.AX",
    country: "Australia/Europe operations",
    products: "Mineral sands, titanium dioxide, zircon",
    sector: "Mining & Materials",
    category: "rareEarth",
    defenseUses: "Titanium for aircraft components, critical minerals for defense applications"
  },
  {
    name: "Lynas Rare Earths",
    ticker: "LYC.AX",
    country: "Australia/Malaysia/Europe",
    products: "Rare earth elements, neodymium, praseodymium",
    sector: "Mining & Materials",
    category: "rareEarth",
    defenseUses: "Critical materials for missile guidance systems, radar technology, communications equipment"
  },
  {
    name: "Strategic Minerals Europe",
    ticker: "PRIVATE:STRAMIN",
    country: "Spain",
    products: "Tin, tantalum, niobium, rare earth minerals",
    sector: "Mining & Processing",
    category: "rareEarth",
    description: "Spanish mining company focused on extraction and processing of critical minerals essential for defense applications.",
    defenseUses: "Materials for electronics, communication systems, and advanced weapon systems"
  },

  // Explosives & Chemicals Category
  {
    name: "BASF",
    ticker: "BAS.DE",
    country: "Germany",
    products: "Chemicals, materials, catalysts, coatings",
    sector: "Chemicals",
    category: "explosives",
    defenseUses: "Propellants, advanced materials for defense applications, specialty chemicals"
  },
  {
    name: "Evonik Industries",
    ticker: "EVK.DE",
    country: "Germany",
    products: "Specialty chemicals, high-performance polymers",
    sector: "Specialty Chemicals",
    category: "explosives",
    defenseUses: "Composite materials for defense, specialty additives for munitions"
  },
  {
    name: "Eurenco",
    ticker: "PRIVATE:EURENCO",
    country: "France",
    products: "Propellants, explosives, specialty chemicals",
    sector: "Defense Chemicals",
    category: "explosives",
    description: "European leader in energetic materials, producing explosives, propellants, and specialty chemicals exclusively for defense applications.",
    defenseUses: "Military explosives, propellants for missiles and artillery, explosive components"
  },
  {
    name: "Maxam",
    ticker: "PRIVATE:MAXAM",
    country: "Spain",
    products: "Commercial explosives, blasting solutions, ammunition components",
    sector: "Explosives & Defense",
    category: "explosives",
    description: "Spanish multinational with expertise in civil and military explosives production, now part of the global explosives industry.",
    defenseUses: "Military-grade explosives, propellants, ammunition components"
  },
  {
    name: "Chemring Group",
    ticker: "CHG.L",
    country: "United Kingdom",
    products: "Countermeasures, energetics, sensors",
    sector: "Defense Technology",
    category: "explosives",
    defenseUses: "Military countermeasures, explosive components, pyrotechnics for defense applications"
  },

  // Advanced Composites & Materials Category
  {
    name: "Hexcel Corporation",
    ticker: "HXL",
    country: "USA/Europe operations",
    products: "Advanced composites, carbon fiber, structural materials",
    sector: "Aerospace Materials",
    category: "composites",
    defenseUses: "Aircraft structures, ballistic protection, lightweight components for military vehicles"
  },
  {
    name: "Teijin",
    ticker: "3401.T",
    country: "Japan/Europe operations",
    products: "Carbon fiber, aramid fibers, advanced composites",
    sector: "Advanced Materials",
    category: "composites",
    defenseUses: "Ballistic protection, structural components for military aircraft"
  },
  {
    name: "SGL Carbon",
    ticker: "SGL.DE",
    country: "Germany",
    products: "Carbon-based products, carbon fibers, composite materials",
    sector: "Advanced Materials",
    category: "composites",
    defenseUses: "Carbon fiber components for aircraft, lightweight armor solutions, specialized defense materials"
  },
  {
    name: "Gurit",
    ticker: "GUR.SW",
    country: "Switzerland",
    products: "Composite materials, structural cores, engineering services",
    sector: "Advanced Materials",
    category: "composites",
    defenseUses: "Composite structures for defense vehicles, naval applications, specialized defense components"
  },
  {
    name: "Porcher Industries",
    ticker: "PRIVATE:PORCHER",
    country: "France",
    products: "Technical textiles, composites, high-performance materials",
    sector: "Technical Textiles & Composites",
    category: "composites",
    description: "French industrial group specializing in technical textiles and high-performance thermoplastic composites used in defense applications.",
    defenseUses: "Ballistic protection fabrics, composite materials for aircraft structures, specialized defense textiles"
  },

  // Electronics & Semiconductor Materials Category
  {
    name: "Infineon Technologies",
    ticker: "IFX.DE",
    country: "Germany",
    products: "Semiconductors, power systems, security chips",
    sector: "Semiconductors",
    category: "electronics",
    defenseUses: "Power electronics for defense systems, secure microcontrollers, radar components"
  },
  {
    name: "STMicroelectronics",
    ticker: "STM.PA",
    country: "Switzerland/France/Italy",
    products: "Semiconductors, sensors, microcontrollers",
    sector: "Semiconductors",
    category: "electronics",
    defenseUses: "Electronic components for defense systems, sensors for military applications"
  },
  {
    name: "Soitec",
    ticker: "SOI.PA",
    country: "France",
    products: "Silicon-on-insulator wafers, semiconductor materials",
    sector: "Semiconductor Materials",
    category: "electronics",
    defenseUses: "Advanced semiconductor materials for radar systems, communications equipment"
  },
  {
    name: "ASML Holding",
    ticker: "ASML.AS",
    country: "Netherlands",
    products: "Semiconductor lithography equipment, chip manufacturing technology",
    sector: "Semiconductor Equipment",
    category: "electronics",
    defenseUses: "Critical equipment for producing advanced defense electronics and communications systems"
  },
  {
    name: "Thales Alenia Space",
    ticker: "PRIVATE:THALES-AS",
    country: "France/Italy",
    products: "Satellite systems, space electronics, communications equipment",
    sector: "Space & Defense Electronics",
    category: "electronics",
    description: "Joint venture between Thales Group and Leonardo, specializing in satellite systems and space electronics with significant defense applications.",
    defenseUses: "Satellite communications systems, space-based surveillance, military communications technology"
  }
];