import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import app from "../App.tsx";

const OAuthSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");
    const realmId = params.get("realmId");
    const appName = params.get("app");

    if(realmId){
      localStorage.setItem(`${appName}RealmId`, realmId);
    }

    if (accessToken && refreshToken) {
      localStorage.setItem(`${appName}AccessToken`, accessToken);
      localStorage.setItem(`${appName}RefreshToken`, refreshToken);
      console.log("directed...")
      // Redirect to dashboard or desired page
      navigate("/create-connections");
    } else {
      console.error("Authorization failed or tokens missing");
    }
  }, []);

  return <div>Processing authentication...</div>;
};

export default OAuthSuccess;
