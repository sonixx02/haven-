import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Layout from './Layout.jsx'
import { Dashboard } from './components/Dashboard/Dashboard.jsx'
import './index.css'
import {ClerkProvider} from '@clerk/clerk-react'
import { createBrowserRouter, createRoutesFromElements,Route, RouterProvider } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Hero from './components/Hero.jsx'
import Home from './components/Dashboard/Home.jsx'
import IncidentReports from './components/Dashboard/IncidentReports.jsx'
import Table2 from './components/Dashboard/Table2.jsx'


const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route index element={<SignedOut> <Hero /> </SignedOut>} />
      <Route path='dashboard' element={<SignedIn> <Dashboard /> </SignedIn>}>
        <Route path='' element={<Home />}/>
        <Route path='all-stories' element={<IncidentReports />}/>
        <Route path='story/:id' element={<Table2 />}/>
      </Route>
    </Route>
    
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey= {PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>,
)
