import React from 'react'
import Navbar from './components/Navbar/Navbar'
import { Outlet } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"

function Layout() {
    return (
        <>
        <Navbar />
        <Outlet />
        <Toaster />
        </>
    )
}

export default Layout