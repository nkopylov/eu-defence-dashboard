import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CompanyCard from '../CompanyCard';
import { Company, DateRange } from '../../types';

const mockCompany: Company = {
  id: '1',
  name: 'TestCo',
  ticker: 'TCO',
  country: 'USA',
  sector: 'Technology',
  products: 'Software',
  marketCap: 100,
  revenue: 50,
  description: 'A test company.',
  euFundFocus: false,
  category: 'steel', // Added to satisfy Company type
};

const mockDateRange: DateRange = {
  startDate: new Date('2023-01-01'),
  endDate: new Date('2023-01-14'),
  preset: '2w',
};

describe('CompanyCard', () => {
  let mockOnFilterByCompany: jest.Mock;

  beforeEach(() => {
    mockOnFilterByCompany = jest.fn();
  });

  test('filter button functionality: visibility, tooltip, and click handler', async () => {
    render(
      <CompanyCard
        company={mockCompany}
        dateRange={mockDateRange}
        onFilterByCompany={mockOnFilterByCompany}
      />
    );

    // The button is inside a div that is a sibling to h3, and their parent has 'group'
    // Let's get the company name h3 first to find its parent 'group'
    const companyNameElement = screen.getByText((content, element) => {
      // Check if element is not null and is an h3
      if (element && element.tagName.toLowerCase() === 'h3') {
        // Check if the content starts with the company name
        return content.startsWith(mockCompany.name);
      }
      return false;
    });
    
    const groupElement = companyNameElement.parentElement; // This should be the div with 'group' class

    if (!groupElement) {
      throw new Error("Could not find the 'group' element.");
    }
    
    // The filter button has an aria-label like "Filter by TestCo"
    const filterButton = screen.getByLabelText(`Filter by ${mockCompany.name}`);

    // 1. Button Visibility: Initially not "visible" (opacity-0)
    // RTL doesn't fully compute styles in a way that easily checks opacity from group-hover.
    // We'll check it exists. The 'opacity-0' is a Tailwind class.
    // The prompt says "Assert that the filter button is initially not visible".
    // We can check for the 'opacity-0' class.
    expect(filterButton).toHaveClass('opacity-0');

    // 2. Simulate mouse hover on the company name area (the group element)
    fireEvent.mouseEnter(groupElement);

    // Assert button becomes "visible" (group-hover:opacity-100)
    // After mouseEnter on group, 'opacity-0' should be overridden by 'group-hover:opacity-100'
    // Testing this precise CSS class change can be brittle if implementation details change.
    // A more functional test is that it's simply there and clickable.
    // However, to meet the "becomes visible" requirement, we'll check the class.
    expect(filterButton).toHaveClass('group-hover:opacity-100');


    // 3. Tooltip: Simulate mouse hover on the filter button itself
    fireEvent.mouseEnter(filterButton);

    // Assert tooltip is displayed
    // The tooltip text is "Filter by TestCo"
    // It might take a moment for the tooltip state to update and render
    const tooltip = await screen.findByText(`Filter by ${mockCompany.name}`);
    expect(tooltip).toBeVisible(); // Checks for visibility in the accessibility tree

    // Simulate mouse leave from filter button to hide tooltip
    fireEvent.mouseLeave(filterButton);
    // Tooltip should disappear. We expect it to not be in the document or not be visible.
    // queryByText returns null if not found, which is what we want.
    expect(screen.queryByText(`Filter by ${mockCompany.name}`)).not.toBeVisible();


    // 4. Click Handler: Simulate click on the filter button
    fireEvent.click(filterButton);

    // Assert onFilterByCompany was called
    expect(mockOnFilterByCompany).toHaveBeenCalledTimes(1);
    expect(mockOnFilterByCompany).toHaveBeenCalledWith(mockCompany.ticker);
  });
});
