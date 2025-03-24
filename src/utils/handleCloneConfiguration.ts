import {
  createDataRecord,
  createDataStore,
  createDataStructure, deleteDataStore, deleteDataStructure,
  getDataStructures
} from "../services/api/make-api/dataStructuresService.ts";
import {
  cloneScenario,
  createScenario,
  deleteScenario,
  getScenarioBlueprint,
  getScenarios, getUserScenarios, updateScenario
} from "../services/api/make-api/scenariosService.ts";
import {
  createCloneScenarioBody,
  setConnectionValue,
  setDataRecordKey,
  setDataStoreValue, setHookUrl,
  setJSONValue,
  setWebhookValues
} from "./setParameters.ts";
import {getConnections} from "../services/api/make-api/connectionsService.ts";
import {createHook, getHooksFromSource} from "../services/api/make-api/hooksService.ts";
import httpClient from "../services/httpClient.ts";
import endpoints from "../services/endpoints.ts";
import {IScenarioResponse} from "../typings/IScenarioBody.ts";

export const cloneConfiguration = async (data, teamId) => {
  // Track resources created to enable potential rollback
  const createdResources = {
    dataStructures: [],
    scenarios: []
  };

  try {

    const response = await getUserScenarios(teamId);

    if(response.data.length){
      await updateScenarios(response.data)
      return
    }

    const { dataStructureMap } = await cloneDataStructures(createdResources, teamId);
    if (!dataStructureMap.size) {
      throw new Error("Data Structure Cloning Failed");
    }

    // Step 4: Clone Scenarios
    await cloneScenarios(dataStructureMap, createdResources, teamId);

    return createdResources;
  } catch (mainError) {
    console.error("Configuration Cloning Failed:", mainError);

    // Rollback mechanism
    try {
      await rollbackCreatedResources(createdResources);
    } catch (rollbackError) {
      console.error("Rollback Failed:", rollbackError);
    }

    throw mainError;
  }
};

const cloneDataStructures = async (createdResources, teamId) => {
  const dataStructureMap = new Map();

  try {
    const response = await getDataStructures();
    const userResponse = await getDataStructures(teamId)
    const dataStructures = response.data
    const userDataStructures = userResponse.data

    for (const structure of dataStructures){
      const userStructure = userDataStructures.find(userStructure => userStructure.name === structure.name)

      if(userStructure){
        dataStructureMap.set(structure.id, userStructure.id)
      }
    }

    return { dataStructureMap };
  } catch (error) {
    throw error;
  }
};

const createDataStoreStep = async (dataStructureId, createdResources, teamId) => {
  try {
    const dataStoreResponse = await httpClient.get(endpoints.makeApi.getDataStores, { params: { teamId } })

    createdResources.dataStore = dataStoreResponse.data[0].id;

    return dataStoreResponse.data[0].id;
  } catch (error) {
    console.error("Data Store Creation Failed:", error);
    throw error;
  }
};

const postDataRecordStep = async (createdResources, data) => {
  try {
    const response = await createDataRecord({
      id: createdResources.dataStore,
      data,
      key: 'ca72cb0afc44'
    });

    // Track created data record
    createdResources.dataRecord = response.data.key;

    return response.data.key;
  } catch (error) {
    console.error("Data Record Creation Failed:", error);
    throw error;
  }
};


const rollbackCreatedResources = async (createdResources) => {
  try {
    // Rollback scenarios
    console.log("scenarios: " + JSON.stringify(createdResources))

    if (createdResources.scenarios.length) {
      await Promise.all(
        createdResources.scenarios.map(scenarioId => deleteScenario(String(scenarioId)))
      );
    }
  } catch (rollbackError) {
    console.error("Complete Rollback Failed", rollbackError);
    // Log critical error - manual intervention might be needed
    throw rollbackError;
  }
};

const updateScenarios = async (scenarios: IScenarioResponse[]) => {
  try{
    for(const scenario of scenarios){
      const blueprint = await getScenarioBlueprint(scenario.id);

      await updateScenario(scenario.id, JSON.stringify(blueprint.data.data))
    }
  }
  catch (e){
    throw e
  }
}



const cloneScenarios = async (dataStructureMap, createdResources, teamId) => {
  try {
    const scenarios = await getScenarios();
    scenarios.data.sort((a, b) => b.hookId - a.hookId)
    const connections = await getConnections(teamId)
    const webhooksIdMap = new Map(); // Store original webhook ID → new webhook ID mapping
    const dataStoreResponse = await httpClient.get(endpoints.makeApi.getDataStores, { params: { teamId } })


    const hooksResponse = await getHooksFromSource();
    let hookUrl;

    // Create new webhooks for each reference found
    for (const webhookRef of hooksResponse.data) {
      if (!webhooksIdMap.has(webhookRef.id)) {
        // Create new webhook with necessary configuration
        const newWebhook = await createHook({
          name: `${webhookRef.name}`,
          teamId: teamId,
          stringify: false,
          method: false,
          typeName: 'gateway-webhook',
          headers: false
        });

        hookUrl = newWebhook.data.url;
        webhooksIdMap.set(webhookRef.id, newWebhook.data.id);
      }
    }


    for (const scenario of scenarios.data) {
      try {
        const clonedScenarioBody = createCloneScenarioBody(scenario, connections.data.data, webhooksIdMap, dataStructureMap, dataStoreResponse.data[0].id, teamId)
        const clonedScenario = await cloneScenario(String(scenario.id), clonedScenarioBody);

        createdResources.scenarios.push(clonedScenario.data.id);

        const blueprintResponse = await getScenarioBlueprint(clonedScenario.data.id);
        const blueprint = blueprintResponse.data.data;

        setHookUrl(blueprint, hookUrl);

        await updateScenario(clonedScenario.data.id, JSON.stringify(blueprint))

      }
      catch (e){
        console.log(e)
        throw e
      }
    }
  }
  catch (error) {
    console.error("Scenarios Cloning Failed:", error);
    throw error;
  }
}


