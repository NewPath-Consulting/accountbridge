import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useReducer, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import './Scheduling.css'
import {SchedulingComponent} from "../../components/scheduling-component/SchedulingComponent.tsx";
import {toast} from "react-toastify";
import update = toast.update;

export interface ManualSchedule {
  startDate: string,
  endDate: string,
  docNumber: string
}

export interface ScheduledSchedule {
  timePeriod: string,
  numOfTimePeriods: number,
  dayOfWeek: string,
  dayOfMonth: number,
  startTime: string
}

export interface SchedulingData {
  jobType: string,
  manualSchedule: ManualSchedule,
  scheduledSchedule: ScheduledSchedule
}

export type Action =
  | { type: "SET_JOB_TYPE"; payload: string }
  | { type: "UPDATE_MANUAL_SCHEDULE"; payload: any }
  | { type: "UPDATE_SCHEDULED_SCHEDULE"; payload: any };

const initialState: SchedulingData = {
  jobType: "",
  manualSchedule: { startDate: "", endDate: "", docNumber: "" },
  scheduledSchedule: { timePeriod: "", numOfTimePeriods: 0, dayOfMonth: 1, dayOfWeek: "", startTime: "" },
};

const schedulingReducer = (state: SchedulingData, action: Action): SchedulingData => {
  switch (action.type) {
    case "SET_JOB_TYPE":
      return { ...state, jobType: action.payload };

    case "UPDATE_MANUAL_SCHEDULE":
      return { ...state, manualSchedule: { ...state.manualSchedule, ...action.payload } };

    case "UPDATE_SCHEDULED_SCHEDULE":
      return { ...state, scheduledSchedule: { ...state.scheduledSchedule, ...action.payload } };

    default:
      return state;
  }
};

const init = (state) => {
  return state
}

export const SchedulingPage = () => {
  const { setCurrentStep, updateData, onBoardingData } = useOnBoarding()
  const navigate = useNavigate()

  const [errorMsg, setErrorMsg] = useState('');

  const [invoiceScheduling, dispatchInvoice] = useReducer(schedulingReducer, onBoardingData.invoiceScheduling ??  initialState, init);
  const [paymentScheduling, dispatchPayment] = useReducer(schedulingReducer, onBoardingData.paymentScheduling ?? initialState, init);
  const [donationScheduling, dispatchDonation] = useReducer(schedulingReducer, onBoardingData.donationScheduling ?? initialState, init);

  useEffect(() => {
    setCurrentStep(7)
    console.log(onBoardingData)
  }, []);

  useEffect(() => {
    updateData({ invoiceScheduling, paymentScheduling, donationScheduling})
  }, [invoiceScheduling, paymentScheduling, donationScheduling]);

  const handleSubmission = () => {
    navigate('/clone-scenarios')
  }

  return (
    <PageTemplate
      title={'Job Scheduling'}
      subTitle={'Schedule your workflows either manually or automatically.'}
      backUrl={'/donation-config'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <SchedulingComponent title={'Invoice'} schedulingData={invoiceScheduling} dispatch={dispatchInvoice}/>
      <SchedulingComponent title={'Payment'} schedulingData={paymentScheduling} dispatch={dispatchPayment}/>
      <SchedulingComponent title={'Donation'} schedulingData={donationScheduling} dispatch={dispatchDonation}/>

    </PageTemplate>
  )
}