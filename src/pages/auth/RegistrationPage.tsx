import React, { useState } from 'react';
import './Auth.css';
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.tsx"; // For any custom styles

export const RegistrationPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', { email, password });
    setLoading(true)
    try{
      await register(email, password, name);
      navigate('/')
    }
    catch (e){
      console.log(e)
      setError(e.response.data.message)
    }
    finally {
      setLoading(false)
    }
  };

  return (
    <div className="vh-100 vw-100">
      <div className="row h-100 m-0">
        <div className="col-md-6 d-flex flex-column login-container pt-4">
          <div className="product-name mb-5 align-self-baseline">
            <div className="d-flex align-items-center">
              <div className="logo-container bg-light-green d-flex align-items-center justify-content-center me-2">
                <span className="text-green fw-bold">A</span>
              </div>
              <span className="fw-bold fs-4 auth-title">AccountBridge</span>
            </div>
          </div>

          <div className={'auth-container '}>
            <h2 className="fw-medium mb-4 auth-title">Create an Account</h2>
            {error && <div style={{fontSize: '13px'}} className="alert alert-danger" role="alert">
              <i style={{color: "#58151c"}} className={'bi bi-exclamation-circle'}></i> {error}
            </div>}
            <form onSubmit={handleSubmit} className={'d-flex flex-column gap-3'}>
              <div className="align">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="align">
                <label htmlFor="name" className="form-label">
                  Company Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-control"
                  required
                />
              </div>

              <div className="">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <div className="position-relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-control"
                    required
                  />
                  <button
                    type="button"
                    className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <input type={'checkbox'} className={'form-check-input m-0'}/>
                <div className="text-secondary text-decoration-none small">
                  I agree to the Terms & Conditions
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success fw-bold"
              >
                Create Account
              </button>

              <div className="position-relative ">
                <hr />
                <div className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary small">
                  OR
                </div>
              </div>

              <button
                type="button"
                className="btn border border-1 w-100 py-2 mb-4 d-flex align-items-center justify-content-center gap-2"
              >
                <img src={'google.svg'}  alt={'google logo'}/>
                Continue with Google
              </button>

              <div className="text-center text-secondary small d-flex gap-1 pb-3">
                already have an account?{' '}
                <Link to={'/login'} className="text-primary text-decoration-none">
                  Sign in
                </Link>
              </div>
            </form>
          </div>

        </div>

        {/* Right section with light green background */}
        <div className="col-md-6 auth-img pt-4 pb-4 pe-4">
          <div className={'w-100 h-100 rounded-4'}>
          </div>
        </div>
      </div>
    </div>
  );
};
