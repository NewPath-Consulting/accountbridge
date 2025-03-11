import './PaymentConfig.css'
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import * as React from "react";
import {useEffect, useReducer, useRef, useState} from "react";
import {getTenders} from "../../services/api/wild-apricot-api/tenderService.ts";
import {useNavigate} from "react-router-dom";
import {fetchData} from "../../services/fetchData.ts";
import AlternateMappingTable from "../../components/alternate-mapping-table/AlternateMappingTable.tsx";
import {tableColumns} from "../../components/alternate-mapping-table/tableColumns.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";

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
    default:
      return state;
  }
}

export const PaymentConfigPage = () => {
  const { onBoardingData, updateData, getNextStep, markStepAsCompleted } = useOnBoarding();

  const [errorMsg, setErrorMsg] = useState<string | string[]>('');
  const [qbPaymentMethods, setQBPaymentMethods] = useState([]);
  const [WildApricotTenders, setWildApricotTenders] = useState([]);
  const [depositAccountsList, setDepositAccountsList] = useState([]);
  const [qbDepositAccount, setQBDepositAccount] = useState<Account>(onBoardingData.qbDepositAccount ?? {accountId: "", accountName: ""})

  const [paymentMappingList, dispatch] = useReducer(reducer, onBoardingData.paymentMappingList ?? [{ WATender: '', QBTender: '', QBTenderId: ''}]);

  const errorRef = useRef(null)

  const navigate = useNavigate()

  useEffect(() => {
    fetchData("select * from paymentmethod", setQBPaymentMethods, "PaymentMethod", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)
    fetchData("select * from account where AccountType IN ('Other Current Asset', 'Bank')", setDepositAccountsList, "Account", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)

    const listTenders = async () => {
      try{
        const tenders = await getTenders(onBoardingData.generalInfo.accountId || '221748')
        setWildApricotTenders(tenders.data.map(tender => tender.Name))
      }
      catch (e){
        setWildApricotTenders([]);
        setErrorMsg(e.response.data.error)
      }
    }

    listTenders()
  }, []);

  useEffect(() => {
    updateData({
      paymentMappingList,
      qbDepositAccount,
    });
  }, [paymentMappingList, qbDepositAccount]);

  const handleSubmission = () => {

    const errors = validateConfig();

    if(errors.length > 0){
      setErrorMsg(errors)
      return
    }

    markStepAsCompleted('/payment-config');
    const nextStep = getNextStep();
    if (nextStep) {
      navigate(nextStep);
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

  return (
    <PageTemplate
      title={'Payment Configuration'}
      subTitle={'Easily match payment fields from Wild Apricot to QuickBooks for a smooth and accurate integration process.'}
      backUrl={'/invoice-config'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
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
        <h6>Payment Method Mapping</h6>
        <p className={'mb-3'}>Map your WildApricot payment methods to one of your QuickBooks payment methods from the dropdown</p>
        <AlternateMappingTable columns={tableColumns.payment} data={{WildApricotTenders, qbPaymentMethods}} mappingData={paymentMappingList} onMappingChange={handleMapping}/>
      </div>
    </PageTemplate>

  )
}