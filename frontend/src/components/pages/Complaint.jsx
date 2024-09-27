import React from 'react';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Link ,useNavigate} from 'react-router-dom';
import { description } from '../shared/Chart';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


const categories = [
    { value: 'theft', label: 'Theft' },
    { value: 'burglary', label: 'Burglary' },
    { value: 'assault', label: 'Assault' },
    { value: 'fraud', label: 'Fraud' },
    { value: 'vandalism', label: 'Vandalism' },
    { value: 'drug_offense', label: 'Drug Offense' },
    { value: 'homicide', label: 'Homicide' },
    { value: 'domestic_violence', label: 'Domestic Violence' },
    { value: 'missing_person', label: 'Missing Person' },
    { value: 'traffic_violation', label: 'Traffic Violation' },
    { value: 'public_disturbance', label: 'Public Disturbance' },
    { value: 'sexual_assault', label: 'Sexual Assault' },
    { value: 'others', label: 'others' },
  ];
const LogIn = () => { 
const submitHandler=async(e)=>{
   e.preventDefault()
  try{

  }
  catch(err){
     console.log(err)
  }finally{
   
  }
}
const [selectedCategory,setSelectedCategor] = React.useState('')
const handleSelect=()=>{

}
  return (
    <div>
      <Navbar/>
      <div className='flex items-center justify-center max-w-7xl mx-auto'>
        <form onSubmit={submitHandler} className='w-3/4 md:w-1/2 border-gray-300 rounded p-4 my-10 shadow-md '>
        <h1 className='font-bold text-xl mb-5'>Register a complaint</h1>
        <div className='p-2 '>
            <Label className='text-lg'>Upload an Image:</Label>
            <Input 
            type="file"
            name="file"
            className='text-lg button:bg-[#115579]'
            />
         </div>
         <div className='p-2'>
         <Label className='text-lg'>Select the Category:</Label>
         <Select onValueChange={handleSelect} defaultValue={selectedCategory}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.value} value={category.value}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
         </div>
         <div className='p-2 '>
            <Label className='text-lg'>Description:</Label>
            <Input 
            name="description"
            className='text-lg '
            />
         </div>
        <RadioGroup className='flex m-2 py-2'>
         <div className='flex items-center space-x-2'>
            <input type="radio" name='anonymous'/>
            <Label className='text-lg'>Post this complaint anonymously?</Label>
         </div>
         </RadioGroup>
         <Button className='w-full bg-[#115579]'>Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default LogIn;