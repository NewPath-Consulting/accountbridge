import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useState} from "react";
import * as React from "react";
import {ConnectionComponent} from "../../components/connection-component/ConnectionComponent.tsx";
import {createConnection, getConnections, verifyConnection} from "../../services/api/make-api/connectionsService.ts";
import {useNavigate} from "react-router-dom";
import {getWildApricotAccessToken, wildApricotLogin} from "../../services/api/wild-apricot-api/authService.ts";
import {getQuickbooksAccessToken} from "../../services/api/quickbooks-api/authService.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";

export interface IConnection {
  img: string,
  title: string,
  description: string,
  accountType: string,
  scopes ?: string[],
  fields: {},
  secondaryFields ?: {};
}
const connectionsList: IConnection[] = [
  {
    img: "wa-logo.png",
    title: "WildApricot",
    description: "Connect to your Wild Apricot account to manage your organization's membership data and events.",
    accountType: "wild-apricot",
    scopes: ["auto"],
    fields: {"API Key": "apiKey"},
    secondaryFields: {"Client Id": "clientId", "Client Secret": "clientSecret"}
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
    fields: {},
    secondaryFields: {"Client Id": "clientId", "Client Secret": "clientSecret"}
  },
  {
    img: "mg-logo.png",
    title: "Mailgun",
    description: "Link your Mailgun account to handle all email communications with your members.",
    accountType: "mailgun2",
    fields: {"API Key": "apiKey", "Base Url": "baseUrl"}
  }
]

export const CreateConnectionsPage = () => {
  const {onBoardingData, updateData, setCurrentStep} = useOnBoarding();
  const [errorMsg, setErrorMsg] = useState("");
  const [isConnectedMap, setIsConnectedMap] = useState(() => {
    return new Map(
      connectionsList.map((connection) => [connection.accountType, false])
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

            // if (connectionBody.accountType === "wild-apricot") {
            //   localStorage.setItem("waApiKey", connectionBody.apiKey as string);
            //   await getWildApricotAccessToken({apiKey: connectionBody.apiKey as string});
            // }
            // else if(connectionBody.accountType === "quickbooks"){
            //   localStorage.setItem("qbClientId", connectionBody.clientId as string);
            //   localStorage.setItem("qbClientSecret", connectionBody.clientSecret as string)
            //   const response = await getQuickbooksAccessToken({clientSecret: connectionBody.clientSecret as string, clientId: connectionBody.clientId as string})
            //   const { authUri } = response;
            //   window.location.href = authUri;
            // }

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

  const createConnectionToNewPath = async (fields, connection: IConnection) => {

    try{
      if(connection.accountType === "quickbooks"){
        localStorage.setItem("qbClientId", fields.clientId);
        localStorage.setItem("qbClientSecret", fields.clientSecret)
        const response = await getQuickbooksAccessToken({clientSecret: fields.clientSecret, clientId: fields.clientId})
        const { authUri } = response.data;
        window.location.href = authUri;
      }
      else if(connection.accountType === "wild-apricot"){
        localStorage.setItem("waClientId", fields.clientId);
        localStorage.setItem("waClientSecret", fields.clientSecret);
        const response = await wildApricotLogin({clientSecret: fields.clientSecret, clientId: fields.clientId})
        const { ssoUrl } = response.data;
        console.log(response, ssoUrl)
        window.location.href = ssoUrl;
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
      const connectionResponse = await createConnection(connectionBody, 740188);
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
        const response = await getConnections(740188);

        console.log(response)
        // Update the context state with fetched connections
        updateData({ connections: response.data.data });

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
      } catch (error) {
        console.error("Failed to fetch connections:", error.response?.data?.error || error.message);
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
    if(Array.from(isConnectedMap).some(val => !val[1])){
      setErrorMsg("Connect to all apps to continue")
    }
    else{
      navigate('/customer-information')
    }
  }



  useEffect(() => {
    setCurrentStep(2)
    console.log(isConnectedMap)
  }, []);

  return (
    <PageTemplate title={'Connect your Tools'} subTitle={'Set up your app connections to automate your workflows.'} backUrl={'/'} validate={handleNextPage} errorMsg={errorMsg}>
      <div>
        <div className={'row mb-3'}>
          {connectionsList.map((connection, index) => <ConnectionComponent createConnectionToNewPath={createConnectionToNewPath} key={index} isLoading={isLoadingMap.get(connection.accountType) || false} createConnection={handleConnection} isConnected={isConnectedMap.get(connection.accountType) || false} connection={connection}/>)}
        </div>
      </div>
    </PageTemplate>
  )
}