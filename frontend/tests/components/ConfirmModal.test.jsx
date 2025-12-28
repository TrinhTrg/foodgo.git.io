/**
 * Test file cho ConfirmModal Component
 * @description Test các chức năng và UI của ConfirmModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../../src/components/ConfirmModal/ConfirmModal';

describe('ConfirmModal Component', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên không render khi isOpen là false', () => {
    const { container } = render(
      <ConfirmModal
        isOpen={false}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('nên render modal với title và message khi isOpen là true', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa?"
      />
    );

    expect(screen.getByText('Xác nhận xóa')).toBeInTheDocument();
    expect(screen.getByText('Bạn có chắc chắn muốn xóa?')).toBeInTheDocument();
  });

  it('nên gọi onConfirm khi click vào nút xác nhận', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    const confirmButton = screen.getByRole('button', { name: /xác nhận|confirm/i });
    fireEvent.click(confirmButton);

    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('nên gọi onCancel khi click vào nút hủy', () => {
    render(
      <ConfirmModal
        isOpen={true}
        onConfirm={mockOnConfirm}
        onCancel={mockOnCancel}
        title="Test Title"
        message="Test Message"
      />
    );

    const cancelButton = screen.getByRole('button', { name: /hủy|cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});

