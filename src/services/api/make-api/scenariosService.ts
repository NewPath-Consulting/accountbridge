import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {IScenarioBody, IScenarioResponse} from "../../../typings/IScenarioBody.ts";
import {AxiosResponse} from "axios";

interface ActivateScenarioResponse {
  id: number,
  islinked: boolean,
  isActive: boolean
}

interface ScenarioDetailsResponse {
  id: number,
  name: string,
  isActive: boolean,
  teamId: string,

}

export const getScenarios = async (): Promise<AxiosResponse<IScenarioResponse[]>> => {
  return httpClient.get(endpoints.makeApi.listScenarios)
}

export const getUserScenarios = async (teamId: number): Promise<AxiosResponse<IScenarioResponse[]>> => {
  const params = {teamId}
  return httpClient.get(endpoints.makeApi.listScenarios, {params})
}

export const createScenario = async (body: IScenarioBody) => {
  return httpClient.post(endpoints.makeApi.createScenario, body,{params: {confirmed: true}})
}

export const deleteScenario = async (scenarioId: string) => {
  return httpClient.delete(endpoints.makeApi.deleteScenario.replace(":scenarioId", scenarioId))
}

export const getScenarioBlueprint = async (scenarioId)=> {
  return httpClient.get(endpoints.makeApi.getScenarioBlueprint.replace(":scenarioId", scenarioId));
}

export const getScenarioDetails = async (scenarioId): Promise<AxiosResponse<ScenarioDetailsResponse>> => {
  return httpClient.get(endpoints.makeApi.getScenarioDetails.replace(":scenarioId", scenarioId));
}

export const runScenario =  async (scenarioId) => {
  try{
    return httpClient.post(endpoints.makeApi.runScenarios.replace(":scenarioId", scenarioId), {responsive: true});
  }
  catch(e){
    console.log(e)
  }
}

export const activateScenario =  async (scenarioId): Promise<AxiosResponse<ActivateScenarioResponse>> => {
  try{
    return httpClient.post(endpoints.makeApi.activeScenario.replace(":scenarioId", scenarioId));
  }
  catch(e){
    console.log(e)
  }
}

export const cloneScenario = async (scenarioId: string, body: any) => {
  return httpClient.post(endpoints.makeApi.cloneScenarios.replace(":scenarioId", scenarioId), body)
}

