import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './login/login';
import Slide from './Base/slide.jsx';
import PrivateRoute from "./componentes/PrivateRoute.jsx";
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/menu" element={<PrivateRoute> <Slide /> </PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
