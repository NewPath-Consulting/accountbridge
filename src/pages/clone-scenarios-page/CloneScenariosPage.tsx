import * as React from "react";
import {useEffect, useRef, useState} from "react";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {ReviewConfigComponent} from "../../components/review-config-component/ReviewConfigComponent.tsx";
import {ReviewCustomerInfoPage} from "../review-customer-info-page/ReviewCustomerInfoPage.tsx";
import {useNavigate} from "react-router-dom";
import {ReviewPaymentConfigPage} from "../review-payment-config-page/ReviewPaymentConfigPage.tsx";
import {ReviewInvoiceConfigPage} from "../review-invoice-config-page/ReviewInvoiceConfigPage.tsx";
import {ReviewDonationConfigPage} from "../review-donation-config-page/ReviewDonationConfigPage.tsx";
import {
  formatDataRecord,
} from "../../utils/formatter.ts";
import {InvoiceConfiguration} from "../../typings/InvoiceConfiguration.ts";
import {cloneConfiguration} from "../../utils/handleCloneConfiguration.ts";
import {BlurryOverlay} from "../../components/cloning-animation/BlurryOverlay.tsx";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {ReviewSchedulingPage} from "../review-scheduling-page/ReviewSchedulingPage.tsx";
import {ReviewGeneralConfigPage} from "../review-general-config-page/ReviewGeneralConfigPage.tsx";


export const CloneScenariosPage = () => {

  const { onBoardingData, getNextStep, markStepAsCompleted } = useOnBoarding();
  const navigate = useNavigate();

  const [data, setData] = useState({});
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const errorRef = useRef(null)

  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },   [errorMsg]);

  useEffect(() => {

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

    setData(formatDataRecord(onBoardingData, invoiceConfigurations))

    console.log(onBoardingData)

  }, [onBoardingData]);

  const handleCloneConfiguration = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setIsLoading(true);

      const response = await cloneConfiguration(data, onBoardingData.teamId);

      console.log(response)
      // Success handling
      setSuccessMsg("Configuration cloned successfully!");
    } catch (error) {
      // Error handling
      setErrorMsg(error.response.data.error || "Configuration cloning failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmission = async () => {
    if(successMsg){
      await markStepAsCompleted("/clone-scenarios")
      const endpoint = getNextStep();
      if(endpoint){
        navigate(endpoint);
      }
    }

    else{
      await markStepAsCompleted("/clone-scenarios")
      const endpoint = getNextStep();
      if(endpoint){
        navigate(endpoint);
      }
    }
  }

  return (
    <PageTemplate
      title={'Review and Clone'}
      subTitle={'Review all of your data and configurations before automating the integration process. '}
      backUrl={'/job-scheduling'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <BlurryOverlay isLoading={isLoading} message={errorMsg ? "Error Occurred!" : successMsg ? successMsg : "Cloning your Workflows"}/>
      {successMsg && <div style={{fontSize:'13px'}} className="alert alert-success" role="alert">
          <i style={{color: "#245815"}} className={'bi bi-check-circle'}></i> {successMsg}
      </div>}

      <ReviewConfigComponent img={'bi-person-vcard'} title={'General Information'} urlLocation={'/general-information'}>
        <ReviewGeneralConfigPage/>
      </ReviewConfigComponent>


      <ReviewConfigComponent img={'bi-person'} title={'Customer Information'} urlLocation={'/customer-information'}>
        <ReviewCustomerInfoPage/>
      </ReviewConfigComponent>

      <ReviewConfigComponent img={'bi-file-text'} title={'Invoice Configuration'} urlLocation={'/invoice-config'}>
        <ReviewInvoiceConfigPage/>
      </ReviewConfigComponent>

      <ReviewConfigComponent img={'bi-credit-card'} title={'Payment Configuration'} urlLocation={'/payment-config'}>
        <ReviewPaymentConfigPage/>
      </ReviewConfigComponent>

      <ReviewConfigComponent img={'bi-piggy-bank'} title={'Donation Configuration'} urlLocation={'/donation-config'}>
        <ReviewDonationConfigPage/>
      </ReviewConfigComponent>

      <ReviewConfigComponent img={'bi-calendar'} title={'Job Scheduling'} urlLocation={'/job-scheduling'}>
        <ReviewSchedulingPage/>
      </ReviewConfigComponent>

      <button className={'m-0 bg-transparent p-0 d-flex align-items-center gap-2'} onClick={handleCloneConfiguration} style={{color: '#71DD93', fontSize: '14px'}}>
        Automate Workflows
        <i className={'bi bi-copy'} style={{color: '#71DD93'}}></i>
      </button>
    </PageTemplate>

  )
}