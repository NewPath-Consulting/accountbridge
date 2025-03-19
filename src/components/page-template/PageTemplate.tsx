import * as React from "react";
import {useNavigate} from "react-router-dom";
import {useEffect, useRef, useState} from "react";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";

interface PageTemplateProps {
  title: string,
  subTitle: string,
  validate: () => void,
  errorMsg: string | string[]
}

export const PageTemplate = ({ title, subTitle, validate, children, errorMsg}: PageTemplateProps) => {

  const { getPreviousStep } = useOnBoarding()
  const errorRef = useRef(null)
  const navigate = useNavigate();

  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMsg]);

  const renderErrorMsg = () => {
    if(Array.isArray(errorMsg)){
      return (
        <div style={{fontSize:'13px'}} className="alert alert-danger" role="alert">
          <strong className={'ms-3'}>Please complete all details</strong>
          <ul className={'mb-0 mt-1'}>
            {errorMsg.map((msg, index) => {
              return (
                <li key={index}>{msg}</li>
              )
            })}
          </ul>
        </div>
      )
    }
    return (
      <div style={{fontSize:'13px'}} className="alert alert-danger" role="alert">
        <i style={{color: "#58151c"}} className={'bi bi-exclamation-circle'}></i> {errorMsg}
      </div>
    )
  }

  return (
    <main ref={errorRef}>
      <header>
        <h2 >{title}</h2>
        <p>{subTitle}</p>
      </header>
      {errorMsg && renderErrorMsg()}
      {children}
      <div className="mt-4">
        <button className={"border-black border-2 text-black me-3 bg-transparent c"} type={"submit"} onClick={() => navigate(getPreviousStep() || '/')}>Back</button>
        <button className={"btn-success"} disabled={false} onClick={validate}>Save & Next</button>
      </div>
    </main>
  )
}