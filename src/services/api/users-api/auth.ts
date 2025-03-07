import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {AxiosResponse} from "axios";
import {User} from "../../../contexts/AuthContext.tsx";

export interface AuthResponse {
  message: string,
  user: User,
  token: string
}

export const userLogin = async (email: string, password: string): Promise<AxiosResponse<AuthResponse>> => {
  return httpClient.post(endpoints.userApi.login, {email, password})
}

export const userRegister = async (email: string, password: string, companyName): Promise<AxiosResponse<AuthResponse>> => {
  return httpClient.post(endpoints.userApi.register, {email, password, companyName})
}