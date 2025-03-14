import './CustomerInformation.css'
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect, useState} from "react";
import * as React from "react";
import {useNavigate} from "react-router-dom";
import {
  getContactFields,
  getContactInfo,
  getWildApricotAccounts
} from "../../services/api/wild-apricot-api/accountsService.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";

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
  const {onBoardingData, updateData, markStepAsCompleted, getNextStep} = useOnBoarding();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldNames, setFieldNames] = useState([]);

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
    }

    getAccountInfo().then(response => {

    });

  }, []);

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
  }, [formData]);

  const handleSubmit = () => {
    console.log(onBoardingData)
    // const errors = validateForm();
    // if (Object.values(errors).some(value => value.trim() !== "")) {
    //   setFormErrors(errors);
    //   console.log(formErrors)
    //   setErrorMsg("Please fill in all required fields")
    // }
    // else {
    //   updateData({customerInfo: formData});
    //   navigate("/invoice-config")
    //   console.log(onBoardingData);
    // }
    markStepAsCompleted('/customer-information');
    const nextStep = getNextStep();
    if (nextStep) {
      navigate(nextStep);
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
      title={'Customer Information'}
      subTitle={'Provide your company details to personalize and streamline your integration experience.'}
      validate={handleSubmit}
      errorMsg={errorMsg}
    >
      <div>
        <h5 className={'mb-4'}>Wild Apricot Information</h5>
        <div className={"form-content"}>
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Company Info <i className={'bi bi-person-circle ms-2'}></i></h6>
              <p>Provide your company info</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="row">
                <div className="col mb-3">
                  <label htmlFor="userId" className="form-label">User ID</label>
                  <div className="input-group" defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="userId" value={formData.userId}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.userId}</p>

                </div>
                <div className="col">
                  <label htmlFor="organization" className="form-label">Organization</label>
                  <div className="input-group" defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="organization" value={formData.organization}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.organization}</p>
                </div>
              </div>

              <div className="row">
                <div className="col">
                  <label htmlFor="firstName" className="form-label ">First Name</label>
                  <div className="input-group" defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="firstName" value={formData.firstName}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.firstName}</p>

                </div>
                <div className="col">
                  <label htmlFor="lastName" className="form-label ">Last Name</label>
                  <div className="input-group" defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange}  id="lastName" value={formData.lastName}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.lastName}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Contact Info <i className={'bi bi-send-fill ms-2'}></i></h6>
              <p>Provide your contact info</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="mb-3">
                <label htmlFor="email" className="form-label ">Email Address</label>
                <div className="input-group"  defaultValue={"Choose Field Name"}>
                  <select className="form-select" onChange={handleChange} id="email" value={formData.email}>
                    <option value={""} disabled={true}>Choose Field Name</option>
                    {
                      fieldNames.map(name => {
                        return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                      })
                    }
                  </select>
                </div>
                <p style={{color: 'red'}}>{formErrors.email}</p>
              </div>
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label ">Phone Number</label>
                <div className="input-group" defaultValue={"Choose Field Name"}>
                  <select className="form-select" onChange={handleChange} id="phoneNumber" value={formData.phoneNumber}>
                    <option value={""} disabled={true}>Choose Field Name</option>
                    {
                      fieldNames.map(name => {
                        return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                      })
                    }
                  </select>
                </div>
                <p style={{color: 'red'}}>{formErrors.phoneNumber}</p>

              </div>
            </div>
          </div>
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Location Info <i className={'bi bi-geo-alt-fill ms-2'}></i></h6>
              <p>Provide your company location</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="row">
                <div className="col mb-3">
                  <label htmlFor="address" className="form-label ">Street Address</label>
                  <div className="input-group " defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="address" value={formData.address}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.address}</p>

                </div>
                <div className="col">
                  <label htmlFor="country" className=" form-label">Country</label>
                  <div className="input-group " defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="country" value={formData.country}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.country}</p>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <label htmlFor="state" className="form-label ">State</label>
                  <div className="input-group " defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="state" value={formData.state}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>
                  </div>
                  <p style={{color: 'red'}}>{formErrors.state}</p>
                </div>
                <div className="col">
                  <label htmlFor="city" className="form-label ">City</label>
                  <div className="input-group" defaultValue={"Choose Field Name"}>
                    <select className="form-select" onChange={handleChange} id="city" value={formData.city}>
                      <option value={""} disabled={true}>Choose Field Name</option>
                      {
                        fieldNames.map(name => {
                          return <option key={name.Id} value={name.FieldName}>{name.FieldName}</option>
                        })
                      }
                    </select>

                  </div>
                  <p style={{color: 'red'}}>{formErrors.city}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h5 className={"mt-4 mb-4"}>Quickbooks Information</h5>
        <div className="form-content">
          <div className="row ">
            <div className="col-md-6 mb-3">
              <h6>Display Name</h6>
              <p>Choose your Display Name by selecting one of your contact fields</p>
            </div>
            <div className="col-md-6 mb-3">
              <div className="col">
                <div className="input-group" defaultValue={"Choose Field Name"}>
                  <select className="form-select" onChange={handleChange} value={formData.displayName} id="displayName">
                    <option value={""} disabled={true}>Choose Field Name</option>
                    <option value={'{Full Name}'}>FullName</option>
                    <option value={'{Organization}'}>Organization</option>
                    <option value={'{Display Name}'}>Display Name</option>
                    <option value={'{Email}'}>Email</option>
                    <option value={'{User Id}'}>User ID</option>
                  </select>

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