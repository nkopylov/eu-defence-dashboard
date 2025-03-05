import { NextRequest, NextResponse } from 'next/server';
import { 
  getDefenceCompanies, 
  getPotentialDefenceCompanies, 
  getMaterialCompanies,
  searchCompanies
} from '@/app/lib/companies-repository';

/**
 * GET /api/companies
 * Get companies with optional filtering
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type'); // 'defense', 'potential', or 'materials'
  const query = searchParams.get('query'); // Search query
  
  try {
    // If search query is provided, search across all company types
    if (query) {
      const companies = await searchCompanies(query);
      return NextResponse.json({ success: true, companies });
    }
    
    // Otherwise, filter by company type
    if (type === 'defense') {
      const companies = await getDefenceCompanies();
      return NextResponse.json({ success: true, companies });
    }
    
    if (type === 'potential') {
      const companies = await getPotentialDefenceCompanies();
      return NextResponse.json({ success: true, companies });
    }
    
    if (type === 'materials') {
      const companies = await getMaterialCompanies();
      return NextResponse.json({ success: true, companies });
    }
    
    // If no type specified, return all companies from all types
    const [defenseCompanies, potentialCompanies, materialCompanies] = await Promise.all([
      getDefenceCompanies(),
      getPotentialDefenceCompanies(),
      getMaterialCompanies()
    ]);
    
    return NextResponse.json({ 
      success: true, 
      defense: defenseCompanies,
      potential: potentialCompanies,
      materials: materialCompanies
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch companies', details: (error as Error).message },
      { status: 500 }
    );
  }
}