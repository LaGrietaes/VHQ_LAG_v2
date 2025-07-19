
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CEO from './pages/CEO';
import Ghost from './pages/Ghost';
import Vitra from './pages/Vitra';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/ceo" element={<Layout><CEO /></Layout>} />
      <Route path="/ghost" element={<Layout><Ghost /></Layout>} />
      <Route path="/vitra" element={<Layout><Vitra /></Layout>} />
      <Route path="/settings" element={<Layout><Settings /></Layout>} />
    </Routes>
  );
} 