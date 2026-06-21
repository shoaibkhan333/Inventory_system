import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Suppliers from './pages/Suppliers';
import Movements from './pages/Movements';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <InventoryProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="movements" element={<Movements />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </InventoryProvider>
      </BrowserRouter>
    </ToastProvider>
  );
}
