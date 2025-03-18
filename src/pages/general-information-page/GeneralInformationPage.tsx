import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {EventHandler, useEffect, useState} from "react";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import * as React from "react";
import moment from "moment-timezone";
import './GeneralInformation.css'
import {getWildApricotAccounts} from "../../services/api/wild-apricot-api/accountsService.ts";
import {useNavigate} from "react-router-dom";
import {configureQuickBooksUrl} from "../../services/api/quickbooks-api/accountService.ts";

export interface IGeneralInformation {
  organizationName: string,
  accountId: string,
  recordName: string,
  timeZone: string,
  QuickBooksUrl: string,
  fromEmailAddress: string,
  QuickBooksCountry: string,
  toEmailAddresses: string[],
}

export const GeneralInformationPage = () => {
  const {onBoardingData, updateData, getNextStep, markStepAsCompleted, updateOnboardingStep } = useOnBoarding()
  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState<string | string[]>('');
  const [WildApricotAccounts, setWildApricotAccounts] = useState([]);
  const [formData, setFormData] = useState<IGeneralInformation>({
    QuickBooksUrl: "", accountId: "", fromEmailAddress: "", organizationName: "", recordName: "", timeZone: "", QuickBooksCountry: "", toEmailAddresses: []
  })
  const [rawEmailInput, setRawEmailInput] = useState('');

  useEffect(() => {
    if(Object.keys(onBoardingData.generalInfo).length !== 0) {
      setFormData(prevState => ({...prevState, ...onBoardingData.generalInfo}))

      if(onBoardingData.generalInfo?.toEmailAddresses){
        setRawEmailInput(onBoardingData.generalInfo.toEmailAddresses.join(', '))
      }
    }
    const fetchWildApricotAccounts = async() => {
      try{
        const response = await getWildApricotAccounts();
        console.log(response.data)
        setWildApricotAccounts(response.data)

      }
      catch (e){
        setErrorMsg(e.data.error.message)
      }
    }

    fetchWildApricotAccounts()
  }, []);
  const handleSubmission = async () => {

    try{
      const errors = await validateForm();

      if(errors.length){
        setErrorMsg(errors)
        return
      }

      await updateOnboardingStep('/general-info', {generalInfo: formData})
      await markStepAsCompleted("/general-information");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Unable to complete step")
    }
  }

  useEffect(() => {
    updateData({generalInfo: formData});
  }, [formData]);

  const validateQuickBooksUrl = async() => {
    try{
      const response = await configureQuickBooksUrl(formData.QuickBooksUrl);
      console.log(response.data)
      return true
    }
    catch (e){
      return false
    }
  }

  const validateForm = async () => {
    const errors: string[] = [];

    const isUrlValid = await validateQuickBooksUrl();

    if(Object.keys(formData).some(key => formData[key] === "")){
      errors.push("Must fill in all fields.")
    }
    if(!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.fromEmailAddress)){
      errors.push("from email address must be a valid email address.")
    }

    if(!isUrlValid){
      errors.push("QuickBooks url is not valid.")
    }

    return errors
  }

  const handleFormData = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value})
  }

  const handleAccountChange = (e) => {
    const orgName = WildApricotAccounts.find(account => account.Id == e.target.value);
    setFormData({...formData, accountId: e.target.value, organizationName: orgName ?  orgName.Name : "", recordName: orgName ? `<${orgName.Name}>-<Master-Use>` : ""})
  }

  const handleToEmailAddressesChange = (e) => {
    const value = e.target.value;

    // If the input is empty, reset everything
    if (value.trim() === '') {
      setRawEmailInput("")
      setFormData({
        ...formData,
        toEmailAddresses: []
      });
      return;
    }

    // Store the raw input value and parsed emails
    setRawEmailInput(value)
    setFormData({
      ...formData,
      toEmailAddresses: value
        .split(',')
        .map(email => email.trim())
        .filter(email => email !== '') // Remove empty entries
    });
  }

  const displayEmails = () => {
    return formData.toEmailAddresses.map((email, index) => (
      <div
        key={index}
        className="d-inline-block badge text-success rounded-pill me-2 mt-2"
        style={{backgroundColor: '#e1ffe2'}}
      >
        {email}
      </div>
    ));
  };

  return (
    <PageTemplate
      title={'General Information'}
      subTitle={'Please fill in all company information fields'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <form>
        <h6>WildApricot Information</h6>
        <div className="form-content general-info" id={"general-info"}>
          <div className="row g-3 pb-5">
            <div className="col-md-5">
              <label htmlFor={'wa-account-id'}>WA Account ID</label>
              <p>Choose WA Account which has been pulled from your accounts</p>
            </div>
            <div className="col-md-7">
              <select className={'form-select form-select-sm'} value={formData.accountId} onChange={handleAccountChange} name={'accountId'} id={'wa-account-id'}>
                <option value={""}>Choose Account</option>
                {WildApricotAccounts.map(account => <option key={account.Id} value={account.Id}>{account.Name} - ({account.Id})</option>)}
              </select>
            </div>
            <div className="col-md-5">
              <label htmlFor={'wa-org-name'}> WA Org Name</label>
              <p>This field is populated when account is chosen</p>
            </div>
            <div className="col-md-7">
              <input
                value={formData.organizationName || ""} name={'organizationName'} onChange={handleFormData} type={"text"} id={'wa-org-name'} className={'form-control form-control-sm'} disabled={true} placeholder={''} maxLength={41}/>
            </div>
            <div className="col-md-5">
              <label htmlFor={'config-name'}>WA Config Record Name</label>
              <p>This field is populated when account is chosen</p>
            </div>
            <div className="col-md-7">
              <input value={formData.recordName || ""} name={'recordName'} onChange={handleFormData} id={'config-name'} type={"text"} disabled={true} placeholder={''} className={'form-control form-control-sm'}/>
            </div>
            <div className="col-md-5">
              <label htmlFor={'time-zone-input'}>Org Time Zone</label>
              <p>Must match your WA Time zone</p>
            </div>
            <div className="col-md-7">
              <select value={formData.timeZone} name={'timeZone'} onChange={handleFormData} id={'time-zone-input'} className="form-select form-select-sm">
                <option value={""}>Choose Time Zone</option>
                {
                  moment.tz.names().map((name, index) => {
                    return <option key={index} value={name}>{name}</option>
                  })
                }
              </select>
            </div>
          </div>
        </div>
        <h6 className={'mt-3'}>QuickBooks Version Information</h6>
        <div className="form-content general-info" id={""}>
          <div className="row g-3 pb-5">
            <div className="col-md-5">
              <label htmlFor={'country-input'}>QuickBooks Country</label>
              <p>Canada or US</p>
            </div>
            <div className="col-md-7">
              <select value={formData.QuickBooksCountry} name={'QuickBooksCountry'} onChange={handleFormData} id={'country-input'} className="form-select form-select-sm">
                <option value={""}>Choose Country</option>
                <option value={"US"}>US</option>
                <option value={"Canada"}>Canada</option>
              </select>
            </div>
            <div className="col-md-5">
              <label htmlFor={'qb-url'}>QuickBooks URL</label>
              <p>This is your app url for QuickBooks Online only. </p>
            </div>
            <div className="col-md-7">
              <input
                value={formData.QuickBooksUrl} name={'QuickBooksUrl'} onChange={handleFormData} type={"text"} id={'qb-url'} className={'form-control form-control-sm'} placeholder={'http://app.company.qbo.intuit.com'}/>
            </div>
          </div>
        </div>
        <h6 className={'mt-3'}>Notification Emails</h6>
        <div className="form-content general-info" id={"general-info"}>
          <div className="row g-3 pb-5">
            <div className="col-md-5">
              <label htmlFor={'from-email-input'}>From Email Address</label>
              <p>All success and ERROR files will be sent "from" this email (one email address only)</p>
            </div>
            <div className="col-md-7">
              <input
                value={formData.fromEmailAddress} name={'fromEmailAddress'} required={true} onChange={handleFormData} type={"email"} id={'from-email-input'} className={'form-control form-control-sm'} placeholder={'ex. user123@gmail.com'}/>
            </div>
            <div className="col-md-5">
              <label htmlFor={'to-email-input'}>To Email Addresses</label>
              <p>Specify email recipients for success and error notifications. Use commas to separate multiple addresses.</p>
            </div>
            <div className="col-md-7">
              <input
                value={rawEmailInput}
                required={true}
                onChange={handleToEmailAddressesChange}
                type={"text"}
                id={'to-email-input'}
                className={'form-control form-control-sm'}
                placeholder={'ex. user123@gmail.com, user456@gmail.com'}
              />
              <div className="d-flex flex-wrap">
                {displayEmails()}
              </div>
            </div>
          </div>
        </div>
      </form>
    </PageTemplate>
  )

}