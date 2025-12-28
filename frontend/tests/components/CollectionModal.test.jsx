/**
 * Test file cho CollectionModal Component
 * @description Test các chức năng và UI của CollectionModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollectionModal from '../../src/components/CollectionModal/CollectionModal';

describe('CollectionModal Component', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên không render khi isOpen là false', () => {
    const { container } = render(
      <CollectionModal
        isOpen={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('nên render modal khi isOpen là true', () => {
    render(
      <CollectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    // Kiểm tra các element cơ bản của modal
    expect(screen.getByRole('dialog') || screen.getByText(/collection/i)).toBeInTheDocument();
  });

  it('nên gọi onClose khi click vào nút đóng', () => {
    render(
      <CollectionModal
        isOpen={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
      />
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

