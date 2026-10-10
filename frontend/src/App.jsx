import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetail from './pages/TicketDetail';
import Profile from './pages/Profile';
import Users from './pages/Users';
import Executors from './pages/Executors';
import Reports from './pages/Reports';
import ProtectedLayout from './components/layout/ProtectedLayout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/tickets" />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/new" element={<CreateTicket />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<Users />} /> 
        <Route path="/executors" element={<Executors />} />
        <Route path="/reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}