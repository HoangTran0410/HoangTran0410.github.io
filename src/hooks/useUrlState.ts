import { useCallback, useSyncExternalStore } from 'react';

/**
 * Đọc/ghi một query param, dùng chung cho mọi hook cần chia sẻ trạng thái
 * lên URL. Ghi bằng replaceState để không nhồi lịch sử trình duyệt, trừ
 * trường hợp gọi với push = true (dùng cho việc mở chi tiết dự án, nơi nút
 * Back nên đóng chi tiết lại).
 */
const EVENT = 'urlstatechange';
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener('popstate', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('popstate', cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function readParam(key: string): string | null {
  return new URLSearchParams(window.location.search).get(key);
}

export function writeParam(key: string, value: string | null, push = false): void {
  const params = new URLSearchParams(window.location.search);
  if (value === null || value === '') params.delete(key);
  else params.set(key, value);
  const qs = params.toString();
  const url = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
  if (push) window.history.pushState({}, '', url);
  else window.history.replaceState({}, '', url);
  window.dispatchEvent(new Event(EVENT));
  emit();
}

export function useUrlParam(key: string): [string | null, (v: string | null, push?: boolean) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => readParam(key),
    () => null,
  );
  const set = useCallback(
    (v: string | null, push = false) => writeParam(key, v, push),
    [key],
  );
  return [value, set];
}
