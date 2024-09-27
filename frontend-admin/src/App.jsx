import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

export default function App() {

  // const handleClick = async () => {
  //   try {
  //     const response = await axiosInstance('/test');
  //     console.log("Response:", response.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }

  return (
    <header>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
      {/* <div>
        <button onClick={handleClick}>Click me</button>
      </div> */}

    </header>
  )
}