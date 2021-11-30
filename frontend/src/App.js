import { SnackbarProvider } from 'notistack';
// utils
import { ProvideUtils } from './utils/utils';
// routes
import Router from './routes';
// theme
import ThemeConfig from './theme';
import GlobalStyles from './theme/globalStyles';
// components
import ScrollToTop from './components/ScrollToTop';
import { BaseOptionChartStyle } from './components/charts/BaseOptionChart';

// ----------------------------------------------------------------------

export default function App() {
  return (
    <SnackbarProvider maxSnack={3}>
      <ProvideUtils>
        <ThemeConfig>
          <ScrollToTop />
          <GlobalStyles />
          <BaseOptionChartStyle />
          <Router />
        </ThemeConfig>
      </ProvideUtils>
    </SnackbarProvider>
  );
}
