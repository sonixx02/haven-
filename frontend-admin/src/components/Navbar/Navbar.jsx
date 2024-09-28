import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import React from 'react'
import { Link } from 'react-router-dom'


function Navbar() {
    
    return (
        <header className="shadow  z-50 top-0">
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to="/" className="flex items-center">
                    <div className='py-2'>
        <p className='text-2xl font-semibold mt-1'><span className='text-[#115579]'>Aapka</span>Rakshak</p> 
      </div>
                    </Link>
                    <SignedOut>
                    <div className="flex items-center lg:order-2">
                        <SignInButton className="bg-slate-900 rounded-full px-2 py-1 text-white hover:bg-slate-600 " />
                    </div> 
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                    
                </div>
            </nav>
        </header>  
    )
}

export default Navbar