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
import {updateDataRecord} from "../../services/api/make-api/dataStructuresService.ts";
import {formatDonationConfig, formatInvoiceConfig} from "../../utils/formatter.ts";

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
      <td className={'placeholder-glow'}>
        {props.isContentLoading ? <span className="placeholder p-3 rounded-2 col-12"></span> :
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
        </select>}
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

  const [isContentLoading, setIsContentLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false);
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

    const getAllData = async () => {
      try{
        setIsContentLoading(true)
        await Promise.all([
          fetchData("select * from item", setProducts, "Item", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          fetchData("select * from class", setClasses, "Class", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          fetchData("select * from account where AccountType = 'Bank'", setAccountList, "Account", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          listDonationFields()
        ])
      }
      catch (e){
        setErrorMsg(e.response.data.error)
      }
      finally {
        setIsContentLoading(false)
      }
    }

    getAllData()

  }, []);

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
      setIsSaving(true);

      await updateOnboardingStep('/donation-config', { donationCampaign, donationComment, defaultDonationMapping, donationMappingList})
      await updateDataRecord('ca72cb0afc44', onBoardingData.teamId, {
        ...formatDonationConfig({
          defaultDonationConfig: onBoardingData.defaultDonationMapping,
          alternateDonationConfig: onBoardingData.donationMappingList,
          commentName: onBoardingData.donationComment,
          campaignName: onBoardingData.donationCampaign,
        }, onBoardingData.donationScheduling)
      })

      await markStepAsCompleted("/donation-config");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Cannot save donation mapping")
    }
    finally {
      setIsSaving(false)
    }

  }

  return (
    <PageTemplate
      title={'Donation Configuration'}
      subTitle={'Easily match donation fields from Wild Apricot to QuickBooks for a smooth and accurate integration process.'}
      backUrl={'/payment-config'}
      validate={handleSubmission}
      errorMsg={errorMsg}
      isLoading={isSaving}
    >
      <div className={'generic-default-donation'}>
        <h6>Donation General Mapping</h6>
        <p className={'mb-3 mt-2'}>Choose your donation campaign name and donation comment from the dropdowns below.</p>
        <div className="row">
          <div className="col-md-6 col-sm-12 mb-3 placeholder-glow">
            {isContentLoading ? <span className="placeholder p-3 rounded-2 w-100"></span> :
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
            </select>}
          </div>
          <div className="col-md-6 col-sm-12 placeholder-glow">
            {isContentLoading ? <span className="placeholder p-3 rounded-2 w-100"></span> :
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
            }
          </div>
        </div>
      </div>
      <div className={'default product'} >
        <div className={'default-donation-table'}>
          <h6>Default Donation Mapping</h6>
          <p className={'mb-3 mt-2'}>Select a QuickBooks deposit account and product for all Wild Apricot donations. This will be used as the default if no alternate mapping is set.</p>
          <ExtendedMappingTable<DonationMapping> classesList={onBoardingData.hasClasses ? classes : undefined} headers={["Deposit Account", "QB Product", "Income Account", ...(onBoardingData.hasClasses ? ["Class"] : [])]} QBProducts={products} onMappingChange={handleChange} defaultData={defaultDonationMapping} depositAccountList={accountList} isContentLoading={isContentLoading}/>
        </div>
      </div>
      <div className={'default product'} >
        <div className={'default-donation-table'}>
          <h6>Donation Mapping</h6>
          <p className={'mb-3 mt-2'}>Map specific Wild Apricot donation types to different QuickBooks products by adding as many mappings as needed. If a donation isn’t mapped here, the default will be used.</p>
          <AlternateMappingTable columns={[...tableColumns.donations, ...(onBoardingData.hasClasses ? tableColumns.classes : [])]} data={{accountList, products, campaignOptions: campaignList.map(val => val.Label), classes}} mappingData={donationMappingList} onMappingChange={(type, payload) => dispatchDonationMappingList({type, payload})} isContentLoading={isContentLoading}/>
        </div>
      </div>
    </PageTemplate>
  )
}