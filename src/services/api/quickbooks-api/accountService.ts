import endpoints from "../../endpoints.ts";
import httpClient from "../../httpClient.ts";
import {AxiosRequestConfig} from "axios";


export const getQueriedResults = (query: string, url: string) => {
  return httpClient.get(endpoints.quickbooksApi.getAccounts, {params: {query, url}})
}

export const configureQuickBooksUrl = () => {
  return httpClient.post(endpoints.quickbooksApi.configureUrl)
}