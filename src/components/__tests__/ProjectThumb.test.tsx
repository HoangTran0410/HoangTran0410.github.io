import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProjectThumb } from '../ProjectThumb';
import { getProjects } from '../../lib/merge';

const bySlug = (s: string) => getProjects().find((p) => p.slug === s)!;

describe('ProjectThumb', () => {
  it('dùng ảnh thật khi project khai báo shot', () => {
    render(<ProjectThumb project={{ ...bySlug('moba2d'), shot: '/shots/moba2d.webp' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/shots/moba2d.webp');
  });

  it('ảnh có kích thước cố định và lazy để không nhảy layout', () => {
    render(<ProjectThumb project={{ ...bySlug('moba2d'), shot: '/shots/moba2d.webp' }} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('width');
    expect(img).toHaveAttribute('height');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  it('không có ảnh thì vẽ gradient thay vì để trống', () => {
    const { container } = render(<ProjectThumb project={{ ...bySlug('reversi-mcts'), shot: undefined }} />);
    expect(container.querySelector('[data-fallback="gradient"]')).toBeTruthy();
  });

  it('gradient fallback vẫn có nhãn cho trình đọc màn hình', () => {
    const p = { ...bySlug('reversi-mcts'), shot: undefined };
    render(<ProjectThumb project={p} />);
    expect(screen.getByLabelText(new RegExp(p.title, 'i'))).toBeTruthy();
  });

  it('không đi tìm ảnh của dự án chưa được chụp', () => {
    const { container } = render(<ProjectThumb project={{ ...bySlug('cipher-breaker'), shot: undefined }} />);
    expect(container.querySelector('img')).toBeNull();
  });
});
