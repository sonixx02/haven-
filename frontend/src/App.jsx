import React, { useEffect } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import './index.css'; // Adjust the path if necessary
import Dashboard from "./components/pages/Dashboard";
import Complaint from "./components/pages/Complaint";
import Community from "./components/pages/community";
import IncidentReports from "./IncidentReports";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login";
import SignUp from "./components/register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile";
import { useState } from "react";
import { auth } from "../firebase";
import LandingPage from "./components/Landingpage";
import HereMaps from "./components/pages/HereMaps";
import Table1 from "./components/Tables/Table";
import Home from "./components/pages/Home";



function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/dashboard" /> : <Navigate to = '/home' />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/home" element={<Home/>}></Route>
              <Route path="/dashboard" element={<Dashboard/>}></Route>
              <Route path="/complain" element={<Complaint/>}></Route>
              <Route path="/routemaps" element={<HereMaps/>} ></Route>
              <Route path="/incidents" element={<IncidentReports/>} ></Route>
              <Route path='/database' element={<Table1 />}></Route>
              <Route path="/community" element={<Community/>}></Route>

            </Routes>
            <ToastContainer />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
