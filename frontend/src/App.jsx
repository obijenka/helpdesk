import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import ProtectedLayout from './components/layout/ProtectedLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/tickets" />} />
        <Route path="/tickets" element={<Tickets />} />
      </Route>
    </Routes>
  );
}