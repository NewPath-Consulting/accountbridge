import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {OnboardingState} from "../../../contexts/onBoardingContext.tsx";

export const getOnboardingData = () => {
  return httpClient.get(endpoints.userApi.getOnboardingData)
}

export const updateOnboardingStepNumber = (stepNumber: number) => {
  return httpClient.put(endpoints.userApi.updateOnboardingStep, { stepNumber })
}
