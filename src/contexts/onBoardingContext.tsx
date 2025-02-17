import {createContext, useEffect, useState} from "react";
import {AuthService} from "../services/httpClient.ts";
import {ICustomerInfo} from "../pages/customer-info-page/CustomerInformationPage.tsx";
import {IGeneralInformation} from "../pages/general-information-page/GeneralInformationPage.tsx";
import {IStep, ONBOARDING_STEPS} from "../onboardingSteps.ts";
import {useLocation} from "react-router-dom";

interface OnboardingState {
  authToken: string;
  baseUrl: string;
  connections: { name: string; apiKey: string }[];
  customerInfo: ICustomerInfo | {};
  wildApricotAPI: string,
  generalInfo: IGeneralInformation | {},
  completedSteps: string[]; // Track completed step endpoints
}

interface OnboardingContextType {
  onBoardingData: OnboardingState;
  updateData: (data: any) => void;
  currentStepIndex: number;
  steps: IStep[];
  markStepAsCompleted: (endpoint: string) => void;
  canAccessStep: (endpoint: string) => boolean;
  getNextStep: () => string | null;
  getPreviousStep: () => string | null;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnBoardingProvider = ({children}) => {
  const location = useLocation();
  const [steps, setSteps] = useState<IStep[]>(() => {
    const completedSteps = JSON.parse(localStorage.getItem("completedSteps") || "[]");

    return ONBOARDING_STEPS.map(step => ({
      ...step,
      isCompleted: completedSteps.includes(step.endpoint)
    }));
  });

  const [onBoardingData, setOnBoardingData] = useState<OnboardingState>(() => {
    const savedBaseUrl = localStorage.getItem("baseUrl") || "";
    const savedAuthToken = localStorage.getItem("authToken") || "";
    const savedWildApricotAPI = localStorage.getItem("waApiKey") || ""
    return {
      baseUrl: savedBaseUrl,
      authToken: savedAuthToken,
      connections: [],
      customerInfo: {},
      wildApricotAPI: savedWildApricotAPI,
      generalInfo: {},
      completedSteps: JSON.parse(localStorage.getItem("completedSteps") || "[]")
    };
  });

  const currentStepIndex = steps.findIndex(step => step.endpoint === location.pathname);

  useEffect(() => {
    steps.forEach(step => {
      if(onBoardingData.completedSteps.includes(step.endpoint)){
        step.isCompleted = true
      }
    })
    console.log(steps)
  }, [onBoardingData.completedSteps]);

  useEffect(() => {
    if(onBoardingData.baseUrl && onBoardingData.authToken){
      AuthService.setAuth(onBoardingData.authToken, onBoardingData.baseUrl);
    }
  }, [onBoardingData.baseUrl, onBoardingData.authToken]);

  const [currentStep, setCurrentStep] = useState<number>(1);

  const updateData = (data) => {
    // Update context state
    setOnBoardingData((prev) => {
      const updatedData = { ...prev, ...data };

      // Persist only baseUrl and authToken in localStorage
      if (data.baseUrl) {
        localStorage.setItem("baseUrl", data.baseUrl);
      }
      if (data.authToken) {
        localStorage.setItem("authToken", data.authToken);
      }

      return updatedData;
    });
  };

  const markStepAsCompleted = (endpoint: string) => {
    // Update completedSteps in state
    setOnBoardingData(prev => {
      const completedSteps = [...prev.completedSteps, endpoint];
      localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
      return {...prev, completedSteps};
    });

    // Update steps array to set isCompleted flag
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.endpoint === endpoint
          ? {...step, isCompleted: true}
          : step
      )
    );
  }

  // Check if user can access a specific step
  const canAccessStep = (endpoint: string): boolean => {
    const targetIndex = steps.findIndex(step => step.endpoint === endpoint);
    const previousSteps = steps.slice(0, targetIndex);
    return previousSteps.every(step => onBoardingData.completedSteps.includes(step.endpoint));
  };

  // Get the next available step
  const getNextStep = (): string | null => {
    const nextStep = steps[currentStepIndex + 1];
    return nextStep ? nextStep.endpoint : null;
  };

  const getPreviousStep = (): string | null => {
    if (currentStepIndex > 0) {
      return steps[currentStepIndex - 1].endpoint;
    }
    return null;
  };

  return (
    <OnboardingContext.Provider value={{onBoardingData, updateData, currentStep, setCurrentStep, steps, currentStepIndex, canAccessStep, markStepAsCompleted, getNextStep, getPreviousStep}}>
      {children}
    </OnboardingContext.Provider>
  )
}