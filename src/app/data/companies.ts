import { Company } from "../types";

export const companies: Company[] = [
  {
    name: "Airbus",
    ticker: "AIR.PA",
    country: "Multinational (FR/DE/ES)",
    products: "Military and commercial aircraft, satellites, helicopters",
    revenue: 74.2,            // USD billions (2024) [oai_citation_attribution:0‡en.wikipedia.org](https://en.wikipedia.org/wiki/Airbus#:~:text=RevenueImage%3A%20Increase%C2%A0%E2%82%AC69.23%20billion)
    marketCap: 150.0,        // USD billions (Mar 2025) [oai_citation_attribution:1‡companiesmarketcap.com](https://companiesmarketcap.com/airbus/marketcap/#:~:text=Market%20capitalization%20of%20Airbus%20%28AIR)
    euFundFocus: true,       // Key supplier of military aircraft (EU defense projects like FCAS)
  },
  {
    name: "BAE Systems",
    ticker: "BA.L",
    country: "United Kingdom",
    products: "Combat aircraft, naval ships, armored vehicles, cyber technology",
    revenue: 28.9,           // USD billions (2023) [oai_citation_attribution:2‡baesystems.com](https://www.baesystems.com/en-us/article/2023-full-year-results#:~:text=Year%20ended%2031%20December%202023%2C,Basic%20earnings%20per)
    marketCap: 63.7,         // USD billions (Mar 2025) [oai_citation_attribution:3‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20BAE%20Systems%20logo)
    euFundFocus: false,      // UK-based (benefits from European spend, but outside EU fund)
  },
  {
    name: "Thales",
    ticker: "HO.PA",
    country: "France",
    products: "Radars, missile guidance, avionics, secure communications, cybersecurity",
    revenue: 18.8,           // USD billions (2023) [oai_citation_attribution:4‡companiesmarketcap.com](https://companiesmarketcap.com/thales/revenue/#:~:text=Revenue%20in%202022%3A%20%2418,84%20Billion%20USD)
    marketCap: 52.6,         // USD billions (Mar 2025) [oai_citation_attribution:5‡companiesmarketcap.com](https://companiesmarketcap.com/thales/marketcap/#:~:text=Thales%20%28HO.PA%29%20,cap%20according%20to%20our%20data)
    euFundFocus: true,       // Defense electronics and air-defense systems (EU air defense initiatives)
  },
  {
    name: "Leonardo",
    ticker: "LDO.MI",
    country: "Italy",
    products: "Military helicopters, avionics, defense electronics, aerospace",
    revenue: 18.7,           // USD billions (2024) [oai_citation_attribution:6‡companiesmarketcap.com](https://companiesmarketcap.com/leonardo/revenue/#:~:text=Revenue%20in%202024%20%28TTM%29%3A%20%2418,Billion%20USD)
    marketCap: 28.6,         // USD billions (Mar 2025) [oai_citation_attribution:7‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Leonardo%20logo)
    euFundFocus: true,       // Major EU defense contractor (helicopters, electronics, missiles)
  },
  {
    name: "Safran",
    ticker: "SAF.PA",
    country: "France",
    products: "Jet engines, inertial navigation systems, defense optics",
    revenue: 25.0,           // USD billions (2023, ~€23.65B) [oai_citation_attribution:8‡statista.com](https://www.statista.com/statistics/628480/safran-revenue/#:~:text=Safran%20revenue%202019%20to%202023,year%20ends%20on%20December%2031)
    marketCap: 117.7,        // USD billions (Mar 2025) [oai_citation_attribution:9‡companiesmarketcap.com](https://companiesmarketcap.com/safran/marketcap/#:~:text=Cap%20companiesmarketcap,cap%20according%20to%20our%20data)
    euFundFocus: true,       // Aerospace engines and navigation (critical for EU air combat systems)
  },
  {
    name: "Rheinmetall",
    ticker: "RHM.DE",
    country: "Germany",
    products: "Tanks, artillery systems, ammunition, air defense",
    revenue: 7.2,            // EUR billions (2023) [oai_citation_attribution:10‡statista.com](https://www.statista.com/statistics/1542556/rheinmetall-revenue/#:~:text=Rheinmetall%20revenue%202023%20,ends%20on%20December%2031)
    marketCap: 54.6,         // USD billions (Mar 2025) [oai_citation_attribution:11‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Rheinmetall%20logo)
    euFundFocus: true,       // Europe’s top ammunition and armor producer [oai_citation_attribution:12‡reuters.com](https://www.reuters.com/markets/europe/tanks-not-cars-how-pivot-defence-could-help-germanys-economy-2025-03-05/#:~:text=Rheinmetall%20%28RHMG,to%20mostly%20make%20defence%20equipment)
  },
  {
    name: "Rolls-Royce Holdings",
    ticker: "RR.L",
    country: "United Kingdom",
    products: "Jet engines, propulsion (civil & military), submarine reactors",
    revenue: 21.0,           // USD billions (TTM 2025) [oai_citation_attribution:13‡companiesmarketcap.com](https://companiesmarketcap.com/rolls-royce-holdings/revenue/#:~:text=Cap%20companiesmarketcap,00%20Billion%20USD)
    marketCap: 67.0,         // USD billions (approx Mar 2025) [oai_citation_attribution:14‡macrotrends.net](https://www.macrotrends.net/stocks/charts/RYCEY/rolls-royce-holdings/market-cap#:~:text=MacroTrends%20www.macrotrends.net%20%20Rolls,chart%20from%202010%20to%202024) [oai_citation_attribution:15‡stockanalysis.com](https://stockanalysis.com/quote/lon/RR/market-cap/#:~:text=Analysis%20stockanalysis.com%20%20Rolls,47B)
    euFundFocus: false,      // Key supplier (military jet engines), but UK-based
  },
  {
    name: "Dassault Aviation",
    ticker: "AM.PA",
    country: "France",
    products: "Rafale fighter jets, Falcon business jets, UAVs",
    revenue: 6.0,            // EUR billions (2023) [oai_citation_attribution:16‡statista.com](https://www.statista.com/statistics/715128/dassault-aviation-revenue/#:~:text=Dassault%20Aviation%20revenue%202023%20,95%20billion%20euros%20in%202023)
    marketCap: 24.7,         // USD billions (Mar 2025) [oai_citation_attribution:17‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Dassault%20Aviation%20logo)
    euFundFocus: true,       // Fighter aircraft manufacturer (EU air combat capabilities)
  },
  {
    name: "Saab AB",
    ticker: "SAAB-B.ST",
    country: "Sweden",
    products: "Gripen fighter, Giraffe radars, RBS missile systems",
    revenue: 5.99,           // USD billions (2023) [oai_citation_attribution:18‡companiesmarketcap.com](https://companiesmarketcap.com/saab/revenue/#:~:text=Cap%20companiesmarketcap,the%20year%202023%20that)
    marketCap: 19.1,         // USD billions (Mar 2025) [oai_citation_attribution:19‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20favorite%20icon16)
    euFundFocus: true,       // Air defense and fighters (Sweden in EU, key radar & missile supplier)
  },
  {
    name: "Babcock International",
    ticker: "BAB.L",
    country: "United Kingdom",
    products: "Warships, submarines, defense maintenance services",
    revenue: 5.5,            // USD billions (2023) [oai_citation_attribution:20‡companiesmarketcap.com](https://companiesmarketcap.com/babcock/revenue/#:~:text=According%20to%20Babcock%20International%20Group%27s,49%20Billion%20USD)
    marketCap: 4.0,          // USD billions (approx Mar 2025) [oai_citation_attribution:21‡stockanalysis.com](https://stockanalysis.com/quote/otc/BCKIY/market-cap/#:~:text=Babcock%20International%20Group%20,Ranking) [oai_citation_attribution:22‡reuters.com](https://www.reuters.com/markets/companies/BAB.L/#:~:text=Babcock%20International%20Group%20PLC%20,Reuters)
    euFundFocus: false,      // UK-based naval services (indirect European demand)
  },
  {
    name: "Hensoldt",
    ticker: "HAG.DE",
    country: "Germany",
    products: "Sensors, radars, electronic warfare systems, optronics",
    revenue: 2.0,            // USD billions (2023) [oai_citation_attribution:23‡companiesmarketcap.com](https://companiesmarketcap.com/hensoldt/revenue/#:~:text=Hensoldt%20%28HAG.F%29%20,revenue%20is%20the%20total)
    marketCap: 8.4,          // USD billions (Mar 2025) [oai_citation_attribution:24‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Hensoldt%20logo)
    euFundFocus: true,       // Radar and sensor provider (EU air defense integration) [oai_citation_attribution:25‡reuters.com](https://www.reuters.com/markets/europe/tanks-not-cars-how-pivot-defence-could-help-germanys-economy-2025-03-05/#:~:text=Hensoldt%20%28HAGG,UL%29%20and%20Continental%20%20100)
  },
  {
    name: "Indra Sistemas",
    ticker: "IDR.MC",
    country: "Spain",
    products: "Defense electronics, air traffic management, cybersecurity",
    revenue: 4.7,            // USD billions (2023) [oai_citation_attribution:26‡companiesmarketcap.com](https://companiesmarketcap.com/indra-sistemas/revenue/#:~:text=Indra%20Sistemas%20%28IDR.MC%29%20,revenue%20in%20the%20year)
    marketCap: 4.6,          // USD billions (Mar 2025) [oai_citation_attribution:27‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Indra%20Sistemas%20logo)
    euFundFocus: true,       // Defense IT and electronics (involved in EU joint projects)
  },
  {
    name: "Kongsberg Gruppen",
    ticker: "KOG.OL",
    country: "Norway",
    products: "Missile systems, defense communications, maritime systems",
    revenue: 4.0,            // USD billions (2023, ~NOK 40.6B) [oai_citation_attribution:28‡stockanalysis.com](https://stockanalysis.com/quote/otc/NSKFF/revenue/#:~:text=Kongsberg%20Gruppen%20ASA%20,P%2FS%20Ratio)
    marketCap: 25.7,         // USD billions (Mar 2025) [oai_citation_attribution:29‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20favorite%20icon13)
    euFundFocus: true,       // Advanced missiles (Naval Strike Missile) and defense tech (NATO-aligned)
  },
  {
    name: "Fincantieri",
    ticker: "FCT.MI",
    country: "Italy",
    products: "Naval vessels, submarines, offshore patrol vessels",
    revenue: 7.6,            // EUR billions (2023) [oai_citation_attribution:30‡fincantieri.com](https://www.fincantieri.com/en/investors-relations/financial-data/#:~:text=Financial%20Data%20,%3B%20EBIT.%20euro%2Fmillion.%20162)
    marketCap: 3.2,          // USD billions (Mar 2025) [oai_citation_attribution:31‡tradingeconomics.com](https://tradingeconomics.com/fct:im:market-capitalization#:~:text=Fincantieri%20%7C%20FCT%20,the%20number%20of%20outstanding%20shares)
    euFundFocus: true,       // Naval shipbuilding (EU naval investment and submarine programs)
  },
  {
    name: "OHB SE",
    ticker: "OHB.DE",
    country: "Germany",
    products: "Military satellites, space systems, launch services",
    revenue: 1.13,           // USD billions (2023) [oai_citation_attribution:32‡companiesmarketcap.com](https://companiesmarketcap.com/ohb-se/revenue/#:~:text=The%20company%27s%20current%20revenue%20,revenue%20in%20the%20year)
    marketCap: 1.3,          // USD billions (Mar 2025) [oai_citation_attribution:33‡stockanalysis.com](https://stockanalysis.com/quote/etr/OHB/market-cap/#:~:text=OHB%20SE%20,Enterprise)
    euFundFocus: true,       // Space and surveillance (benefits from EU defense space initiatives)
  },
  {
    name: "Naval Group",
    ticker: "PRIVATE:NAVAL",
    country: "France (state-owned)",
    products: "Warships, submarines, naval combat systems",
    revenue: 4.3,            // EUR billions (2023) [oai_citation_attribution:34‡naval-group.com](https://www.naval-group.com/sites/default/files/2024-04/Rapport%20financier%20Naval%20Group%202023%20EN_light.pdf#:~:text=%5BPDF%5D%20FINANCIAL%20REPORT%202023%20,of%20the%202022%20financial%20year)
    euFundFocus: true,       // Major naval projects (EU fleets, submarine programs)
    description: "French naval defense prime contractor (formerly DCNS) specializing in warship and submarine construction.",
  },
  {
    name: "KNDS (KMW + Nexter)",
    ticker: "PRIVATE:KNDS",
    country: "Germany/France",
    products: "Main battle tanks (Leopard 2, Leclerc), armored vehicles, artillery, ammunition",
    revenue: 3.3,            // EUR billions (2023) [oai_citation_attribution:35‡knds.com](https://www.knds.com/newsroom/press-releases/detail/knds-reports-another-year-of-growth/#:~:text=two%20of%20the%20leading%20European,based%20in%20Germany%20and%20France)
    euFundFocus: true,       // Europe’s consolidated tank/armored vehicle producer (key for EU land defense)
    description: "Joint holding company of Krauss-Maffei Wegmann and Nexter – Europe’s leading manufacturer of land defense systems."
  },
  {
    name: "MBDA",
    ticker: "PRIVATE:MBDA",
    country: "Multinational (UK/FR/IT)",
    products: "Missile systems (air-to-air, anti-ship, SAMs), guided munitions",
    revenue: 4.2,            // EUR billions (est. 2022–23) [oai_citation_attribution:36‡file-rra5rhmwj4agpuaj7f39se](file://file-RRA5rhmwJ4AGpuAJ7f39SE#:~:text=level%3A%201%2C%20sector%3A%20,) [oai_citation_attribution:37‡knds.com](https://www.knds.com/newsroom/press-releases/detail/knds-reports-another-year-of-growth/#:~:text=programme%2C%20unwaveringly%20strong%20ammunition%20sales%2C,KNDS%E2%80%99%20workforce%20grew%20to%208%2C952)
    euFundFocus: true,       // Europe’s primary missile developer (beneficiary of EU ammo/missile funds)
    description: "Joint venture between BAE Systems, Airbus, and Leonardo; Europe’s premier missile manufacturer [oai_citation_attribution:38‡file-rra5rhmwj4agpuaj7f39se](file://file-RRA5rhmwJ4AGpuAJ7f39SE#:~:text=id%3A%20,Systems%2C%20Airbus%2C%20and%20Leonardo%20that)."
  },
  {
    name: "Krauss-Maffei Wegmann",
    ticker: "PRIVATE:KMW",
    country: "Germany",
    products: "Main battle tanks (Leopard 2), armored vehicles (Boxer, Puma IFV)",
    revenue: 1.5,            // EUR billions (approx, part of KNDS)
    euFundFocus: true,       // See KNDS – KMW is part of KNDS (key land systems supplier)
  },
  {
    name: "Nexter Systems",
    ticker: "PRIVATE:NEXTER",
    country: "France",
    products: "Armored vehicles (Leclerc tank), artillery (CAESAR), ammunition",
    revenue: 1.8,            // EUR billions (approx, part of KNDS)
    euFundFocus: true,       // See KNDS – Nexter is part of KNDS (key land systems supplier)
  },
  {
    name: "Nammo AS",
    ticker: "PRIVATE:NAMMO",
    country: "Norway/Finland",
    products: "Ammunition (small to large caliber), rocket motors, explosives",
    revenue: 0.90,           // USD billions (2023, ~NOK 9.2B) [oai_citation_attribution:39‡nammo.com](https://www.nammo.com/about-us/finance/#:~:text=Finance%20,medium%20and%20large%20caliber) [oai_citation_attribution:40‡defence-industry.eu](https://defence-industry.eu/nammo-achieved-strong-performance-in-2023-with-robust-financial-growth/#:~:text=Nammo%20achieved%20strong%20performance%20in,Latest%20news)
    euFundFocus: true,       // Major Nordic ammunition supplier (EU ammo stockpile initiatives)
    description: "Nordic ammunition and rocket motor manufacturer co-owned by Norway and Finland [oai_citation_attribution:41‡defence-industry.eu](https://defence-industry.eu/nammo-revenues-increased-to-record-high-level-in-2022/#:~:text=Nammo%27s%20revenues%20increased%20to%20record,increase%20from%20the%20previous%20year)."
  },
  {
    name: "Patria Oyj",
    ticker: "PRIVATE:PATRIA",
    country: "Finland",
    products: "Armored vehicles (AMV), mortar systems, defense electronics, aircraft MRO",
    revenue: 0.73,           // EUR billions (2023) [oai_citation_attribution:42‡patriagroup.com](https://www.patriagroup.com/about-us/financials/patrias-year-2023#:~:text=Patria%27s%20year%202023%20,People%2C%20end%20of%20period)
    euFundFocus: true,       // Nordic defense supplier (armored vehicles and mortar systems in EU contracts)
    description: "State-owned Finnish defense company (50.1% Finland, 49.9% Kongsberg) known for the AMV 8x8 vehicle."
  },
  {
    name: "RUAG (RUAG AG)",
    ticker: "PRIVATE:RUAG",
    country: "Switzerland",
    products: "Ammunition, space launch components, military MRO services",
    revenue: 0.95,           // CHF billions (2022 RUAG International) [oai_citation_attribution:43‡compositesworld.com](https://www.compositesworld.com/news/ruag-international-reports-positive-business-growth-in-2022#:~:text=2022%20www,4)
    euFundFocus: false,      // Swiss company (ammunition unit sold to Beretta; Switzerland not in EU)
    description: "Swiss technology group (formerly state-owned) spanning defense ammunition and aerospace (now partially divested)."
  },
  {
    name: "Heckler & Koch AG",
    ticker: "MLHK.PA",
    country: "Germany",
    products: "Small arms (rifles, pistols, machine guns)",
    revenue: 0.36,           // EUR billions (2022) [oai_citation_attribution:44‡marketwatch.com](https://www.marketwatch.com/investing/stock/mlhk?countrycode=fr#:~:text=Key%20Data,Float%20N%2FA%3B%20Beta%20N%2FA) [oai_citation_attribution:45‡heckler-koch.com](https://www.heckler-koch.com/en/News/Ad-hoc%20Mitteilungen/2023/H-K%20AG%20Kapitalerh%C3%B6hung#:~:text=H%26K%20AG%20resolves%20on%20capital,convert%20hybrid%20loans%20into%20equity)
    marketCap: 4.1,          // EUR billions (Mar 2025) [oai_citation_attribution:46‡marketwatch.com](https://www.marketwatch.com/investing/stock/mlhk?countrycode=fr#:~:text=H%26K%20AG%20Stock%20Quote%20,Float%20N%2FA%3B%20Beta%20N%2FA)
    euFundFocus: false,      // Small arms manufacturer (increased demand, but not a primary focus of EU fund)
    description: "German small arms manufacturer supplying many NATO armies (listed on Euronext Paris Access)."
  },
  {
    name: "FN Herstal",
    ticker: "PRIVATE:FNHERSTAL",
    country: "Belgium (Walloon Gov’t)",
    products: "Small arms (FN MAG, MINIMI, rifles, pistols)",
    revenue: 0.30,           // EUR billions (approx)
    euFundFocus: false,      // Small arms and light weapons (likely increased orders but not key EU fund focus)
    description: "Belgian state-owned small arms manufacturer known for FN MAG machine guns and SCAR rifles."
  },
  {
    name: "Fabbrica d’Armi Pietro Beretta",
    ticker: "PRIVATE:BERETTA",
    country: "Italy",
    products: "Small arms (pistols, rifles), sights and optics",
    revenue: 0.28,           // EUR billions (approx)
    euFundFocus: false,      // Small arms producer (not a large-scale EU fund target)
    description: "Private Italian small arms manufacturer (Beretta family owned) producing firearms for military and law enforcement."
  },
  {
    name: "Diehl Defence",
    ticker: "PRIVATE:DIEHL",
    country: "Germany",
    products: "Missiles (IRIS-T, SAM systems), medium caliber ammunition, guidance systems",
    revenue: 1.1,            // EUR billions (2023) [oai_citation_attribution:47‡defence-industry.eu](https://defence-industry.eu/record-growth-for-diehl-defence-in-2023-amidst-rising-global-defence-needs/#:~:text=Record%20growth%20for%20Diehl%20Defence,Company) [oai_citation_attribution:48‡defensemagazine.com](https://www.defensemagazine.com/article/german-defence-industry-on-the-rise-armaments-companies-expand-at-home-and-abroad-and-recording-orders-worth-tens-of-billions-of-euros#:~:text=German%20defence%20industry%20on%20the,in%20demand%20is%20the)
    euFundFocus: true,       // Key EU air-defense missile supplier (IRIS-T systems in high demand) [oai_citation_attribution:49‡defence-industry.eu](https://defence-industry.eu/record-growth-for-diehl-defence-in-2023-amidst-rising-global-defence-needs/#:~:text=Record%20growth%20for%20Diehl%20Defence,Company)
    description: "Division of Diehl Stiftung specializing in missiles and air defense (IRIS-T, guided munitions) – saw 41% sales growth in 2023 [oai_citation_attribution:50‡defence-industry.eu](https://defence-industry.eu/record-growth-for-diehl-defence-in-2023-amidst-rising-global-defence-needs/#:~:text=Record%20growth%20for%20Diehl%20Defence,Company)."
  },
  {
    name: "Chemring Group",
    ticker: "CHG.L",
    country: "United Kingdom",
    products: "Countermeasures (flares, chaff), explosives, sensors",
    revenue: 0.44,           // GBP billions (2022) [oai_citation_attribution:51‡file-mtyyk2csqptaw9z57v7zns](file://file-MtyYK2cSqpTaw9z57V7zNs#:~:text=%7B%20name%3A%20,components%2C%20pyrotechnics%20for%20defense%20applications) [oai_citation_attribution:52‡file-mtyyk2csqptaw9z57v7zns](file://file-MtyYK2cSqpTaw9z57V7zNs#:~:text=%7D%2C%20%7B%20name%3A%20,explosives)
    marketCap: 1.0,          // USD billions (approx)
    euFundFocus: false,      // Niche countermeasure supplier (UK-based)
  },
  {
    name: "Maxam",
    ticker: "PRIVATE:MAXAM",
    country: "Spain",
    products: "Explosives, propellants, ammunition components",
    revenue: 0.5,            // USD billions (est.)
    euFundFocus: true,       // Explosives and propellant supplier (could see more orders via EU ammo programs)
    description: "Spanish multinational specializing in civil and military explosives and propellants [oai_citation_attribution:53‡file-mtyyk2csqptaw9z57v7zns](file://file-MtyYK2cSqpTaw9z57V7zNs#:~:text=%7D%2C%20%7B%20name%3A%20,explosives)."
  },
  {
    name: "Avon Protection",
    ticker: "AVON.L",
    country: "United Kingdom",
    products: "Personal protective equipment (military respirators, helmets, armor)",
    revenue: 0.24,           // USD billions (2023) [oai_citation_attribution:54‡companiesmarketcap.com](https://companiesmarketcap.com/avon-protection/revenue/#:~:text=Cap%20companiesmarketcap,revenue%20in%20the%20year%202022)
    marketCap: 0.57,         // USD billions (Mar 2025) [oai_citation_attribution:55‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Avon%20Protection%20logo) [oai_citation_attribution:56‡companiesmarketcap.com](https://companiesmarketcap.com/defense-contractors/largest-companies-by-market-cap/#:~:text=Image%3A%20Avon%20Protection%20logo)
    euFundFocus: false,      // Protective gear (demand increases, but not core of EU fund investment)
    description: "UK-based supplier of military-grade respirators, ballistic helmets, and body armor."
  },
  {
    name: "Soitec",
    ticker: "SOI.PA",
    country: "France",
    products: "Silicon-on-insulator (SOI) wafers for semiconductors",
    revenue: 1.2, // USD billions (2024)
    marketCap: 7.5, // USD billions (March 2025)
    description: "Leading French semiconductor materials company specializing in SOI wafers for RF, power, and advanced computing chips. Supplies materials for radar, defense electronics, and secure communication systems."
  },
  {
    name: "Atos",
    ticker: "ATO.PA",
    country: "France",
    products: "Cybersecurity, defense IT, secure communications, quantum computing",
    revenue: 10.0, // USD billions (2024)
    marketCap: 1.8, // USD billions (March 2025)
    description: "French IT and cybersecurity company specializing in secure communications, quantum computing, and military-grade encryption. Provides secure cloud and AI solutions for European defense agencies, working with the French MoD and NATO."
  },
  {
    name: "SSAB",
    ticker: "SSAB A.ST",
    country: "Sweden",
    products: "High-strength steel, armor steel (Armox®, Ramor®)",
    revenue: 10.5, // USD billions (2024)
    marketCap: 7.2, // USD billions (March 2025)
    description: "Swedish steel manufacturer specializing in high-strength steel and ballistic protection materials for military vehicles, naval ships, and infrastructure. Supplies armor-grade steel to European defense contractors including Rheinmetall, BAE Systems, and KNDS."
  },
  {
    name: "Naval Group",
    ticker: "PRIVATE:NAVAL",
    country: "France",
    products: "Warships, submarines, naval combat systems",
    euFundFocus: true
  },
  {
    name: "KNDS (KMW+Nexter)",
    ticker: "PRIVATE:KNDS",
    country: "Germany/France",
    products: "Main battle tanks, armored vehicles, artillery",
    sector: "Land Systems",
    euFundFocus: true
  },
  {
    name: "MBDA",
    ticker: "PRIVATE:MBDA",
    country: "Multinational (UK/FR/IT)",
    products: "Missile systems, guided weapons",
    sector: "Defense Systems",
    euFundFocus: true,
    description: "Joint venture missile manufacturer (Europe’s primary provider of missiles) [oai_citation_attribution:64‡file-rra5rhmwj4agpuaj7f39se](file://file-RRA5rhmwJ4AGpuAJ7f39SE#:~:text=id%3A%20,Systems%2C%20Airbus%2C%20and%20Leonardo%20that)"
  },
  {
    name: "Eurenco",
    ticker: "PRIVATE:EURENCO",
    country: "France",
    products: "Propellants, explosives, specialty chemicals",
    sector: "Defense Chemicals",
    category: "explosives",
    description: "European leader in energetic materials for defense (explosives & propellants) [oai_citation_attribution:65‡file-rra5rhmwj4agpuaj7f39se](file://file-RRA5rhmwJ4AGpuAJ7f39SE#:~:text=products%3A%20,)",
    euFundFocus: false,
  },
  {
    name: "Diehl Defence",
    ticker: "PRIVATE:DIEHL",
    country: "Germany",
    products: "Missiles (IRIS-T), air-defense systems, ammunition",
    sector: "Defense Systems",
    category: "missiles",
    euFundFocus: true
  },
  {
    name: "Renk AG",
    ticker: "PRIVATE:RENK",
    country: "Germany",
    products: "Transmissions, gearboxes for tanks and heavy vehicles",
    sector: "Mechanical Components",
    category: "mobility",
    description: "Specialist in tank gearboxes (e.g. for Leopard 2 MBTs) – formerly part of VW Group [oai_citation_attribution:66‡reuters.com](https://www.reuters.com/markets/europe/tanks-not-cars-how-pivot-defence-could-help-germanys-economy-2025-03-05/#:~:text=companies%20about%20shifting%20workers%2C%20it,industrial%20synergies)"
  },
  {
    name: "ZF Friedrichshafen",
    ticker: "PRIVATE:ZF", 
    country: "Germany",
    products: "Transmissions, automotive systems, chassis components",
    sector: "Automotive Components",
    description: "Diversified auto supplier exploring defense applications (e.g. offering spare industrial capacity) [oai_citation_attribution:67‡reuters.com](https://www.reuters.com/markets/europe/tanks-not-cars-how-pivot-defence-could-help-germanys-economy-2025-03-05/#:~:text=SYNERGIES)",
    euFundFocus: false,
  },
  // ... (Additional companies can be appended similarly)
];