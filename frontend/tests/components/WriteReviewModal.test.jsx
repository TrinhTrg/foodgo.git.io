/**
 * Test file cho WriteReviewModal Component
 * @description Test các chức năng và UI của WriteReviewModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import WriteReviewModal from '../../src/components/WriteReviewModal/WriteReviewModal';

describe('WriteReviewModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();
  const mockRestaurant = {
    id: 1,
    name: 'Test Restaurant'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên không render khi isOpen là false', () => {
    const { container } = render(
      <WriteReviewModal
        isOpen={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        restaurant={mockRestaurant}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('nên render form đánh giá khi isOpen là true', () => {
    render(
      <WriteReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        restaurant={mockRestaurant}
      />
    );

    // Kiểm tra các trường input có hiển thị
    expect(screen.getByLabelText(/rating/i) || screen.getByText(/đánh giá/i)).toBeInTheDocument();
  });

  it('nên validate form trước khi submit', async () => {
    render(
      <WriteReviewModal
        isOpen={true}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
        restaurant={mockRestaurant}
      />
    );

    const submitButton = screen.getByRole('button', { name: /submit|gửi/i });
    fireEvent.click(submitButton);

    // Kiểm tra validation error messages
    await waitFor(() => {
      expect(screen.getByText(/required|bắt buộc/i)).toBeInTheDocument();
    });
  });
});

