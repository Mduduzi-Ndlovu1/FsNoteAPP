import React, { useState } from 'react'
import Navbar from '../../components/Navbar/Navbar'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import PasswordInput from '../../components/Input/PasswordInput'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'

const Login = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if(!password){
      setError("Please enter password");
      return;
    }else if(password.length < 6){
      setError("Password must be at least 6 characters");
      return;
    }

    setError("")

    //Login API Call

    try {
      const response = await axiosInstance.post("/login", {
        email: email,
        password: password,
      });

      // Handle sucessful login response
      if(response.data && response.data.accessToken){
        localStorage.setItem("accessToken", response.data.accessToken);
        navigate("/dashboard")
      }
    } catch (error) {
      // Handle Login error

      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      }else {
        setError("Something went wrong. Please try again later.");
      }
    }
  }


  return (
    <>
      <Navbar/>

      <div className='flex items-cetner justify-center mt-28'>
        <div className='w-96 border rounded bg-white px-7 py-10'>
          <form onSubmit={handleLogin}>
            <h4 className='text-2xl mb-7'>
              Login
            </h4>

            <input 
              type='text'
              placeholder='Email'
              className='input-box'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
            />

            {error && <p className='text-red-500 text-xs pb-1'>{error}</p>}

            <button type='submit' className='btn-primary'>
              Login 
            </button>

            <p className='text-sm text-center mt-4'>
              Not Registered yet? {" "}
              <Link to="/signup" className='font-medium text-primary underline'>
              Create An Account</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login