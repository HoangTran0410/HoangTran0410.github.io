import type { ReactNode } from 'react';
import { I18nProvider } from './hooks/useI18n';
import { ThemeProvider } from './hooks/useTheme';
import { CatalogProvider } from './hooks/useCatalog';
import { ProjectDetailProvider } from './hooks/useProjectDetail';

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

export default function App() {
  return <AppProviders>{null}</AppProviders>;
}
