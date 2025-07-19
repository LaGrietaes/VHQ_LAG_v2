
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CEO from './pages/CEO';
import Ghost from './pages/Ghost';
import Vitra from './pages/Vitra';
import Settings from './pages/Settings';
import Agents from './pages/Agents';
import Files from './pages/Files';
import Workflows from './pages/Workflows';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/ceo" element={<CEO />} />
        <Route path="/ghost" element={<Ghost />} />
        <Route path="/vitra" element={<Vitra />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/files" element={<Files />} />
        <Route path="/workflows" element={<Workflows />} />
      </Routes>
    </Layout>
  );
} 