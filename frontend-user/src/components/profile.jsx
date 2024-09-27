import React, { useEffect, useState } from "react";
import { auth } from "../../firebase";
import axios from "axios"; // Axios to make API requests



function Profile() {
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/users/${uid}`);
      setUserDetails(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get the currently logged-in user from Firebase auth
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Fetch user data from MongoDB using the UID
        await fetchUserData(user.uid);
      } else {
        console.log("No user logged in");
      }
    });
  }, []);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      {userDetails ? (
        <>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <img
              src={userDetails.photo || "default-photo-url"} 
              alt="Profile"
              width={"40%"}
              style={{ borderRadius: "50%" }}
            />
          </div>
          <h3>Welcome 🙏🙏 {userDetails.firstName}</h3>
          <div>
            <p>Email: {userDetails.email}</p>
            <p>First Name: {userDetails.firstName}</p>
            <p>Last Name: {userDetails.lastName}</p>
          </div>
          <button className="btn btn-primary" onClick={handleLogout}>
            Logout
          </button>
          <button></button>
        
        </>
      ) : (
        <p>No user data available</p>
      )}
    </div>
  );
}

export default Profile;
