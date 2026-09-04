import { Suspense, lazy, useMemo } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { I18nProvider } from './hooks/useI18n';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { CatalogProvider } from './hooks/useCatalog';
import { ProjectDetailProvider } from './hooks/useProjectDetail';
import { THEME_LOADERS } from './themes/registry';
import type { ThemeId } from './themes/contract';

/**
 * Thứ tự lồng nhau ở đây là một quyết định thiết kế, không phải ngẫu nhiên:
 * ThemeProvider nằm NGOÀI CatalogProvider, nên đổi theme không remount tầng
 * catalog và mọi trạng thái lọc/tìm/mở chi tiết được giữ nguyên.
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ThemeProvider>
        <CatalogProvider>
          <ProjectDetailProvider>{children}</ProjectDetailProvider>
        </CatalogProvider>
      </ThemeProvider>
    </I18nProvider>
  );
}

/** Mỗi theme là một chunk riêng; chỉ theme đang bật mới được tải về. */
const SHELLS = {} as Record<ThemeId, ComponentType>;
for (const id of Object.keys(THEME_LOADERS) as ThemeId[]) {
  SHELLS[id] = lazy(() => THEME_LOADERS[id]().then((m) => ({ default: m.default.Shell })));
}

function ThemeSkeleton() {
  return (
    <div className="flex min-h-dvh items-center justify-center" aria-busy="true">
      <span className="sr-only">Loading</span>
      <span
        aria-hidden
        className="size-6 animate-pulse rounded-full"
        style={{ background: 'var(--accent)' }}
      />
    </div>
  );
}

function ThemeStage() {
  const { themeId } = useTheme();
  const Shell = useMemo(() => SHELLS[themeId], [themeId]);
  return (
    <Suspense fallback={<ThemeSkeleton />}>
      <Shell />
    </Suspense>
  );
}

export default function App() {
  return (
    <AppProviders>
      <ThemeStage />
    </AppProviders>
  );
}
