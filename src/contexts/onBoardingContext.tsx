import {createContext, useEffect, useState} from "react";
import {AuthService} from "../services/httpClient.ts";
import {ICustomerInfo} from "../pages/customer-info-page/CustomerInformationPage.tsx";
import {IGeneralInformation} from "../pages/general-information-page/GeneralInformationPage.tsx";
import {IStep, ONBOARDING_STEPS} from "../onboardingSteps.tsx";
import {useLocation} from "react-router-dom";
import {DonationFieldName, DonationMapping} from "../pages/donation-config-page/DonationConfigPage.tsx";
import {InvoiceMapping} from "../pages/invoice-configuration-page/InvoiceConfigPage.tsx";
import {Account} from "../pages/payment-config-page/PaymentConfigPage.tsx";

export interface OnboardingState {
  credentials: {authToken: string, baseUrl: string}
  customerInfo: ICustomerInfo;
  generalInfo: IGeneralInformation,
  invoiceScheduling: any,
  paymentScheduling: any,
  donationScheduling: any,
  completedSteps: string[]; // Track completed step endpoints
  hasClasses: boolean,
  donationCampaignName: DonationFieldName,
  donationCommentName: DonationFieldName,
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
  markStepAsCompleted: (endpoint: string) => void;
  canAccessStep: (endpoint: string) => boolean;
  getNextStep: () => string | null;
  getPreviousStep: () => string | null;
}

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const getInitialOnboardingState = (): OnboardingState => {
  const savedBaseUrl = localStorage.getItem("baseUrl") || "";
  const savedAuthToken = localStorage.getItem("authToken") || "";

  return {
    credentials: {
      baseUrl: savedBaseUrl,
      authToken: savedAuthToken,
    },
    customerInfo: {} as ICustomerInfo,
    generalInfo: {} as IGeneralInformation,
    invoiceScheduling: null,
    paymentScheduling: null,
    donationScheduling: null,
    completedSteps: JSON.parse(localStorage.getItem("completedSteps") || "[]"),
    hasClasses: false,
    donationCampaignName: {AllowedValues: [], FieldName: "", Id: ""},
    donationCommentName: {AllowedValues: [], FieldName: "", Id: ""},
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
  const [steps, setSteps] = useState<IStep[]>(ONBOARDING_STEPS)


  const [onBoardingData, setOnBoardingData] = useState<OnboardingState>(getInitialOnboardingState);

  const currentStepIndex = steps.findIndex(step => step.endpoint === location.pathname);

  useEffect(() => {
    steps.forEach(step => {
      if(onBoardingData.completedSteps.includes(step.endpoint)){
        step.isCompleted = true
      }
    })
    console.log(steps)
  }, [onBoardingData.completedSteps]);

  useEffect(() => {
    if(onBoardingData.credentials.baseUrl && onBoardingData.credentials.authToken){
      AuthService.setAuth(onBoardingData.credentials.authToken, onBoardingData.credentials.baseUrl);
    }
  }, [onBoardingData.credentials.baseUrl, onBoardingData.credentials.authToken]);


  const updateData = (data) => {
    // Update context state
    setOnBoardingData((prev) => {
      const updatedData = { ...prev, ...data }

      // Persist only baseUrl and authToken in localStorage
      if (data.baseUrl) {
        localStorage.setItem("baseUrl", data.baseUrl);
      }
      if (data.authToken) {
        localStorage.setItem("authToken", data.authToken);
      }

      return updatedData;
    });
  };

  const markStepAsCompleted = (endpoint: string) => {
    // Update completedSteps in state
    if(onBoardingData.completedSteps.includes(endpoint))
      return;

    setOnBoardingData(prev => {
      const completedSteps = [...prev.completedSteps, endpoint];
      localStorage.setItem("completedSteps", JSON.stringify(completedSteps));
      return {...prev, completedSteps};
    });

    // Update steps array to set isCompleted flag
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.endpoint === endpoint
          ? {...step, isCompleted: true}
          : step
      )
    );
  }

  // Check if user can access a specific step
  const canAccessStep = (endpoint: string): boolean => {
    const targetIndex = steps.findIndex(step => step.endpoint === endpoint);
    const previousSteps = steps.slice(0, targetIndex);
    return previousSteps.every(step => onBoardingData.completedSteps.includes(step.endpoint));
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

  return (
    <OnboardingContext.Provider value={{onBoardingData, updateData, steps, currentStepIndex, canAccessStep, markStepAsCompleted, getNextStep, getPreviousStep}}>
      {children}
    </OnboardingContext.Provider>
  )
}