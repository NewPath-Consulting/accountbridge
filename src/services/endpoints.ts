
const endpoints = {
  quickbooksApi: {
    getInvoice: "/quickbooks/invoice",
    createInvoice: "/quickbooks/invoice",
    getAccessToken: "/api/quickbooks/connect",
    refreshAccessToken: "/api/quickbooks/refresh-token",
    getAccounts: "/api/quickbooks/query",
    configureUrl: "/api/quickbooks/configure"
  },
  wildApricotApi: {
    getAccessToken: "/api/wild-apricot/connect",
    login: "/api/wild-apricot/login",
    refreshAccessToken: "/api/wild-apricot/refresh-token",
    getMembershipLevels: "/accounts/:accountId/membershiplevels",
    getTenders: "/accounts/:accountId/tenders",
    updateMember: "/wild-apricot/members/:id",
    getAccounts: '/accounts',
    getContactInfo: "/accounts/:accountId/contacts/me",
    getEventTags: "/accounts/:accountId/events",
    getProductTags: "/accounts/:accountId/store/products",
    getContactFields: "accounts/:accountId/contactFields",
    getDonationFields: "accounts/:accountId/donationFields",
  },
  makeApi: {
    listDataStructures: "makeApi/data-structures",
    createDataStructure: "makeApi/data-structures",
    createDataStore: "makeApi/data-stores",
    createDataRecord: "makeApi/data-stores/:dataStoreId/data",
    listScenarios: "makeApi/scenarios",
    createScenario: "makeApi/scenarios",
    getScenarioBlueprint: "makeApi/scenarios/:scenarioId/blueprint",
    listConnections: "makeApi/connections",
    createConnection: "makeApi/connections",
    verifyConnection: "makeApi/connections/:connectionId/test",
    updateDataRecord: "makeApi/data-stores/:dataStoreId/data/:key",
    listOrganizations: "makeApi/organizations",
    listTeams: "makeApi/teams",
    OAuth: "makeApi/oauth/auth/:connectionId",
    getUserInfo: "makeApi/users/me",
    deleteScenario: "makeApi/scenarios/:scenarioId",
    deleteDataStore: "makeApi/data-stores",
    deleteDataStructure: "makeApi/data-structures/:dataStructureId",
    runScenarios: "makeApi/scenarios/:scenarioId/run",
    activeScenario: "makeApi/scenarios/:scenarioId/start",
    getScenarioDetails: "makeApi/scenarios/:scenarioId",
    hooks: "makeApi/hooks",
    cloneScenarios: "makeApi/scenarios/:scenarioId/clone",
    getTemplateUrl: "makeApi/instances/flow/init/template",
    getFlow: "makeApi/instances/flow/:flowId"
  },
  userApi: {
    login: "api/users/login",
    register: "api/users/register",
    getOnboardingData: "api/users/onboarding-data",
    updateOnboardingStep: "api/users/onboarding-step"
  }
};

export default endpoints;