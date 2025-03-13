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
  getScenarios
} from "../services/api/make-api/scenariosService.ts";
import {
  createCloneScenarioBody,
  setConnectionValue,
  setDataRecordKey,
  setDataStoreValue,
  setJSONValue,
  setWebhookValues
} from "./setParameters.ts";
import {getConnections} from "../services/api/make-api/connectionsService.ts";
import {createHook, getHooksFromSource} from "../services/api/make-api/hooksService.ts";
import {folderId} from "../App.tsx";

export const cloneConfiguration = async (data, teamId) => {
  // Track resources created to enable potential rollback
  const createdResources = {
    dataStructures: [],
    dataStore: null,
    dataRecord: null,
    scenarios: []
  };

  try {
    // Step 1: Clone Data Structures
    const { dataStructureMap, dataStructureId } = await cloneDataStructures(createdResources, teamId);
    if (!dataStructureId) {
      throw new Error("Data Structure Cloning Failed");
    }

    // Step 2: Create Data Store
    const dataStoreId = await createDataStoreStep(dataStructureId, createdResources, teamId);
    if (!dataStoreId) {
      throw new Error("Data Store Creation Failed");
    }

    // Step 3: Post Data Record
    const dataRecordId = await postDataRecordStep(createdResources, data);
    if (!dataRecordId) {
      throw new Error("Data Record Creation Failed");
    }

    // Step 4: Clone Scenarios
    await cloneScenarios(dataStructureMap, createdResources, teamId);

    return createdResources;
  } catch (mainError) {
    console.error("Configuration Cloning Failed:", mainError);

    // Rollback mechanism
    try {
      await rollbackCreatedResources(createdResources, teamId);
    } catch (rollbackError) {
      console.error("Rollback Failed:", rollbackError);
    }

    throw mainError;
  }
};

const cloneDataStructures = async (createdResources, teamId) => {
  const dataStructureMap = new Map();
  let firstDataStructureId = null;

  try {
    const response = await getDataStructures();
    const dataStructures = response.data

    for (let i = 0; i < 9; i++) {
      try {
        const dataStructureDetails = await createDataStructure({
          spec: dataStructures[i].spec,
          name: dataStructures[i].name,
          teamId
        });

        // Track created data structure
        createdResources.dataStructures.push(dataStructureDetails.data.dataStructure.id);

        // Map old structure ID to new structure ID
        dataStructureMap.set(dataStructures[i].id, dataStructureDetails.data.dataStructure.id);

        // Keep track of first data structure ID
        if (i === 0) {
          firstDataStructureId = dataStructureDetails.data.dataStructure.id;
        }
      } catch (structureError) {
        console.error(`Failed to clone data structure ${i}:`, structureError);
        // Fail fast - stop entire process if any structure fails
        throw structureError;
      }
    }

    return { dataStructureMap, dataStructureId: firstDataStructureId };
  } catch (error) {
    console.error("Data Structures Cloning Failed:", error);
    throw error;
  }
};

const createDataStoreStep = async (dataStructureId, createdResources, teamId) => {
  try {
    const dataStoreResponse = await createDataStore({
      datastructureId: dataStructureId,
      name: 'QBWA Test',
      teamId: teamId
    });

    // Track created data store
    createdResources.dataStore = dataStoreResponse.data.dataStore.id;

    return dataStoreResponse.data.dataStore.id;
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


const rollbackCreatedResources = async (createdResources, teamId) => {
  try {
    // Rollback scenarios
    if (createdResources.scenarios.length) {
      await Promise.all(
        createdResources.scenarios.map(scenarioId => deleteScenario(String(scenarioId)))
      );
    }


    // Rollback data store
    if (createdResources.dataStore) {
      await deleteDataStore([String(createdResources.dataStore)], teamId);
    }

    // Rollback data structures
    if (createdResources.dataStructures.length) {
      await Promise.all(
        createdResources.dataStructures.map(structureId => deleteDataStructure(String(structureId)))
      );
    }
  } catch (rollbackError) {
    console.error("Complete Rollback Failed", rollbackError);
    // Log critical error - manual intervention might be needed
    throw rollbackError;
  }
};



const cloneScenarios = async (dataStructureMap, createdResources, teamId) => {
  try {
    const scenarios = await getScenarios();
    scenarios.data.sort((a, b) => b.hookId - a.hookId)
    const connections = await getConnections(teamId)
    const webhooksIdMap = new Map(); // Store original webhook ID → new webhook ID mapping

    const hooksResponse = await getHooksFromSource();

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

        webhooksIdMap.set(webhookRef.id, newWebhook.data.id);
      }
    }


    for (const scenario of scenarios.data) {
      try {
        const blueprintResponse = await getScenarioBlueprint(scenario.id);
        const blueprint = blueprintResponse.data.data;
        const clonedScenarioBody = createCloneScenarioBody(scenario, connections.data.data, webhooksIdMap, dataStructureMap, createdResources.dataStore, teamId)
        console.log(scenario, clonedScenarioBody)
        const clonedScenario = await cloneScenario(String(scenario.id), clonedScenarioBody)
        createdResources.scenarios.push(clonedScenario.data.id);

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

const extractWebhookReferences = (blueprint) => {
  const webhookRefs = [];

  const findWebhooks = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Look for webhook identifiers in the blueprint structure
        // This might be something like a "webhook" field or a specific pattern
        if (key === "hook" && typeof obj[key] === "number") {
          webhookRefs.push({
            id: obj[key],
            name: obj.name || `Webhook-${obj[key]}`
          });
        } else if (typeof obj[key] === "object" && obj[key] !== null) {
          findWebhooks(obj[key]);
        }
      }
    }
  };

  findWebhooks(blueprint);
  return webhookRefs;
};

