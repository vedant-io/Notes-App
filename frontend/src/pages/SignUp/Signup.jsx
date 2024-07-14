import NavBar from "../../components/Navbar/NavBar";
import PasswordInput from "../../components/Input/PasswordInput";
import { useState } from "react";
import { Link } from "react-router-dom";
import { validatEmail } from "../../utils/helper";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    // Signup API Call
    if (!name) {
      setError("Please enter a name");
      return;
    }
    if (!validatEmail(email)) {
      setError("Enter a valid email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }

    setError("null");
  };
  return (
    <>
      <NavBar />
      <div className="flex items-center justify-center mt-28">
        <div className="w-96 border rounded bg-white px-7 py-18">
          <form onSubmit={handleSignup}>
            <h4 className="text-2xl mb-7 mt-5 ">Signup</h4>

            <input
              type="text"
              placeholder="Name"
              className="input-box"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              type="text"
              placeholder="Email"
              className="input-box"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

            <button type="submit" className="btn-primary">
              Create Account
            </button>
            <p className="text-sm text-center m-4">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-primary underline text-blue-500"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;
