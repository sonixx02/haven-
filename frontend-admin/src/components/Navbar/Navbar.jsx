import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import React from 'react'
import { Link } from 'react-router-dom'


function Navbar() {
    
    return (
        <header className="shadow  z-50 top-0">
            <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5">
                <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
                    <Link to="/" className="flex items-center">
                        <img
                            src="/logo3.png"
                            className="mr-3 h-12"
                            alt="Logo"
                        />
                    </Link>
                    <SignedOut>
                    <div className="flex items-center lg:order-2">
                        <SignInButton className="bg-slate-800" />
                    </div> 
                    </SignedOut>
                    
                    
                </div>
            </nav>
        </header>  
    )
}

export default Navbar