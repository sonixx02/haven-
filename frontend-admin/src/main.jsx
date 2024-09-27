import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ClerkProvider} from '@clerk/clerk-react'
import { createBrowserRouter, createRoutesFromElements,Route } from 'react-router-dom'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Publishable Key')
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='/' element={<Layout />}>
      <Route index element={<PublicRoutes> <Home /> </PublicRoutes>} />
      <Route path='dashboard' element={<ProtectedRoutes> <Dashboard /> </ProtectedRoutes>}>
        <Route path='' element={<CreateStory />}/>
        <Route path='all-stories' element={<AllStories />}/>
        <Route path='story/:id' element={<Story />}/>
        <Route path='my-stories' element={<MyStories />}/>
      </Route>
      <Route path='/login' element = {<PublicRoutes> <Login /> </PublicRoutes>} />
      <Route path='/signup' element = {<PublicRoutes> <SignUp /> </PublicRoutes>} />
    </Route>
    
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider publishableKey= {PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <App />
    </ClerkProvider>
  </StrictMode>,
)
