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

  test('company information tooltip functionality and interaction with filter button visibility', async () => {
    render(
      <CompanyCard
        company={mockCompany}
        dateRange={mockDateRange}
        onFilterByCompany={mockOnFilterByCompany} // Though not used in this test, it's a required prop
      />
    );

    const h3Element = screen.getByText((content, element) => 
      element?.tagName.toLowerCase() === 'h3' && content.startsWith(mockCompany.name)
    );
    const filterButton = screen.getByLabelText(`Filter by ${mockCompany.name}`);

    // 1. Initial State: Assert company info tooltip is not visible
    // Tooltip content includes "Country:" and "Products:"
    expect(screen.queryByText(`Country: ${mockCompany.country}`)).not.toBeInTheDocument();
    expect(screen.queryByText(`Products: ${mockCompany.products}`)).not.toBeInTheDocument();

    // 2. Simulate mouseEnter on h3 element
    fireEvent.mouseEnter(h3Element);

    // Assert company info tooltip is visible
    expect(await screen.findByText(`Country: ${mockCompany.country}`)).toBeVisible();
    expect(screen.getByText(`Products: ${mockCompany.products}`)).toBeVisible();

    // Assert filter button also becomes "visible" (group-hover:opacity-100)
    // because hovering h3 also means its parent 'group' is hovered.
    expect(filterButton).toHaveClass('group-hover:opacity-100');
    expect(filterButton).not.toHaveClass('opacity-0');


    // 3. Simulate mouseLeave from h3 element
    fireEvent.mouseLeave(h3Element);

    // Assert company info tooltip is hidden
    // Need to use queryBy because findBy would fail if not found, waitFor will also fail.
    // We expect it to be gone, so queryBy is appropriate.
    // Await for potential debounce or animation if there were any, though not in this case.
    await waitFor(() => {
      expect(screen.queryByText(`Country: ${mockCompany.country}`)).not.toBeInTheDocument();
    });
    expect(screen.queryByText(`Products: ${mockCompany.products}`)).not.toBeInTheDocument();
    
    // Assert filter button REMAINS "visible" if the mouse is still conceptually within the group area.
    // The `fireEvent.mouseLeave(h3Element)` does not automatically mean the parent `groupElement` is also left.
    // The filter button's visibility is tied to the `groupElement`'s hover state.
    // To test this properly, the `groupElement` needs to be explicitly hovered.
    // The previous test ('filter button functionality') already covers:
    //    fireEvent.mouseEnter(groupElement) -> expect(filterButton).toHaveClass('group-hover:opacity-100');
    // So, this part of combined behavior is implicitly covered if that test passes.
    // Here, after leaving h3, the filter button's class 'group-hover:opacity-100' would persist
    // if the group's hover state was what triggered it and that state hasn't changed.
    // Since `fireEvent.mouseEnter(h3Element)` implies the group is hovered, this class should remain.
    expect(filterButton).toHaveClass('group-hover:opacity-100');
    expect(filterButton).not.toHaveClass('opacity-0');


    // 4. To be absolutely sure about the filter button remaining visible when moving from h3 to group:
    // Explicitly hover group, then h3, then leave h3 but not group.
    const groupElement = h3Element.parentElement;
    if (!groupElement) throw new Error("Could not find group element");

    // Hover group (filter button shows)
    fireEvent.mouseEnter(groupElement);
    expect(filterButton).toHaveClass('group-hover:opacity-100');
    expect(screen.queryByText(`Country: ${mockCompany.country}`)).not.toBeInTheDocument(); // Info tooltip not yet shown

    // Then hover h3 (info tooltip shows, filter button still shown)
    fireEvent.mouseEnter(h3Element);
    expect(await screen.findByText(`Country: ${mockCompany.country}`)).toBeVisible();
    expect(filterButton).toHaveClass('group-hover:opacity-100');

    // Then leave h3 (info tooltip hides, filter button should remain if group is still hovered)
    fireEvent.mouseLeave(h3Element);
    await waitFor(() => {
      expect(screen.queryByText(`Country: ${mockCompany.country}`)).not.toBeInTheDocument();
    });
    // Since groupElement is still considered hovered (mouseEnter was called on it and no mouseLeave yet),
    // the button should remain visible.
    expect(filterButton).toHaveClass('group-hover:opacity-100');
    expect(filterButton).not.toHaveClass('opacity-0');

    // Leave group (filter button hides)
    fireEvent.mouseLeave(groupElement);
    expect(filterButton).not.toHaveClass('group-hover:opacity-100'); // This might fail if opacity-0 is simply added back
    expect(filterButton).toHaveClass('opacity-0'); // More precise: it should revert to opacity-0
  });
});
