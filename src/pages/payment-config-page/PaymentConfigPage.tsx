import './PaymentConfig.css'
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import * as React from "react";
import {JSX, useEffect, useReducer, useRef, useState} from "react";
import {getTenders} from "../../services/api/wild-apricot-api/tenderService.ts";
import {useNavigate} from "react-router-dom";
import {fetchData} from "../../services/fetchData.ts";
import AlternateMappingTable from "../../components/alternate-mapping-table/AlternateMappingTable.tsx";
import {tableColumns} from "../../components/alternate-mapping-table/tableColumns.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {updateDataRecord} from "../../services/api/make-api/dataStructuresService.ts";
import {formatInvoiceConfig, formatPaymentConfig} from "../../utils/formatter.ts";
import {BlurryOverlay} from "../../components/cloning-animation/BlurryOverlay.tsx";
import {generateMapping} from "../../services/api/generate-mapping-api/generateMapping.ts";
import {useToast} from "react-toastify";

export interface PaymentConfig {
  WATender: string,
  QBTender: string,
  QBTenderId: string
}

export interface Account {
  accountName: string,
  accountId: string
}

const reducer = (state, action) => {
  switch (action.type) {
    case "ADD_ROW":
      return [...state, { WATender: '', QBTender: '', QBTenderId: ''}]; // Append new row
    case "DELETE_ROW":
      return state.filter((_, index) => index !== action.payload.index); // Remove row at index
    case "CHANGE_WA_FIELD":
      return state.map((row, index) =>
        index === action.payload.index
          ? { ...row, ["WATender"]: action.payload.value } // Update specific field
          : row
      );
    case "CHANGE_QB_FIELD":
      return state.map((row, index) =>
        index === action.payload.index
          ? { ...row, ["QBTenderId"]: action.payload.value,  ["QBTender"]: action.payload.name} // Update specific field
          : row
      );
    case "SET_MAPPING":
      if (!Array.isArray(action.payload)) {
        console.error("SET_MAPPING payload is not an array:", action);
        return state;
      }

      return action.payload
    default:
      return state;
  }
}

export const PaymentConfigPage = () => {
  const { onBoardingData, updateData, getNextStep, markStepAsCompleted, updateOnboardingStep } = useOnBoarding();

  const [errorMsg, setErrorMsg] = useState<string | string[]>('');
  const [qbPaymentMethods, setQBPaymentMethods] = useState([]);
  const [WildApricotTenders, setWildApricotTenders] = useState([]);
  const [depositAccountsList, setDepositAccountsList] = useState([]);
  const [qbDepositAccount, setQBDepositAccount] = useState<Account>(onBoardingData.qbDepositAccount ?? {accountId: "", accountName: ""})
  const [isGenerateMappingLoading, setIsGenerateMappingLoading] = useState(false)
  const [isTendersLoading, setTendersLoading] = useState(true);
  const [paymentMappingList, dispatch] = useReducer(reducer, onBoardingData.paymentMappingList ?? [{ WATender: '', QBTender: '', QBTenderId: ''}]);

  const errorRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {

    const getAllTenders = async() => {

      try{
        await Promise.all([
          fetchData("select * from paymentmethod", setQBPaymentMethods, "PaymentMethod", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          fetchData("select * from account where AccountType IN ('Other Current Asset', 'Bank')", setDepositAccountsList, "Account", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          listWATenders()
        ])
      }
      catch (e){
        setErrorMsg(e.response.data.error)
      }
      finally {
        setTendersLoading(false)
      }
    }

    getAllTenders()

  }, []);

  const listWATenders = async () => {
    try{
      const tenders = await getTenders(onBoardingData.generalInfo.accountId)
      setWildApricotTenders(tenders.data.map(tender => tender.Name))
    }
    catch (e){
      setWildApricotTenders([]);
      setErrorMsg(e.response.data.error)
    }
  }

  useEffect(() => {
    updateData({
      paymentMappingList,
      qbDepositAccount,
    });

  }, [paymentMappingList, qbDepositAccount]);

  const handleSubmission = async () => {

    try{
      const errors = validateConfig();

      if(errors.length > 0){
        setErrorMsg(errors)
        return
      }

      await updateOnboardingStep('/payment-config', { paymentMappingList, qbDepositAccount})
      await updateDataRecord('ca72cb0afc44', onBoardingData.teamId, {
        ...formatPaymentConfig(onBoardingData.paymentMappingList, onBoardingData.accountReceivable, onBoardingData.qbDepositAccount, onBoardingData.paymentScheduling),
      })

      await markStepAsCompleted("/payment-config");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Cannot save payment mappings")
    }

  }

  const handleMapping = (type, payload) => {
    dispatch({type, payload})
    console.log(paymentMappingList, "hello")
  }

  const handleAccountChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const accountId = selectedOption.value; // option's value
    const accountName = selectedOption.text;  // option's name (text inside <option>)

    setQBDepositAccount({accountId, accountName})

  }

  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMsg]);

  const validateConfig = () => {
    let errors = [];

    if(!qbDepositAccount.accountName || !qbDepositAccount.accountId){
      errors.push('Please select a deposit account. ')
    }

    paymentMappingList.forEach((row, index) => {
      if (!row.WATender || !row.QBTender || !row.QBTenderId) {
        errors.push(`Row ${index + 1} in Payment Tender Mapping is incomplete.`);
      }
    });

    // if(paymentMappingList.length != WildApricotTenders.length){
    //   errors.push("Please map all WildApricot Tenders to a Quickbooks Payment Method. ")
    // }

    return errors;
  };

    const handleGenerateMapping = async () => {
      try{
        setErrorMsg('')
        setIsGenerateMappingLoading(true)

        const waTenders = `WA_Tenders: ${WildApricotTenders.filter((j, i) => i < 7).join(', ')}`;
        const qbMethods = JSON.stringify(qbPaymentMethods.map(method => ({
          name: method.Name,
          ID: method.Id
        })));

        const prompt = `
        ${waTenders}
        QB_Payment_Methods: ${qbMethods}
        `;

        const instructions = `
        You are a mapping assistant. 
        When given:
        - A comma-separated string of Wild Apricot (WA) tenders.
        - An array of QuickBooks (QB) payment methods with "Name" and "ID" attributes.
        
        Map each WA tender to the matching QB "Name" and keep the corresponding "ID". 
        Return the result as an array of objects in this format: 
        [{ "WATender": "WA_tender_name", "QBTender": "QB_name", "QBTenderId": "QB_ID" }]. 

        Ensure all WA payment methods are mapped to a QB payment method to the best of your ability.  
        No explanations or commentary—only return the JSON output.
        `;

        const response = await generateMapping(prompt, instructions);

        const { message } = response.data

        dispatch({type: "SET_MAPPING", payload: message})
        console.log(message)

      }
      catch (e){
        setErrorMsg(e.response.data.message || "Error mapping with AI")
      }
      finally {
        setIsGenerateMappingLoading(false)
      }
    }


  return (
    <PageTemplate
      title={'Payment Configuration'}
      subTitle={'Easily match payment fields from Wild Apricot to QuickBooks for a smooth and accurate integration process.'}
      backUrl={'/invoice-config'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <BlurryOverlay isLoading={isGenerateMappingLoading} message={isGenerateMappingLoading ? `Currently Mapping your Payment Method Fields. ` : errorMsg ? "Error Occurred!" : "Mapping Completed!"} icon={"stars"} subtitle={"Please wait while our system maps your field names ..."}/>

      <div className="default-payment-mapping">
        <h6>Default Payment Mapping</h6>
        <p className={'mb-3 mt-2'}>Map your QuickBooks payment deposit account to your QuickBooks receivables account by selecting each from the dropdowns below</p>
        <div className="row">
          <div className={'col-md-6'}>
            <div className="input-group mb-3">
              <label className="input-group-text" htmlFor="qb-deposit-account"><i className={'bi bi-receipt'}></i></label>
              <select
                className="form-select"
                id={`qb-deposit-account`}
                value={qbDepositAccount.accountId}
                onChange={handleAccountChange}
              >
                <option value="">
                  Choose QB Payment Deposit Account
                </option>
                {depositAccountsList.map((option) => (
                  <option key={option.Id} value={option.Id}>
                    {option.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className={'payment-mapping'}>

        <div className={'d-flex justify-content-between align-items-center flex-wrap'}>
          <div>
            <h6>Payment Method Mapping</h6>
            <p className={'mb-3'}>Map your WildApricot payment methods to one of your QuickBooks payment methods from the dropdown</p>
          </div>
          <button className={"ai-btn mb-3"} onClick={handleGenerateMapping}>
            <i className={'bi bi-stars'} style={{color: 'black'}}></i>
            Map with AI
          </button>
        </div>

        <AlternateMappingTable columns={tableColumns.payment} data={{WildApricotTenders, qbPaymentMethods}} mappingData={paymentMappingList} onMappingChange={handleMapping}/>
      </div>
    </PageTemplate>

  )
}