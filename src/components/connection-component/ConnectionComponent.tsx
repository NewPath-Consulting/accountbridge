import {useRef, useState} from "react";
import './ConnectionComponent.css'
import * as React from "react";
import {IConnection} from "../../pages/create-connections-page/CreateConnections.tsx";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {ConnectionModal} from "../modal/ConnectionModal.tsx";
export interface ConnectionComponentProps {
  connection: IConnection,
  isConnected: boolean,
  createConnection: Function,
  isLoading: boolean,
}

export const ConnectionComponent: React.FC<ConnectionComponentProps> = ({isLoading, connection, isConnected, createConnection}) => {
  const {onBoardingData} = useOnBoarding();

  const postConnection = (connectionFields: {}) => {
    createConnection(connectionFields, connection);
  };

  return (
    <div className={'mb-3 col-md-4 col-sm-12'}>
      <div className={`instruction-container h-100 ${isConnected ? "completed" : ""}`}>
        <div className={'header'}>
          <div>
            <img src={connection.img} className={"rounded-1"} width={40} alt={"predefined images for each step"}/>
            {isConnected && <i className={'bi bi-check2-circle float-end'} style={{color: 'rgb(141,231,165)', fontSize: '18px'}}></i>}
          </div>
          <strong className={'fw-normal'}>{connection.title}</strong>
          <p style={{color: "gray", }}>{connection.description}</p>
        </div>
        <div className={`button-container` }>
          <button data-bs-toggle="modal" className={"align-self-baseline float-end"} data-bs-target={`#${connection.title}`}>
            {isConnected ? "View Connection" : "Connect"}
          </button>
        </div>
        <ConnectionModal postConnection={postConnection} connection={connection}/>
      </div>
    </div>
  )
}