import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";

export const getOnboardingData = (token: string) => {
  return httpClient.get(endpoints.userApi.getOnboardingData, {headers: {"Authorization": token}})
}