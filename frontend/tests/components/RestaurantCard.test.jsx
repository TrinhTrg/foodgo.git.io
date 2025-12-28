/**
 * Test file cho RestaurantCard Component
 * @description Test các chức năng và UI của RestaurantCard
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RestaurantCard from '../../src/components/RestaurantCard/RestaurantCard';

describe('RestaurantCard Component', () => {
  const mockRestaurant = {
    id: 1,
    name: 'Test Restaurant',
    address: '123 Test Street',
    rating: 4.5,
    total_reviews: 100,
    image: 'test-image.jpg'
  };

  const mockOnClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên render thông tin restaurant đúng cách', () => {
    render(
      <BrowserRouter>
        <RestaurantCard restaurant={mockRestaurant} onClick={mockOnClick} />
      </BrowserRouter>
    );

    expect(screen.getByText(mockRestaurant.name)).toBeInTheDocument();
    expect(screen.getByText(mockRestaurant.address)).toBeInTheDocument();
  });

  it('nên hiển thị rating đúng cách', () => {
    render(
      <BrowserRouter>
        <RestaurantCard restaurant={mockRestaurant} onClick={mockOnClick} />
      </BrowserRouter>
    );

    expect(screen.getByText(mockRestaurant.rating.toString())).toBeInTheDocument();
  });

  it('nên gọi onClick khi click vào card', () => {
    render(
      <BrowserRouter>
        <RestaurantCard restaurant={mockRestaurant} onClick={mockOnClick} />
      </BrowserRouter>
    );

    const card = screen.getByText(mockRestaurant.name).closest('div');
    fireEvent.click(card);

    expect(mockOnClick).toHaveBeenCalledWith(mockRestaurant.id);
  });
});

