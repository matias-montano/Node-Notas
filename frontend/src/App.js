import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Hello from './components/Hello';

function App() {
  return (
    <>
      <Routes>
        <Route path="*" element={<Hello />} />
      </Routes>
    </>
  );
}

export default App;