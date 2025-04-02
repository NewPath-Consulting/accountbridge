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
  isContentLoading: boolean
}

export const ConnectionComponent: React.FC<ConnectionComponentProps> = ({isLoading, connection, isConnected, createConnection, isContentLoading}) => {
  const postConnection = (connectionFields: {}) => {
    createConnection(connectionFields, connection);
  };

  return (
    <div className={'col-lg-4 col-md-6 col-sm-12 placeholder-glow'}>
        <div className={`h-100 ${isConnected ? "completed" : ""} ${isContentLoading ? 'placeholder' : ''} rounded-3 d-block`}>
          <div className={'instruction-container rounded-3'} style={{visibility: isContentLoading ? 'hidden' : 'visible'}}>
            <div className={'header'}>
              <div>
                <img src={connection.img} className={"rounded-1"} width={40} alt={"predefined images for each step"}/>
                {isConnected && <i className={'bi bi-check2-circle float-end'} style={{color: 'rgb(141,231,165)', fontSize: '18px'}}></i>}
              </div>
              <strong className={'fw-normal m-0'}>{connection.title}</strong>
              <p style={{color: "gray", }}>{connection.description}</p>
            </div>
            <div className={`button-container`}>
              <button data-bs-toggle="modal" className={"align-self-baseline float-end"} data-bs-target={`#${connection.modalId}`}>
                {isConnected ? "View Connection" : "Connect"}
              </button>
            </div>
            <ConnectionModal postConnection={postConnection} connection={connection}/>
          </div>

        </div>
    </div>
  )
}