import * as React from "react";
import {IConnection} from "../../pages/create-connections-page/CreateConnections.tsx";
import {useEffect, useState} from "react";

interface IConnectionModal {
  connection: IConnection,
  postConnection: Function,
}

export const ConnectionModal = (props: IConnectionModal) => {
  const { connection, postConnection } = props;
  const [connectionFields, setConnectionFields] = useState(
    Object.keys(connection.fields).reduce((acc, key) => {
      acc[connection.fields[key]] = "";
      return acc;
    }, {})
  );


  const handleInput = (e) => {
    const {name, value} = e.target;

    setConnectionFields({
      ...connectionFields,
      [name]: value
    })
  }

  const callPostConnection = (e) => {
    e.preventDefault()
    postConnection(connectionFields)
  }

  return (
    <div className="modal fade" id={`${connection.modalId}`} tabIndex="-1" aria-labelledby={`${connection.modalId}Label`} aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5" id="exampleModalLabel">
              <img src={connection.img} width={30} className={"rounded-1 me-2"} alt={"app logo"}/>
              {connection.title}
            </h1>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <form onSubmit={(e) => callPostConnection(e)}>
              {
                Object.keys(connection.fields).map((field, index) => {
                  return (
                    <div className="mb-3" key={index}>
                    <label htmlFor={connection.modalId+'-'+connection.fields[field]} className="col-form-label">{field}:</label>
                    <input type={connection.fields[field] == 'clientSecret' || connection.fields[field] == 'apiKey' ? "password" : "text"} name={connection.fields[field]} value={connectionFields[field]} placeholder={""} onChange={handleInput} className="form-control" id={connection.modalId+'-'+connection.fields[field]}  />
                  </div>
                  )
                })
              }
              <button data-bs-dismiss="modal" type="submit">
                Connect
              </button>
            </form>
          </div>
          <div className="modal-footer">
            <button data-bs-dismiss="modal" type="button">
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}