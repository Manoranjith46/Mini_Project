import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CivicApp from './Pages/Citizen/Civic';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/civic" element={<CivicApp />} />
        <Route path="/" element={<Navigate to="/civic" />} />
      </Routes>
    </Router>
  );
}

export default App;
