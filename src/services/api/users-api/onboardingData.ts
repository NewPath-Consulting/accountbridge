import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";

export const getOnboardingData = (token: string) => {
  return httpClient.get(endpoints.userApi.getOnboardingData, {headers: {"Authorization": token}})
}

export const updateOnboardingStep = (stepNumber: number, token) => {

  return httpClient.put(endpoints.userApi.updateOnboardingStep, { stepNumber }, {headers: {"Authorization": token}})
}