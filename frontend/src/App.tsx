import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import { ThemeProvider } from './theme/ThemeContext';
import { Layout } from './components/Layout';
import { Inventory } from './pages/Inventory';
import { FilamentForm } from './pages/FilamentForm';
import { FilamentDetail } from './pages/FilamentDetail';
import { ConsumptionForm } from './pages/ConsumptionForm';
import { History } from './pages/History';
import { Templates } from './pages/Templates';
import { TemplateForm } from './pages/TemplateForm';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Inventory />} />
              <Route path="/filaments/new" element={<FilamentForm />} />
              <Route path="/filaments/:id/edit" element={<FilamentForm />} />
              <Route path="/filaments/:id" element={<FilamentDetail />} />
              <Route path="/consumption/new" element={<ConsumptionForm />} />
              <Route path="/consumption/:id/edit" element={<ConsumptionForm />} />
              <Route path="/history" element={<History />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/templates/new" element={<TemplateForm />} />
              <Route path="/templates/:id/edit" element={<TemplateForm />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;

