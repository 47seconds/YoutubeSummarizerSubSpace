import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { NhostProvider } from '@nhost/react';
import { nhost } from './lib/nhost';
import { LoginForm } from './components/LoginForm';
import { RegisterForm } from './components/RegisterForm';
import { VideoSummary } from './components/VideoSummary';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <VideoSummary />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </NhostProvider>
  );
}

export default App;