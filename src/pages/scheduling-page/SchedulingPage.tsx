import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useReducer, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import './Scheduling.css'
import {SchedulingComponent} from "../../components/scheduling-component/SchedulingComponent.tsx";
import {toast} from "react-toastify";
import {InvoiceConfiguration} from "../../typings/InvoiceConfiguration.ts";
import {updateDataRecord} from "../../services/api/make-api/dataStructuresService.ts";
import {
  formatCustomerInfo,
  formatDonationConfig,
  formatInvoiceConfig,
  formatPaymentConfig
} from "../../utils/formatter.ts";

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
  scheduledSchedule: { timePeriod: "", numOfTimePeriods: 1, dayOfMonth: 1, dayOfWeek: "", startTime: "" },
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
  const { updateData, onBoardingData, markStepAsCompleted, getNextStep, updateOnboardingStep } = useOnBoarding()
  const navigate = useNavigate()

  const [errorMsg, setErrorMsg] = useState('');

  const [invoiceScheduling, dispatchInvoice] = useReducer(schedulingReducer, onBoardingData.invoiceScheduling ??  initialState, init);
  const [paymentScheduling, dispatchPayment] = useReducer(schedulingReducer, onBoardingData.paymentScheduling ?? initialState, init);
  const [donationScheduling, dispatchDonation] = useReducer(schedulingReducer, onBoardingData.donationScheduling ?? initialState, init);

  const invoiceConfigurations: InvoiceConfiguration[] = [
    {
      invoiceOrderType: "MembershipApplication",
      defaultInvoiceMapping: onBoardingData.defaultMembershipProduct,
      alternateInvoiceMapping: onBoardingData.membershipLevelMappingList,
      accountReceivable: onBoardingData.accountReceivable
    },
    {
      invoiceOrderType: "MembershipRenewal",
      defaultInvoiceMapping: onBoardingData.defaultMembershipProduct,
      alternateInvoiceMapping: onBoardingData.membershipLevelMappingList,
      accountReceivable: onBoardingData.accountReceivable
    },
    {
      invoiceOrderType: "MembershipLevelChange",
      defaultInvoiceMapping: onBoardingData.defaultMembershipProduct,
      alternateInvoiceMapping: onBoardingData.membershipLevelMappingList,
      accountReceivable: onBoardingData.accountReceivable
    },
    {
      invoiceOrderType: "EventRegistration",
      defaultInvoiceMapping: onBoardingData.defaultEventProduct,
      alternateInvoiceMapping: onBoardingData.eventMappingList,
      accountReceivable: onBoardingData.accountReceivable
    },
    {
      invoiceOrderType: "OnlineStore",
      defaultInvoiceMapping: onBoardingData.defaultStoreProduct,
      alternateInvoiceMapping: onBoardingData.onlineStoreMappingList,
      accountReceivable: onBoardingData.accountReceivable
    },
    {
      invoiceOrderType: "Undefined",
      defaultInvoiceMapping: onBoardingData.manualInvoiceMapping,
      alternateInvoiceMapping: [],
      accountReceivable: onBoardingData.accountReceivable
    }
  ]

  useEffect(() => {
    updateData({ invoiceScheduling, paymentScheduling, donationScheduling})
  }, [invoiceScheduling, paymentScheduling, donationScheduling]);

  const handleSubmission = async () => {

    try{
      await updateOnboardingStep('/scheduling', { invoiceScheduling, donationScheduling, paymentScheduling })

      await updateDataRecord('ca72cb0afc44', onBoardingData.teamId, {
        ...formatCustomerInfo(onBoardingData.customerInfo),
        ...formatPaymentConfig(onBoardingData.paymentMappingList, onBoardingData.accountReceivable, onBoardingData.qbDepositAccount, onBoardingData.paymentScheduling),
        ...formatDonationConfig({
          defaultDonationConfig: onBoardingData.defaultDonationMapping,
          alternateDonationConfig: onBoardingData.donationMappingList,
          commentName: onBoardingData.donationComment,
          campaignName: onBoardingData.donationCampaign
        }, onBoardingData.donationScheduling),
        ...formatInvoiceConfig(invoiceConfigurations, onBoardingData.invoiceScheduling)
      })
      await markStepAsCompleted("/job-scheduling");

      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Error updating scheduling data")
    }

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