import { useEffect, useState } from 'react';

const REDUCE = '(prefers-reduced-motion: reduce)';

/** matchMedia có thể không tồn tại (jsdom cũ) hoặc ném lỗi — đừng để nó hạ cả trang. */
function ask(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return null;
  try {
    return window.matchMedia(query);
  } catch {
    return null;
  }
}

function listen(mql: MediaQueryList, cb: () => void): () => void {
  if (typeof mql.addEventListener === 'function') {
    mql.addEventListener('change', cb);
    return () => mql.removeEventListener('change', cb);
  }
  return () => {};
}

/**
 * Người dùng bảo bớt chuyển động thì Arcade tắt hết phần "arcade": không
 * nghiêng card, không canvas, không đếm số. Nội dung vẫn đủ, chỉ là đứng yên.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => ask(REDUCE)?.matches ?? false);

  useEffect(() => {
    const mql = ask(REDUCE);
    if (!mql) return;
    const sync = () => setReduced(mql.matches);
    sync();
    return listen(mql, sync);
  }, []);

  return reduced;
}

/** true khi màn hình đủ rộng để dựng thêm hiệu ứng nền. */
export function useWideViewport(min = 640): boolean {
  const [wide, setWide] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= min,
  );

  useEffect(() => {
    const sync = () => setWide(window.innerWidth >= min);
    sync();
    window.addEventListener('resize', sync);
    return () => window.removeEventListener('resize', sync);
  }, [min]);

  return wide;
}
