// import React, { useEffect } from 'react';
// import { useUser } from '@clerk/clerk-react';

// const App = () => {
//   const { user } = useUser();

//   useEffect(() => {
//     // Register user only after they've signed in
//     const registerUserToBackend = async () => {
//       if (!user) return;

//       const userData = {
//         clerkUserId: user.id,
//         username: user.username || '',
//         name: `${user.firstName} ${user.lastName}`,
//         email: user.emailAddresses[0].emailAddress,
//         phone: user.phoneNumbers[0]?.phoneNumber || '',
//         clerkToken: user.session.idToken || '', // Clerk token, if available
//       };

//       await fetch('http://localhost:5000/api/register', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(userData),
//       });
//     };

//     // Call the function after user is authenticated
//     registerUserToBackend();
//   }, [user]);

//   return (
//     <div>
//       <h1>Welcome to the App!</h1>
//       {/* Your app components */}
//     </div>
//   );
// };

// export default App;
