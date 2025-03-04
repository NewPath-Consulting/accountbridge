import "./ProgressBar.css";
import {ONBOARDING_STEPS} from "../../onboardingSteps.tsx";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {Link} from "react-router-dom";

const ProgressBar: React.FC = () => {
  const { currentStep } = useOnBoarding();

  return (
    <aside className="progress-container">
      <div className={`progress`} style={{width: `${(100/(ONBOARDING_STEPS.length-1))*(currentStep-1)}%`}}></div>
      {
        ONBOARDING_STEPS.map((step, index )=> {
          const isClickable = index + 1 < currentStep

          return (
            isClickable ?
            <Link to={step.endpoint} className={`step ${isClickable ? "completed" : index + 1 == currentStep  ? "active" : ""} `}  key={index}>
              {
                isClickable ? <i className={'bi bi-check'} style={{color: 'white'}}></i> : index + 1
              }
            </Link> :
            <span className={`step ${isClickable ? "completed" : index + 1 == currentStep  ? "active" : ""} `}  key={index}>{index + 1}</span>
          )
        })
      }
    </aside>
  );
};

export default ProgressBar;