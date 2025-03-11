import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useState} from "react";
import * as React from "react";
import {ConnectionComponent} from "../../components/connection-component/ConnectionComponent.tsx";
import {createConnection, getConnections, verifyConnection} from "../../services/api/make-api/connectionsService.ts";
import {useNavigate} from "react-router-dom";
import {getWildApricotAccessToken, wildApricotLogin} from "../../services/api/wild-apricot-api/authService.ts";
import {getQuickbooksAccessToken} from "../../services/api/quickbooks-api/authService.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {teamId} from "../../App.tsx";

export interface IConnection {
  img: string,
  title: string,
  description: string,
  accountType: string,
  scopes ?: string[],
  fields: {},
  secondaryFields ?: {},
  modalId: string
}
const connectionsList: IConnection[] = [
  {
    img: "wa-logo.png",
    title: "WildApricot",
    description: "Connect to your Wild Apricot account to automate your workflows in Make",
    accountType: "wild-apricot",
    scopes: ["auto"],
    fields: {"API Key": "apiKey"},
    modalId: "wild-apricot-1"
  },

  {
    img: "qb-logo.png",
    title: "QuickBooks",
    description: "Connect to QuickBooks to automate your workflows with Make",
    accountType: "quickbooks",
    scopes: [
      "com.intuit.quickbooks.accounting",
    "com.intuit.quickbooks.payment",
    "openid"
    ],
    fields: {},
    modalId: "quickbooks-1"
  },
  {
    img: "mg-logo.png",
    title: "Mailgun",
    description: "Link your Mailgun account to handle all email communications with your members.",
    accountType: "mailgun2",
    fields: {"API Key": "apiKey", "Base Url": "baseUrl"},
    modalId: "mailgun-1"
  }
]

const accountBridgeConnectionsList: IConnection[] = [
  {
    img: "wa-logo.png",
    title: "WildApricot",
    description: "Connect to your Wild Apricot account to manage your organization's membership data and events.",
    accountType: "wild-apricot",
    scopes: ["auto"],
    fields: {"API Key": "apiKey"},
    modalId: "wild-apricot-2"
  },

  {
    img: "qb-logo.png",
    title: "QuickBooks",
    description: "Connect to QuickBooks to automatically sync your financial transactions and manage billing.",
    accountType: "quickbooks",
    scopes: [
      "com.intuit.quickbooks.accounting",
      "com.intuit.quickbooks.payment",
      "openid"
    ],
    fields: {"Client Id": "clientId", "Client Secret": "clientSecret"},
    modalId: "quickbooks-2"
  }
]

export const CreateConnectionsPage = () => {
  const {updateData, markStepAsCompleted, getNextStep, getPreviousStep} = useOnBoarding();
  const [errorMsg, setErrorMsg] = useState("");
  const [isConnectedMap, setIsConnectedMap] = useState(() => {
    return new Map(
      connectionsList.map((connection) => [connection.accountType, false])
    );
  });

  const [isAppConnectedToAccountBridgeMap, setIsAppConnectedToAccountBridgeMap] = useState(() => {
    return new Map(
      accountBridgeConnectionsList.map((connection) => [connection.accountType, false])
    );
  });
  const [isLoadingMap, setIsLoadingMap] = useState(() => {
    return new Map(
      connectionsList.map((connection) => [connection.accountType, false])
    );
  });
  const [isContentLoading, setIsContentLoading] = useState(true);
  const navigate = useNavigate();

  const setConnectionLoading = (accountName: string, isLoading: boolean) => {
    setIsLoadingMap((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(accountName, isLoading)
      return newMap; // Return the updated map
    });
  }

  const openAuthWindow = (url: string) => {
    const authWindow = window.open(url, "_blank", "width=500,height=600");

    if (!authWindow) {
      alert("Popup blocked! Please allow popups for this site.");
      throw new Error("Popup blocked");
    }

    return authWindow;
  };


  const monitorAuthWindow = async (authWindow: Window, connectionId: number, connectionBody: IConnectionBody) => {
    return new Promise<void>((resolve, reject) => {
      const interval = setInterval(async () => {
        if (authWindow.closed) {
          clearInterval(interval); // Stop monitoring the window
          try {
            const response = await verifyConnection(connectionId);

            setIsConnectedMap((prevMap) => {
              const newMap = new Map(prevMap);
              newMap.set(connectionBody.accountType, true);
              return newMap;
            });

            setConnectionLoading(connectionBody.accountType, false);
            resolve();
          } catch (error: any) {
            setConnectionLoading(connectionBody.accountType, false);
            setErrorMsg(error.response.data.error + connectionBody.accountName);
            reject(error);
          }
        }
      }, 500);
    });
  };

  const createConnectionToAccountBridge = async (fields, connection: IConnection) => {

    try{
      if(connection.accountType === "quickbooks"){
        localStorage.setItem("qbClientId", fields.clientId);
        localStorage.setItem("qbClientSecret", fields.clientSecret)
        const response = await getQuickbooksAccessToken({clientSecret: fields.clientSecret, clientId: fields.clientId})
        const { authUri } = response.data;
        const authWindow = openAuthWindow(authUri)

        window.addEventListener('message', (event) => {
          if (event.data.type === 'QB_AUTH_SUCCESS') {
            localStorage.setItem(`qbAccessToken`, event.data.data.accessToken);
            localStorage.setItem(`qbRefreshToken`, event.data.data.refreshToken);
            localStorage.setItem(`qbRealmId`, event.data.data.realmId);
            setIsAppConnectedToAccountBridgeMap((prevMap) => {
              const newMap = new Map(prevMap);
              newMap.set('quickbooks', true);
              return newMap;
            });
            authWindow?.close();
            // Handle success - maybe show a message
          } else if (event.data.type === 'QB_AUTH_ERROR') {
            setErrorMsg("Failed to connect to QuickBooks");
            authWindow?.close();
          }
        });
      }
      else if(connection.accountType === "wild-apricot"){
        localStorage.setItem("waApiKey", fields.apiKey);
        const response = await getWildApricotAccessToken({apiKey: fields.apiKey})
        localStorage.setItem("waAccessToken", response.accessToken);
        localStorage.setItem("waRefreshToken", response.refreshToken);
        setIsAppConnectedToAccountBridgeMap((prevMap) => {
          const newMap = new Map(prevMap);
          newMap.set('wild-apricot', true);
          return newMap;
        });

      }
      setErrorMsg("")
    }
    catch(e){
      console.log(e)
      setErrorMsg("Error connecting to app");
    }
  }

  const handleConnection = async (credentials: {}, connection: IConnection) => {
    setConnectionLoading(connection.accountType, true);

    const connectionBody: IConnectionBody = {
      accountType: connection.accountType,
      accountName: `${connection.title} Connection`,
      scopes: connection.scopes,
      ...credentials
    };

    try {
      const connectionResponse = await createConnection(connectionBody, teamId);
      console.log(connectionResponse)
      const connectionId = connectionResponse.data.id;
      const URL = `https://us1.make.com/api/v2/oauth/auth/${connectionId}`;

      const authWindow = openAuthWindow(URL);
      await monitorAuthWindow(authWindow, connectionId, connectionBody);

      setErrorMsg(""); // Clear error message on success
    } catch (error: any) {
      setConnectionLoading(connectionBody.accountType, false);
      setErrorMsg(error.response?.data?.error + connectionBody.accountName || "An error occurred");
      console.error(error);
    }
  };

  useEffect(() => {
    const listConnections = async () => {
      try {
        const response = await getConnections(teamId);

        // Update `isConnectedMap` directly using `response.data`
        setIsConnectedMap((prevMap) => {
          const newMap = new Map(prevMap);

          for (const connection of response.data.data) {
            if (newMap.has(connection.accountName)) {
              newMap.set(connection.accountName, true);
            }
          }

          return newMap; // Return the updated map
        });

        setIsAppConnectedToAccountBridgeMap(prevMap => {
          const newMap = new Map(prevMap);

          if(localStorage.getItem('qbAccessToken') && (localStorage.getItem('qbRefreshToken'))){
            newMap.set('quickbooks', true);
          }
          if(localStorage.getItem('waAccessToken') && (localStorage.getItem('waRefreshToken'))){
            newMap.set('wild-apricot', true);
          }
          return newMap
        })
      } catch (error) {
        console.error("Failed to fetch connections:", error.response?.data?.error || error.message);
        setErrorMsg("Failed to fetch connections: " + error.response?.data?.error || "Ask for help")
      }
      finally {
        setTimeout(() => {
          setIsContentLoading(false);
        }, 500)
      }
    };

    listConnections();
  }, []); // Empty dependency array ensures this runs once

  const handleNextPage = () => {
    if(Array.from(isConnectedMap).some(val => !val[1]) || Array.from(isAppConnectedToAccountBridgeMap).some(val => !val[1])){
      setErrorMsg("Connect to all apps to continue")
    }
    else{
      markStepAsCompleted('/create-connections');
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
  }

  return (
    <PageTemplate title={'Connect your Tools'} subTitle={'Set up your app connections to automate your workflows.'} validate={handleNextPage} errorMsg={errorMsg}>
      <div>
        <h6 className={'mb-3 ms-2 fw-light'}>Connect To Make</h6>
        <div className={'row mb-5 g-4'}>
          {connectionsList.map((connection, index) => <ConnectionComponent key={index} isLoading={isLoadingMap.get(connection.accountType) || false} createConnection={handleConnection} isConnected={isConnectedMap.get(connection.accountType) || false} connection={connection}/>)}
        </div>
        <h6 className={'mb-3 ms-2 fw-light'}>Connect To AccountBridge</h6>
        <div className={'row mb-3 g-4'}>
          {accountBridgeConnectionsList.map((connection, index) => <ConnectionComponent key={index} isLoading={isLoadingMap.get(connection.accountType) || false} createConnection={createConnectionToAccountBridge} isConnected={isAppConnectedToAccountBridgeMap.get(connection.accountType) || false} connection={connection}/>)}
        </div>
      </div>
    </PageTemplate>
  )
}