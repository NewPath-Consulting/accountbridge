import axios from "axios"
import {refreshQuickbooksAccessToken} from "./api/quickbooks-api/authService.ts";
import quickbooksClient from "./quickbooksClient.ts";

export class AuthService {
  private static dynamicToken: string | null = null;
  private static qbAccessToken: string | null = null;
  private static qbRealmId: string | null = null;
  private static baseUrl: string | null = null;


  static setQuickbooksAuth(accessToken: string, realmId: string) {
    this.qbAccessToken = accessToken;
    this.qbRealmId = realmId;
  }

  static clearAuth() {
    this.dynamicToken = null;
    this.qbAccessToken = null;
    this.qbRealmId = null;
  }
}


const httpClient = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  }
})

httpClient.interceptors.request.use(
  (config) => {

    if(config.url.includes("quickbooks")){
      config.headers.Authorization = localStorage.getItem("qbAccessToken");
      config.headers.realmId = localStorage.getItem("qbRealmId");
    }
    return config;
  },
  (error) => Promise.reject(error)
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log(error)
    // If the error is 401 and we haven't already retried
    if (originalRequest.url.includes("quickbooks") && error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark request as retried

      try {
        const clientId = localStorage.getItem('qbClientId');
        const clientSecret = localStorage.getItem('qbClientSecret');
        const refreshToken = localStorage.getItem('qbRefreshToken');
        await refreshQuickbooksAccessToken({clientId, clientSecret, refreshToken})

        // Update the Authorization header and retry the original request
        originalRequest.headers.Authorization = localStorage.getItem('qbAccessToken');
        return httpClient(originalRequest); // Retry the original request
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        // Optional: Redirect to login or show an error
        return Promise.reject(refreshError);
      }
    }

    // If not 401 or retry failed, reject the error
    return Promise.reject(error);
  })

export default httpClient;