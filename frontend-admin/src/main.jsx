import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Layout from './Layout.jsx';
import { Dashboard } from './components/Dashboard/Dashboard.jsx';
import './index.css';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router-dom';
import Hero from './components/Hero.jsx';
import Home from './components/Dashboard/Home.jsx';
import IncidentReports from './components/Dashboard/IncidentReports.jsx';
import Table2 from './components/Dashboard/Table2.jsx';
import IncidentReport from './components/Dashboard/IncidentReport.jsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key');
}

// Define routes using Clerk's SignedIn and SignedOut for authenticated routing
const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<Layout />}>
        <Route index element={<Hero />} />
        
        <Route path="dashboard" element={
          <SignedIn>
            <Dashboard />
          </SignedIn>
        }>
          <Route index element={<Home />} />
          <Route path="incident-reports" element={<IncidentReports />} />
          <Route path="user-incidents" element={<IncidentReport />} />
        </Route>

        <Route path="sign-in" element={
          <SignedOut>
            <SignInButton />
          </SignedOut>
        } />
      </Route>
    </>
  )
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
