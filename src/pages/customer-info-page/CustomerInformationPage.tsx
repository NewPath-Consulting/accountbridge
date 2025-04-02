import './CustomerInformation.css'
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {
  getContactFields,
  getWildApricotAccounts
} from "../../services/api/wild-apricot-api/accountsService.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {updateDataRecord} from "../../services/api/make-api/dataStructuresService.ts";
import {formatCustomerInfo} from "../../utils/formatter.ts";
import {generateMapping} from "../../services/api/generate-mapping-api/generateMapping.ts";
import {BlurryOverlay} from "../../components/cloning-animation/BlurryOverlay.tsx";

export interface ICustomerInfo {
  firstName: string,
  lastName: string,
  organization: string,
  address: string,
  city: string,
  country: string,
  email: string,
  phoneNumber: string,
  state: string
  displayName: string,
  userId : string
}

export const CustomerInformationPage = () => {
  const {onBoardingData, updateData, markStepAsCompleted, getNextStep, updateOnboardingStep} = useOnBoarding();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldNames, setFieldNames] = useState([]);
  const [isGenerateMappingLoading, setIsGenerateMappingLoading] = useState(false)
  const [isContentLoading, setIsContentLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<ICustomerInfo>({
    city: "",
    country: "",
    email: "",
    firstName: "",
    lastName: "",
    organization: "",
    phoneNumber: "",
    state: "",
    address: "",
    displayName: "",
    userId: ""
  })

  const [formErrors, setFormErrors] = useState<ICustomerInfo>({
    address: "",
    city: "",
    country: "",
    displayName: "",
    email: "",
    firstName: "",
    lastName: "",
    organization: "",
    phoneNumber: "",
    state: "",
    userId: ""
  })

  useEffect(() => {
    if(Object.keys(onBoardingData.customerInfo).length !== 0) {
      setFormData(onBoardingData.customerInfo)
    }

    const getAccountInfo = async() => {
      try{
        setIsContentLoading(true)
        const userInfo = await getWildApricotAccounts();
        const { Id } = userInfo.data[0]

        const response = await getContactFields(Id);
        console.log(response)
        setFieldNames(response.data.sort((a, b) => a.FieldName.localeCompare(b.FieldName)));

      }
      catch(e){
        setErrorMsg("Error loading data from Wild Apricot: Invalid Token")
        console.log(e)
      }
      finally {
        setIsContentLoading(false)
      }
    }

    getAccountInfo()

  }, []);

  const handleGenerateMapping = async () => {
    try{
      setErrorMsg('')
      setIsGenerateMappingLoading(true)
      const response = await generateMapping(fieldNames.map(name => name.FieldName).toString(), 'You are a mapping assistant. When given a string of comma-separated field names, map each label to a corresponding Wild Apricot field name. Return the result as a JSON object where each label is mapped to a field name. Use the following labels: userId, firstName, lastName, email, phoneNumber, address, city, country, state, and organization. Do not include explanations or commentary, only the mapping.')

      const { message } = response.data

      setFormData(prev => ({...prev, ...message}))
    }
    catch (e){
      setErrorMsg(e.response.data.message || "Error mapping with AI")
    }
    finally {
      setIsGenerateMappingLoading(false)
    }
  }

  const validateForm = () => {
    const errors: ICustomerInfo = {
      address: "",
      city: "",
      country: "",
      displayName: "",
      email: "",
      firstName: "",
      lastName: "",
      organization: "",
      phoneNumber: "",
      state: "",
      userId: ""
    };
    if (!formData.firstName.trim()) errors.firstName = "First name is required.";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required.";
    if (!formData.organization.trim()) errors.organization = "Organization is required.";
    if (!formData.email.trim()) errors.email = "Valid email is required.";
    if (!formData.phoneNumber.trim()) errors.phoneNumber = "Phone number must be numeric.";
    if (!formData.city.trim()) errors.city = "City is required.";
    if (!formData.country.trim()) errors.country = "Country is required.";
    if (!formData.displayName.trim()) errors.displayName = "Display name is required.";
    if (!formData.address.trim()) errors.address = "Street Address is required.";
    if (!formData.state.trim()) errors.state = "State is required.";
    if (!formData.userId.trim()) errors.userId = "User ID is required.";
    return errors;
  }

  useEffect(() => {
    updateData({customerInfo: formData});
    console.log(fieldNames.map(name => name.FieldName))
  }, [formData]);

  const handleSubmit = async () => {
    try{
      setIsSaving(true);

      await updateOnboardingStep('/customer-info', {customerInfo: formData})
      await updateDataRecord('ca72cb0afc44', onBoardingData.teamId, {
        ...formatCustomerInfo(onBoardingData.customerInfo),
      })

      await markStepAsCompleted("/customer-information");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "unable to complete step")
    }
    finally {
      setIsSaving(false);
    }

  };

  const handleChange = (event) => {
    const {value, id} = event.target;

    setFormData({
      ...formData,
      [id]: value
    })

    console.log(formData)
  }


  return (
    <PageTemplate
      title={'Contact Configuration'}
      subTitle={'Map Customer Contact Fields for QuickBooks Transactions'}
      validate={handleSubmit}
      errorMsg={errorMsg}
      isLoading={isSaving}
    >
      <BlurryOverlay isLoading={isGenerateMappingLoading} message={isGenerateMappingLoading ? `Currently Mapping your Customer Information Fields. ` : errorMsg ? "Error Occurred!" : "Mapping Completed!"} icon={"stars"} subtitle={"Please wait while our system maps your field names ..."}/>
      <div>
        <div className={'d-flex justify-content-between align-items-center flex-wrap'}>
          <div className={'mb-4'}>
            <h5 >Wild Apricot Information</h5>
            <p>Select a Wild Apricot field from the dropdown to match your custom label and ensure correct customer details in QuickBooks.</p>
          </div>
          <button className={"ai-btn"} onClick={handleGenerateMapping}>
            <i className={'bi bi-stars'} style={{color: 'black'}}></i>
            Map with AI
          </button>
        </div>
        <div className={"form-content"}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <h6>Company Info <i className={'bi bi-person-circle ms-2'}></i></h6>
              <p>Map labels related to company info</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="row">
                <div className="col mb-3 placeholder-glow">
                  <label htmlFor="userId" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>User ID</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="userId" value={formData.userId}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.userId}</p>

                </div>
                <div className="col placeholder-glow">
                  <label htmlFor="organization" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Organization</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="organization" value={formData.organization}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.organization}</p>
                </div>
              </div>

              <div className="row">
                <div className="col placeholder-glow">
                  <label htmlFor="firstName" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>First Name</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="firstName" value={formData.firstName}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.firstName}</p>

                </div>
                <div className="col placeholder-glow">
                  <label htmlFor="lastName" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Last Name</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="lastName" value={formData.lastName}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.lastName}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Contact Info <i className={'bi bi-send-fill ms-2'}></i></h6>
              <p>Map labels related to contact info</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="mb-3 placeholder-glow">
                <label htmlFor="email" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Email Address</label>
                <div className="input-group placeholder-glow"  defaultValue={"Choose Field Name"}>
                  {!isContentLoading ?
                    <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="email" value={formData.email}>
                      <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>:
                    <span className="placeholder p-3 rounded-2 col-12"></span>
                  }
                </div>
                <p style={{color: 'red'}}>{formErrors.email}</p>
              </div>
              <div className="mb-3 placeholder-glow">
                <label htmlFor="phoneNumber" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Phone Number</label>
                <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                  {!isContentLoading ?
                    <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="phoneNumber" value={formData.phoneNumber}>
                      <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select> :
                    <span className="placeholder p-3 rounded-2 col-12"></span>
                  }
                </div>
                <p style={{color: 'red'}}>{formErrors.phoneNumber}</p>

              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Location Info <i className={'bi bi-geo-alt-fill ms-2'}></i></h6>
              <p>Map labels related to company location</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="row">
                <div className="col mb-3 placeholder-glow">
                  <label htmlFor="address" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Street Address</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="address" value={formData.address}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.address}</p>

                </div>
                <div className="col placeholder-glow">
                  <label htmlFor="country" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>Country</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="country" value={formData.country}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.country}</p>
                </div>
              </div>
              <div className="row">
                <div className="col placeholder-glow">
                  <label htmlFor="state" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>State</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="state" value={formData.state}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }
                  </div>
                  <p style={{color: 'red'}}>{formErrors.state}</p>
                </div>
                <div className="col placeholder-glow">
                  <label htmlFor="city" className={`form-label ${isContentLoading ? 'placeholder' : ''}`}>City</label>
                  <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                    {!isContentLoading ?
                      <select className={`form-select ${isContentLoading ? 'placeholder' : ''}`} onChange={handleChange} id="city" value={formData.city}>
                        <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                        {
                          fieldNames.map(name => {
                            return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                          })
                        }
                      </select> :
                      <span className="placeholder p-3 rounded-2 col-12"></span>
                    }

                  </div>
                  <p style={{color: 'red'}}>{formErrors.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5 className={"mt-4 mb-4"}>Quickbooks Information</h5>
        <div className="form-content">
          <div className="row">
            <div className="col-md-6 mb-3">
              <h6>Display Name</h6>
              <p>Choose your Display Name by selecting one of your contact fields</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="col">
                <div className="input-group placeholder-glow" defaultValue={"Choose Field Name"}>
                  {!isContentLoading ?
                    <select className={`form-select`} onChange={handleChange} value={formData.displayName} id="displayName">
                      <option value={""} hidden={isContentLoading} disabled={true}>Choose Field Name</option>
                      <option value={'{Full Name}'}>FullName</option>
                      <option value={'{Organization}'}>Organization</option>
                      <option value={'{Display Name}'}>Display Name</option>
                      <option value={'{Email}'}>Email</option>
                      <option value={'{User Id}'}>User ID</option>
                    </select> :
                    <span className="placeholder p-3 rounded-2 col-12"></span>
                  }
                </div>
                <p style={{color: 'red'}}>{formErrors.city}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTemplate>

  )
}