/**
 * Application Entry Point for Expo.
 */
import React from 'react';
import { MainApp } from './src/App';
import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}
