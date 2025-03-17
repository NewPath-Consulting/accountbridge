import './CreateMakeAccount.css'
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useState} from "react";
import * as React from "react";
import {AuthService} from "../../services/httpClient.ts";
import {getUserInfo} from "../../services/api/make-api/usersService.ts";
import {useNavigate} from "react-router-dom";

const steps: {description: string, img: string}[] = [
  {
    description: "Go to make.com and sign up for free",
    img: "make.png"
  },
  {
    description: "Get the pro version subscription",
    img: "payment.png"
  },
  {
    description: "Add an access token to your account",
    img: "token.png"
  },
  {
    description: "Copy the API key and Base URL and paste it into the fields above",
    img: "verify.png"
  }
]

export const CreatMakeAccountPage = () => {
  const {onBoardingData, updateData, markStepAsCompleted, getNextStep} = useOnBoarding();
  const [authData, setAuthData] = useState({authToken: "", baseUrl: ""})
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    console.log(onBoardingData)
  }, [onBoardingData]);
  //
  // const handleVerification = async (e) => {
  //   e.preventDefault()
  //   AuthService.setAuth(authData.authToken, authData.baseUrl);
  //
  //   try{
  //     await getUserInfo();
  //
  //     updateData({credentials: {authToken: authData.authToken, baseUrl: authData.baseUrl}});
  //     markStepAsCompleted('/');
  //     const nextStep = getNextStep();
  //     if (nextStep) {
  //       navigate(nextStep);
  //     }
  //   }
  //   catch(e){
  //     console.error("Incorrect credentials: " + e.response.data.error);
  //     setErrorMsg(e.response.data.error)
  //   }
  // }

  const handleVerification = async (e) => {
    e.preventDefault()
    try{

      await markStepAsCompleted('/');

      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch(e){
      console.error("Incorrect credentials: " + e.response.data.error);
      setErrorMsg(e.response.data.error)
    }
  }

  const handleChange = (e) => {
    const {name, value} = e.target;

    setAuthData({
      ...authData, [name]: value
    })
  }

  return (
    <main >
      <header>
        <h2>Create a Make account</h2>
        <p>Follow the steps below to create a Make account, then enter your credentials to continue.</p>
      </header>

      <div className="accordion" id="accordionExample">
        {steps.map((step, index) => {
          return (
            <div className="accordion-item" key={index}>
              <h2 className="accordion-header">
                <button
                  className={`accordion-button collapsed`}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse${index}`}
                  aria-expanded={"false"} // True for the first, false for others
                  aria-controls={`collapse${index}`}
                >
                  <div className={"d-flex gap-3 align-items-center"}>
                    <img
                      src={step.img}
                      width={30}
                      alt={"predefined images for each step"}
                    />
                    <div>
                      <p className={"mb-1"} style={{fontWeight: "500", color: "rgb(0, 0, 0, 0.7)", fontSize: "15px"}}>Step {index + 1}</p>
                      <p>{step.description}</p>
                    </div>
                  </div>
                </button>
              </h2>
              <div
                id={`collapse${index}`}
                className={`accordion-collapse collapse`}
                data-bs-parent="#accordionExample"
              >
                <div className="accordion-body">
                  <strong>This is Step {index + 1}'s content.</strong> It is shown
                  when expanded. You can modify this with any content you like.
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {/*<form className={""} onSubmit={handleVerification}>*/}
      {/*  {errorMsg && <div style={{fontSize:'13px'}} className="alert alert-danger" role="alert">*/}
      {/*      <i style={{color: "#58151c"}} className={'bi bi-exclamation-circle'}></i> {errorMsg}*/}
      {/*  </div>}*/}
      {/*  <div className="form-floating col-sm-12 mb-3">*/}
      {/*    <input type="password" value={authData.authToken} name={"authToken"} className="form-control" id="access-token" onChange={handleChange} placeholder="http/"/>*/}
      {/*    <label htmlFor="access-token">Access Token</label>*/}
      {/*  </div>*/}
      {/*  <div className="form-floating col-sm-12 mb-3">*/}
      {/*    <input type="text" className="form-control" id="base-url" name={"baseUrl"} value={authData.baseUrl} placeholder="Base Url" onChange={handleChange}/>*/}
      {/*    <label htmlFor="base-url">Base Url</label>*/}
      {/*  </div>*/}
      {/*  <div className="form-group">*/}
      {/*  </div>*/}
      {/*</form>*/}
      <button className={"btn-success"} type={"button"} onClick={handleVerification}>Next</button>

    </main>
  )
}