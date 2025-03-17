import {createContext, useEffect, useState} from "react";
import {AuthService} from "../services/httpClient.ts";
import {ICustomerInfo} from "../pages/customer-info-page/CustomerInformationPage.tsx";
import {IGeneralInformation} from "../pages/general-information-page/GeneralInformationPage.tsx";
import {IStep, ONBOARDING_STEPS} from "../onboardingSteps.tsx";
import {useLocation} from "react-router-dom";
import {DonationFieldName, DonationMapping} from "../pages/donation-config-page/DonationConfigPage.tsx";
import {InvoiceMapping} from "../pages/invoice-configuration-page/InvoiceConfigPage.tsx";
import {Account} from "../pages/payment-config-page/PaymentConfigPage.tsx";
import {SchedulingData} from "../pages/scheduling-page/SchedulingPage.tsx";
import {useAuth} from "../hooks/useAuth.tsx";
import {getOnboardingData, updateOnboardingStep} from "../services/api/users-api/onboardingData.ts";
import endpoints from "../services/endpoints.ts";

export interface OnboardingState {
  teamId: number;
  onboardingStep: number,
  customerInfo: ICustomerInfo;
  generalInfo: IGeneralInformation,
  invoiceScheduling: SchedulingData | null,
  paymentScheduling: SchedulingData | null,
  donationScheduling: SchedulingData | null,
  hasClasses: boolean,
  donationCampaign: DonationFieldName,
  donationComment: DonationFieldName,
  defaultDonationMapping: DonationMapping,
  donationMappingList: any,
  accountReceivable: Account,
  defaultMembershipProduct: InvoiceMapping,
  defaultEventProduct: InvoiceMapping,
  defaultStoreProduct: InvoiceMapping,
  manualInvoiceMapping: InvoiceMapping,
  membershipLevelMappingList: any,
  eventMappingList: any,
  onlineStoreMappingList: any,
  qbDepositAccount: Account,
  paymentMappingList: any
}

export interface OnboardingContextType {
  onBoardingData: OnboardingState;
  updateData: (data: Partial<OnboardingState>) => void;
  currentStepIndex: number;
  steps: IStep[];
  markStepAsCompleted: (endpoint: string) => Promise<void>;
  canAccessStep: (endpoint: string) => boolean;
  getNextStep: () => string | null;
  getPreviousStep: () => string | null;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const getInitialOnboardingState = (): OnboardingState => {
  return {
    teamId: 0,
    onboardingStep: 1,
    customerInfo: {} as ICustomerInfo,
    generalInfo: {} as IGeneralInformation,
    invoiceScheduling: null,
    paymentScheduling: null,
    donationScheduling: null,
    hasClasses: false,
    donationCampaign: {Id: "", FieldName: ""} as DonationFieldName,
    donationComment: {Id: "", FieldName: ""} as DonationFieldName,
    defaultDonationMapping: {} as DonationMapping,
    donationMappingList: null,
    accountReceivable: {} as Account,
    defaultMembershipProduct: {} as InvoiceMapping,
    defaultEventProduct: {} as InvoiceMapping,
    defaultStoreProduct: {} as InvoiceMapping,
    manualInvoiceMapping: {} as InvoiceMapping,
    membershipLevelMappingList: null,
    eventMappingList: null,
    onlineStoreMappingList: null,
    qbDepositAccount: {} as Account,
    paymentMappingList: null
  };
};

export const OnBoardingProvider = ({children}) => {
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [steps, setSteps] = useState<IStep[]>(ONBOARDING_STEPS)


  const [onBoardingData, setOnBoardingData] = useState<OnboardingState>(getInitialOnboardingState);

  const currentStepIndex = steps.findIndex(step => step.endpoint === location.pathname);


  useEffect(() => {
    if (isInitialized) {
      setSteps(ONBOARDING_STEPS.map((step, index) => {
        return {
          ...step,
          isCompleted: index + 1 < onBoardingData.onboardingStep
        };
      }));
    }
  }, [isInitialized, onBoardingData.onboardingStep])


  useEffect(() => {
    const fetchOnboardingData = async() => {
      try{
        const response = await getOnboardingData(localStorage.getItem('accountbridge_token'))
        setOnBoardingData(prev => ({...prev, ...response.data}))
      }
      catch (e){
        throw new Error(e)
      }
      finally {
        setIsInitialized(true)
      }

    }

    fetchOnboardingData()
  }, []);

  useEffect(() => {
    console.log(onBoardingData)
  }, [onBoardingData]);

  const updateData = (data) => {
    // Update context state
    setOnBoardingData((prev) => {
      return { ...prev, ...data }
    });
  };

  const markStepAsCompleted = async (endpoint: string) => {

    const index = ONBOARDING_STEPS.findIndex(step => step.endpoint === endpoint)

    if(index + 1 < onBoardingData.onboardingStep) {
      return
    }

    setOnBoardingData(prev => {
      const updatedStep = onBoardingData.onboardingStep + 1;

      updateOnboardingStep(updatedStep, localStorage.getItem('accountbridge_token'));

      return { ...prev, onboardingStep: updatedStep };
    });
  };

  // Check if user can access a specific step
  const canAccessStep = (endpoint: string): boolean => {
    const targetIndex = steps.findIndex(step => step.endpoint === endpoint);
    return targetIndex < onBoardingData.onboardingStep
  };

  // Get the next available step
  const getNextStep = (): string | null => {
    const nextStep = steps[currentStepIndex + 1];
    return nextStep ? nextStep.endpoint : null;
  };

  const getPreviousStep = (): string | null => {
    if (currentStepIndex > 0) {
      return steps[currentStepIndex - 1].endpoint;
    }
    return null;
  };

  if(!isInitialized){
    return <></>
  }

  return (
    <OnboardingContext.Provider value={{onBoardingData, updateData, steps, currentStepIndex, canAccessStep, markStepAsCompleted, getNextStep, getPreviousStep}}>
      {children}
    </OnboardingContext.Provider>
  )
}