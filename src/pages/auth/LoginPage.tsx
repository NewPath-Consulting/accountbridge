import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Auth.css'; // For any custom styles

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt with:', { email, password });
  };

  return (
    <div className="vh-100 vw-100">
      <div className="row h-100">
        <div className="col-md-6 d-flex flex-column login-container justify-content-center">
          <div className="product-name mb-5">
            <div className="d-flex align-items-center">
              <div className="logo-container bg-light-green d-flex align-items-center justify-content-center me-2">
                <span className="text-green fw-bold">A</span>
              </div>
              <span className="fw-bold fs-4 auth-title">AccountBridge</span>
            </div>
          </div>

          <div className={'auth-container '}>
            <h1 className="fw-medium mb-4 auth-title">Welcome Back</h1>

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
                    <i className={'bi bi-eye'}></i>
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
                <hr className="" />
                <div className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-secondary small">
                  OR
                </div>
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary w-100 py-2 mb-4 d-flex align-items-center justify-content-center"
              >
                Continue with Google
              </button>

              <div className="text-center text-secondary small d-flex gap-1">
                don't have an account?{' '}
                <div  className="text-primary text-decoration-none">
                  Sign up
                </div>
              </div>
            </form>
          </div>

        </div>

        {/* Right section with light green background */}
        <div className="col-md-6 auth-img pt-4 pb-4 pe-5">
          <div className={'w-100 h-100 rounded-4'}>

          </div>
        </div>
      </div>
    </div>
  );
};
