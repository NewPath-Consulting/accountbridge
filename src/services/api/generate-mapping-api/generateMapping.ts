import {AxiosResponse} from "axios";
import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {ICustomerInfo} from "../../../pages/customer-info-page/CustomerInformationPage.tsx";

interface GenerateMappingResponse {
  message: ICustomerInfo,
  usage: number
}

export const generateCustomerInformationMapping = async (message: string): Promise<AxiosResponse<GenerateMappingResponse>> => {
  return httpClient.post(endpoints.generateMappingsApi.generateCustomerInfo, { message })
}