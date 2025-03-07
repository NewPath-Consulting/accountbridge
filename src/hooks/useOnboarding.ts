import {useContext} from "react";
import {OnboardingContext} from "../contexts/onBoardingContext.tsx";

export const useOnBoarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}