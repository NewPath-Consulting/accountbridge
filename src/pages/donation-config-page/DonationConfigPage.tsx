import * as React from "react";
import {useEffect, useReducer, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {
  DefaultMappingTable,
  DefaultMappingTableProps
} from "../../components/default-mapping-table/DefaultMappingTable.tsx";
import {fetchData} from "../../services/fetchData.ts";
import {InvoiceMapping} from "../invoice-configuration-page/InvoiceConfigPage.tsx";
import {getDonationFields} from "../../services/api/wild-apricot-api/donationsService.ts";
import AlternateMappingTable from "../../components/alternate-mapping-table/AlternateMappingTable.tsx";
import {tableColumns} from "../../components/alternate-mapping-table/tableColumns.ts";
import {donationTableReducer} from "../../hooks/tableReducer.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {useToast} from "react-toastify";

export interface DonationMapping extends InvoiceMapping {
  depositAccount: string,
  depositAccountId: string,
}

interface DepositDefaultMappingProps extends DefaultMappingTableProps<DonationMapping> {
  depositAccountList: any[]
}
const ExtendedMappingTable = (props: DepositDefaultMappingProps) => {
  // Function for the new column
  const handleAccountChange = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const id = selectedOption.value; // option's value
    const name = selectedOption.text;  // option's name (text inside <option>)

    props.onMappingChange({depositAccountId: id, depositAccount: name})
  };

  return (
    <DefaultMappingTable {...props}>
      <td>
        <select
          className="form-select"
          id={`qb-deposit-account`}
          value={props.defaultData.depositAccountId}
          onChange={handleAccountChange}
        >
          <option value="">
            Choose Deposit Account
          </option>
          {props.depositAccountList.map((option) => (
            <option key={option.Id} value={option.Id}>
              {option.Name}
            </option>
          ))}
        </select>
      </td>
    </DefaultMappingTable>
  );
};

export interface DonationFieldName {
  Id: string,
  FieldName: string,
}

export const DonationConfigPage = () => {
  const { onBoardingData, updateData, markStepAsCompleted, getNextStep, updateOnboardingStep } = useOnBoarding();
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [donationFields, setDonationFields] = useState([]);
  const [donationCampaign, setDonationCampaign] = useState(onBoardingData.donationCampaign ?? {Id: "", FieldName: ""})
  const [donationComment, setDonationComment] = useState(onBoardingData.donationComment ?? {Id: "", FieldName: ""})

  const [campaignList, setCampaignList] = useState([]);

  const [defaultDonationMapping, setDefaultDonationMapping] = useState<DonationMapping>(onBoardingData.defaultDonationMapping ?? {
    depositAccount: "",
    depositAccountId: "",
    QBProduct: "",
    QBProductId: "",
    IncomeAccount: "",
    class: "",
    classId: ""
  });

  const [donationMappingList, dispatchDonationMappingList] = useReducer(donationTableReducer, onBoardingData.donationMappingList ?? [{ depositAccount: "", depositAccountId: "", WAFieldName: '', QBProduct: '', QBProductId: '', IncomeAccount: '', class: '', classId: ''}])

  const errorRef = useRef(null)

  useEffect(() => {
    fetchData("select * from item", setProducts, "Item", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)
    fetchData("select * from class", setClasses, "Class", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)
    fetchData("select * from account where AccountType = 'Bank'", setAccountList, "Account", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)



    const listDonationFields = async () => {
      try{
        const donationFields = await getDonationFields(onBoardingData.generalInfo.accountId || '221748')
        setDonationFields(donationFields.data)
      }
      catch (e){
        setDonationFields([]);
        setErrorMsg(e.response.data.error)
      }
    }

    listDonationFields()

  }, []);


  useEffect(() => {
    const donationCampaignObj = donationFields.find(field => field.Id == donationCampaign.Id) ?? {
      AllowedValues: [],
      FieldName: "",
      Id: ""
    };

    console.log(donationCampaign.Id, donationFields)

    setCampaignList(donationCampaignObj.AllowedValues.filter(({Label}) => {
      return Label != null
    }).map(val => {
      return val
    }));

  }, [donationCampaign, donationFields]);

  const handleChange = (fields) => {
    setDefaultDonationMapping(prev => ({
      ...prev,
        ...fields
    }))

    console.log(defaultDonationMapping)
  }

  const handleFieldNameChange = (e, fieldName) => {

    const donationObj = donationFields.find(field => field.Id == e.target.value) ?? {
      AllowedValues: [],
      FieldName: "",
      Id: ""
    };

    (fieldName === 'campaign' ? setDonationCampaign : setDonationComment)(donationObj);
  };

  useEffect(() => {
    updateData({donationMappingList, defaultDonationMapping, donationComment, donationCampaign})
  }, [donationMappingList, defaultDonationMapping, donationComment, donationCampaign]);

  useEffect(() => {
    if (errorMsg && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [errorMsg]);

  const handleSubmission = async () => {
    try{
      await updateOnboardingStep('/donation-config', { donationCampaign, donationComment, defaultDonationMapping, donationMappingList})
      await markStepAsCompleted("/donation-config");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Cannot save donation mapping")
    }

  }

  return (
    <PageTemplate
      title={'Donation Configuration'}
      subTitle={'Review your mapping configurations and confirm to start cloning scenarios into your Make.com account'}
      backUrl={'/payment-config'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <div className={'generic-default-donation'}>
        <h6>Donation General Mapping</h6>
        <p className={'mb-3 mt-2'}>Choose your QuickBooks fields below where default mapping will occur</p>
        <div className="row">
          <div className="col-md-6 col-sm-12 mb-3">
            <select
              className="form-select"
              id={`wa-campaign`}
              value={donationCampaign.Id || ""}
              onChange={(e) => handleFieldNameChange(e, "campaign")}
            >
              <option value="">
                Choose Donation Campaign Field Name
              </option>
              {donationFields.map((option) => (
                <option key={option.Id} value={option.Id}>
                  {option.FieldName}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6 col-sm-12">
            <select
              className="form-select"
              id={`wa-comment`}
              value={donationComment.Id || ""}
              onChange={(e) => handleFieldNameChange(e, "comment")}
            >
              <option value="">
                Choose Donation Comment Field Name
              </option>
              {donationFields.map((option) => (
                <option key={option.Id} value={option.Id}>
                  {option.FieldName}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className={'default product'} >
        <div className={'default-donation-table'}>
          <h6>Default Donation Mapping</h6>
          <p className={'mb-3 mt-2'}>Choose your QuickBooks fields below where default mapping will occur</p>
          <ExtendedMappingTable<DonationMapping> classesList={onBoardingData.hasClasses ? classes : undefined} headers={["Deposit Account", "QB Product", "Income Account", ...(onBoardingData.hasClasses ? ["Class"] : [])]} QBProducts={products} onMappingChange={handleChange} defaultData={defaultDonationMapping} depositAccountList={accountList}/>
        </div>
      </div>
      <div className={'default product'} >
        <div className={'default-donation-table'}>
          <h6>Donation Mapping</h6>
          <p className={'mb-3 mt-2'}>Choose your QuickBooks fields below where default mapping will occur</p>
          <AlternateMappingTable columns={[...tableColumns.donations, ...(onBoardingData.hasClasses ? tableColumns.classes : [])]} data={{accountList, products, campaignOptions: campaignList.map(val => val.Label), classes}} mappingData={donationMappingList} onMappingChange={(type, payload) => dispatchDonationMappingList({type, payload})}/>
        </div>
      </div>
    </PageTemplate>
  )
}