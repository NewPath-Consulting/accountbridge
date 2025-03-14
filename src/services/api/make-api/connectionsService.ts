import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {AxiosResponse} from "axios";

interface ConnectionData {
  data: IConnectionResponse[]
}

export interface TemplateUrlResponse {
  flow: {id: string},
  publicUrl: string
}

export const getConnections = async (teamId: number): Promise<AxiosResponse<ConnectionData>> => {
  return httpClient.get(endpoints.makeApi.listConnections, {params: {teamId}})
}

export const createConnection = async (body: IConnectionBody, teamId: number): Promise<AxiosResponse<IConnectionResponse>> => {
  console.log(body, teamId);
  return httpClient.post(endpoints.makeApi.createConnection, body, {params: {teamId}});
}

export const getTemplateUrl = async (teamId: number, templateId: number): Promise<AxiosResponse<TemplateUrlResponse>>  => {
  return httpClient.post(endpoints.makeApi.getTemplateUrl, {teamId, templateId});
}

export const getFlow = async (flowId: string) => {
  return httpClient.get(endpoints.makeApi.getFlow.replace(':flowId', flowId));
}

export const verifyConnection = async (connectionId: number): Promise<AxiosResponse<any>> => {
  return httpClient.post(endpoints.makeApi.verifyConnection.replace(":connectionId", String(connectionId)));
}