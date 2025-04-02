import {AxiosResponse} from "axios";
import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {ICustomerInfo} from "../../../pages/customer-info-page/CustomerInformationPage.tsx";
import {PaymentConfig} from "../../../pages/payment-config-page/PaymentConfigPage.tsx";

interface GenerateMappingResponse {
  message: ICustomerInfo | PaymentConfig[],
  usage: number
}

export const generateMapping = async (message: string, systemMessage: string): Promise<AxiosResponse<GenerateMappingResponse>> => {
  return httpClient.post(endpoints.generateMappingsApi.generateCustomerInfo, { message, systemMessage })
}