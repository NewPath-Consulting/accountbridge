import httpClient from "../../httpClient.ts";
import endpoints from "../../endpoints.ts";
import {IDataRecordBody, IDataStoreBody, IDataStructureBody} from "../../../typings/IDataStructureBody.ts";
import {AxiosResponse} from "axios";


export const getDataStructures = async (teamId?): Promise<AxiosResponse<IDataStructureBody[]>> => {

  return httpClient.get(endpoints.makeApi.listDataStructures, { params: { teamId }})
}

export const createDataStructure = async (body: IDataStructureBody) => {
  return httpClient.post(endpoints.makeApi.createDataStructure, {
    ...body,
    strict: true
  })
}

export const createDataStore = async (body: IDataStoreBody) => {
  return httpClient.post(endpoints.makeApi.createDataStore, {
    ...body,
    maxSizeMB: 1
  })
}

export const deleteDataStructure = async (dataStructureId: string) => {
  return httpClient.delete(endpoints.makeApi.deleteDataStructure.replace(":dataStructureId", dataStructureId))
}

export const deleteDataStore = async (ids: string[] , teamId: number) => {

  try {
    const response = await httpClient.delete(endpoints.makeApi.deleteDataStore, {params: {teamId, ids}})
    console.log(response)
  }
  catch(e) {
    console.log(e)
  }
}

export const createDataRecord = async (body: IDataRecordBody) => {
  return httpClient.post(endpoints.makeApi.createDataRecord.replace(":dataStoreId", String(body.id)), body)
}

export const updateDataRecord = async (dataRecordKey, teamId, body) => {
  try{
    const response = await httpClient.get(endpoints.makeApi.getDataStores, { params: { teamId } })
    return httpClient.patch(endpoints.makeApi.updateDataRecord.replace(":dataStoreId", response.data[0].id).replace(":dataStoreRecordKey", dataRecordKey), body)
  }
  catch(e){
    throw e
  }
}

