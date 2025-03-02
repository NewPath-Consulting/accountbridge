import React, { useState } from 'react';
import './Auth.css';
import {Link, useNavigate} from "react-router-dom";
import {useAuth} from "../../hooks/useAuth.tsx"; // For any custom styles

export const LoginPage = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true)

    try{
      await login(email, password);
      navigate('/')
    }
    catch(e){
      console.log(e);
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
            <h2 className="fw-medium mb-4 auth-title">Welcome Back</h2>

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

              <div className="d-flex justify-content-end">
                <div className="text-secondary text-decoration-none small">
                  Forgot Password ?
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-success fw-bold"
              >
                Sign In
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

              <div className="text-center text-secondary small d-flex gap-1">
                don't have an account?{' '}
                <Link to={'/register'} className="text-primary text-decoration-none">
                  Sign up
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
