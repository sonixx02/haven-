import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import axios from "axios";

function SignInWithGoogle() {
  function googleLogin() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).then(async (result) => {
      const user = result.user;
      if (user) {
        // Send the data to the MongoDB server
        await axios.post("http://localhost:3001/api/users/register", {
          uid: user.uid,
          email: user.email,
          firstName: user.displayName.split(" ")[0],
          lastName: user.displayName.split(" ")[1],
          photo: user.photoURL,
          provider: "google", // Google-based authentication
        });
        toast.success("User logged in Successfully", {
          position: "top-center",
        });
        window.location.href = "/profile";
      }
    }).catch(error => {
      toast.error(error.message, {
        position: "bottom-center",
      });
    });
  }

  return (
    <div>
      <p className="continue-p">--Or continue with--</p>
      <div
        style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}
        onClick={googleLogin}
      >
        <p>Google</p>
      </div>
    </div>
  );
}

export default SignInWithGoogle;
