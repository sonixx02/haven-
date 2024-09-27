import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../shared/Navbar';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { auth } from "../../../firebase";

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
  { value: 'others', label: 'Others' },
];

const ComplaintForm = () => {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    anonymous: false,
    image: null,
    location: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchUserData = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/users/${uid}`);
      setUserDetails(response.data);
      console.log(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchUserData(user.uid);
      } else {
        console.log("No user logged in");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
          showToast("Unable to get your location. Please ensure location services are enabled.", "error");
        }
      );
    } else {
      showToast("Your browser doesn't support geolocation.", "error");
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      image: e.target.files[0]
    }));
  };

  const handleSelect = (value) => {
    setFormData(prev => ({
      ...prev,
      category: value
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    for (const key in formData) {
      if (key === 'location') {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    }

    if (userDetails && userDetails.email) {
      data.append('userEmail', userDetails.email);
    }

    try {
      const response = await axios.post('http://localhost:3001/api/complaints', data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(response.data);
      showToast("Your complaint has been successfully registered.", "success");
      setFormData({
        category: '',
        description: '',
        anonymous: false,
        image: null,
        location: formData.location, // Preserve location
      });
    } catch (err) {
      console.error('Error submitting complaint:', err.response ? err.response.data : err.message);
      showToast("There was an error submitting your complaint. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className='flex items-center justify-center max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8'>
        <form onSubmit={submitHandler} className='w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md'>
          <h1 className='font-bold text-2xl text-center text-gray-900'>Register a Complaint</h1>
          
          <div>
            <Label htmlFor="category" className='block text-sm font-medium text-gray-700'>Select the Category:</Label>
            <Select onValueChange={handleSelect} value={formData.category}>
              <SelectTrigger className="w-full mt-1">
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

          <div>
            <Label htmlFor="description" className='block text-sm font-medium text-gray-700'>Description:</Label>
            <Input 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm'
              placeholder="Provide details about the incident"
            />
          </div>

          <div>
            <Label htmlFor="image" className='block text-sm font-medium text-gray-700'>Upload an Image:</Label>
            <Input 
              id="image"
              type="file"
              name="image"
              onChange={handleFileChange}
              className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm'
              accept="image/*"
            />
          </div>

          <div className="flex items-center">
            <RadioGroup className='flex items-center space-x-2'>
              <div className='flex items-center'>
                <RadioGroupItem
                  id="anonymous"
                  name="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, anonymous: checked }))}
                />
                <Label htmlFor="anonymous" className='ml-2 block text-sm text-gray-900'>Post this complaint anonymously?</Label>
              </div>
            </RadioGroup>
          </div>

          <Button 
            className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </form>
      </div>
      {toast && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-md ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default ComplaintForm;