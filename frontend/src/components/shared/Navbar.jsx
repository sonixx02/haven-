import React from 'react';
import { Link,useNavigate} from 'react-router-dom';
import { Button } from '../ui/button';
import { User2,LogOut } from 'lucide-react';
import { AlignJustify } from 'lucide-react';
import Menu from './Menu';

const Navbar = () => {
    const user = false;
  const navigate = useNavigate()
  let [menu,setMenu] = React.useState(false);
  let toggle=()=>{
    setMenu(!menu)
  }
  const handleLogin=()=>{
    navigate('/login')
  }
  const handleSignup=()=>{
    navigate('/signup')
  }
  const handleHome=()=>{
    navigate('/')
  }
  const handleDash=()=>{
    navigate('/dashboard')
  }
  const handleComplaint=()=>{
    navigate('/complain')
  }
  const handleDatabase=()=>{
    navigate('/database')
  }
  const handleComm=()=>{
    navigate('/incidents')
  }
  const handleroutes=()=>{
    navigate('/routemaps')
  }
  return (
    <div className='bg-[#E6E6E6] shadow-black'>
    <div className='flex justify-between w-11/12 mx-auto'>
      <div className='py-2'>
        <p className='text-2xl font-semibold mt-1'><span className='text-[#115579]'>Aapka</span>Rakshak</p> 
      </div>
      <div className='flex'>
        <ul className='flex py-4 mx-4'>
          <li className='px-4 text-l font-semibold  hover:underline hidden md:block' onClick={handleDash}>Dashboard</li>
          <li className='px-4 text-l font-semibold  hover:underline hidden md:block' onClick={handleComplaint}>Post a Complaint</li>
          <li className='px-4 text-l font-semibold  hover:underline hidden md:block' onClick={handleComm}>Community Forum</li>
          <li className='px-4 text-l font-semibold  hover:underline hidden md:block' onClick={handleroutes}>Routes</li>
          <li className='px-4 text-l font-semibold  hover:underline hidden md:block' onClick={handleDatabase} >Database</li>
        </ul>
        {!user ? 
        <div className='my-3 gap-4 hidden md:block '>
          <Button className='mx-4 bg-[#115579]' onClick={handleLogin}>Sign in</Button>
        </div>
      :
      <div className='my-3 gap-4 hidden md:block '>
          <Button className='mx-4 bg-[#115579]' onClick={handleLogin}>LogOut</Button>
        </div>
        }
         <AlignJustify className='md:hidden m-4' onClick={toggle}/>
      </div>
    </div>
    {menu?<Menu/>:<></>}
    
    </div>
  );
}

export default Navbar;