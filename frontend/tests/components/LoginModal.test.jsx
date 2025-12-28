/**
 * Test file cho LoginModal Component
 * @description Test các chức năng và UI của LoginModal
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginModal from '../../src/components/LoginModal/LoginModal';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginModal Component', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('nên không render khi isOpen là false', () => {
    const { container } = render(
      <BrowserRouter>
        <LoginModal isOpen={false} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(container.firstChild).toBeNull();
  });

  it('nên render modal khi isOpen là true', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    expect(screen.getByText('Đăng nhập hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Bạn vui lòng đăng nhập để thực hiện chức năng này.')).toBeInTheDocument();
  });

  it('nên gọi onClose khi click vào overlay', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const overlay = screen.getByText('Đăng nhập hệ thống').closest('div').parentElement;
    fireEvent.click(overlay);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('nên gọi onClose khi click vào nút đóng', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('nên navigate đến trang đăng nhập khi click nút "Đăng nhập"', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const loginButton = screen.getByRole('button', { name: /đăng nhập/i });
    fireEvent.click(loginButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/dang-nhap');
  });

  it('nên gọi onClose khi click vào nút "Huỷ"', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /huỷ/i });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('nên không đóng modal khi click vào nội dung modal', () => {
    render(
      <BrowserRouter>
        <LoginModal isOpen={true} onClose={mockOnClose} />
      </BrowserRouter>
    );

    const modalContent = screen.getByText('Đăng nhập hệ thống').closest('div');
    fireEvent.click(modalContent);

    // onClose không được gọi vì đã stopPropagation
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});

