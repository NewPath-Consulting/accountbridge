import './InvoiceConfig.css'
import * as React from "react";
import {useCallback, useEffect, useMemo, useReducer, useRef, useState} from "react";
import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {getMembershipLevels} from "../../services/api/wild-apricot-api/membershipService.ts";
import {useNavigate} from "react-router-dom";
import {fetchData} from "../../services/fetchData.ts";
import {DefaultMappingTable} from "../../components/default-mapping-table/DefaultMappingTable.tsx";
import {getEventTags} from "../../services/api/wild-apricot-api/eventsService.ts";
import {getProductTags} from "../../services/api/wild-apricot-api/storeService.ts";
import {tableColumns} from "../../components/alternate-mapping-table/tableColumns.ts";
import AlternateMappingTable from "../../components/alternate-mapping-table/AlternateMappingTable.tsx";
import {invoiceTableReducer} from "../../hooks/tableReducer.ts";
import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {updateDataRecord} from "../../services/api/make-api/dataStructuresService.ts";
import {formatCustomerInfo, formatInvoiceConfig} from "../../utils/formatter.ts";
import {InvoiceConfiguration} from "../../typings/InvoiceConfiguration.ts";
import {generateMapping} from "../../services/api/generate-mapping-api/generateMapping.ts";
import {BlurryOverlay} from "../../components/cloning-animation/BlurryOverlay.tsx";
export interface InvoiceMapping {
  WAFieldName ?: string,
  QBProduct ?: string,
  QBProductId ?: string,
  IncomeAccount ?: string,
  class ?: string,
  classId ?: string
}

export const InvoiceConfigPage = () => {
  const { onBoardingData, updateData, markStepAsCompleted, getNextStep, updateOnboardingStep } = useOnBoarding()

  const navigate = useNavigate();

  const [errorMsg, setErrorMsg] = useState<string | string[]>("");
  const [accountList, setAccountList] = useState([]);
  const [membershipLevels, setMembershipLevels] = useState([]);
  const [products, setProducts] = useState([]);
  const [classes, setClasses] = useState([]);
  const [hasClasses, setHasClasses] = useState(onBoardingData.hasClasses || false)
  const accountsReceivableErrorMsg = "Must choose an invoice account"
  const [eventTags, setEventTags] = useState([]);
  const [productTags, setProductTags] = useState(["Delivery"]);
  const [accountReceivable, setAccountReceivable] = useState(onBoardingData.accountReceivable ?? {accountId: "", accountName: ""});
  const [isGenerateMappingLoading, setIsGenerateMappingLoading] = useState(false)

  const [defaultMembershipProduct, setDefaultMembershipProduct] = useState<InvoiceMapping>(onBoardingData.defaultMembershipProduct ?? {QBProduct: "", QBProductId: "", IncomeAccount: "", class: "", classId: ""});
  const [defaultEventProduct, setDefaultEventProduct] = useState<InvoiceMapping>(onBoardingData.defaultEventProduct ?? {QBProduct: "", QBProductId: "", IncomeAccount: "", class: "", classId: ""});
  const [defaultStoreProduct, setDefaultStoreProduct] = useState<InvoiceMapping>(onBoardingData.defaultStoreProduct ?? {QBProduct: "", QBProductId: "", IncomeAccount: "", class: "", classId: ""});
  const [manualInvoiceMapping, setManualInvoiceMapping] = useState<InvoiceMapping>(onBoardingData.manualInvoiceMapping ?? {QBProduct: "", QBProductId: "", IncomeAccount: "", class: "", classId: ""});

  const [membershipLevelMappingList, dispatchMembershipMapping] = useReducer(invoiceTableReducer, onBoardingData.membershipLevelMappingList ?? [{ WAFieldName: '', QBProduct: '', QBProductId: '', IncomeAccount: '', class: '', classId: ''}]);
  const [eventMappingList, dispatchEventMapping] = useReducer(invoiceTableReducer, onBoardingData.eventMappingList ?? [{ WAFieldName: '', QBProduct: '', QBProductId: '', IncomeAccount: '', class: '', classId: ''}]);
  const [onlineStoreMappingList, dispatchOnlineStoreMapping] = useReducer(invoiceTableReducer, onBoardingData.onlineStoreMappingList ?? [{ WAFieldName: '', QBProduct: '', QBProductId: '', IncomeAccount: '', class: '', classId: ''}]);

  useEffect(() => {

    const fetchAllData = async () => {
      try {
        // QB data fetching
        await Promise.all([
          fetchData("select * from item", setProducts, "Item", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          fetchData("select * from account where AccountType = 'Accounts Receivable'", setAccountList, "Account", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl),
          fetchData("select * from class", setClasses, "Class", setErrorMsg, onBoardingData.generalInfo.QuickBooksUrl)
        ]);

        // WA data fetching
        await Promise.all([
          fetchWithErrorHandling(
            async () => {
              const response = await getMembershipLevels(onBoardingData.generalInfo.accountId || '221748');
              return response.map(level => level.Name).sort((a, b) => a.localeCompare(b));
            },
            setMembershipLevels,
            setErrorMsg
          ),
          fetchWithErrorHandling(
            async () => {
              const response = await getEventTags(onBoardingData.generalInfo.accountId);
              return [...new Set(response.data.Events.map(event => event.Tags).flat())]
                .sort((a, b) => a.localeCompare(b));
            },
            setEventTags,
            setErrorMsg
          ),
          fetchWithErrorHandling(
            async () => {
              const response = await getProductTags(onBoardingData.generalInfo.accountId);
              return [...new Set(response.data.map(productTag => productTag.Tags).flat())]
                .sort((a, b) => a.localeCompare(b));
            },
            (data) => setProductTags((prev) => [...new Set([...prev, ...data])]),
            setErrorMsg
          )
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMsg(error?.message || "Failed to fetch data");
      }
    };

    fetchAllData();
  }, []);

  const fetchWithErrorHandling = async (
    fetchFn: () => Promise<any>,
    setter: (data: any[]) => void,
    errorSetter: (error: string) => void
  ) => {
    try {
      const result = await fetchFn();
      setter(result);
    } catch (e) {
      setter([]);
      console.log(e)
      errorSetter(e.response?.data?.Message || "An error occurred");
    }
  };

  const invoiceConfigurations: InvoiceConfiguration[] = useMemo(() => [
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
  ], [
    defaultMembershipProduct,
    membershipLevelMappingList,
    defaultEventProduct,
    eventMappingList,
    defaultStoreProduct,
    onlineStoreMappingList,
    manualInvoiceMapping
  ]);

  const updateInvoiceData = useCallback(() => {
    updateData({
      membershipLevelMappingList,
      eventMappingList,
      onlineStoreMappingList,
      defaultEventProduct,
      defaultMembershipProduct,
      defaultStoreProduct,
      accountReceivable,
      manualInvoiceMapping
    });

    console.log(`WA_Membership_Levels: ${membershipLevels.join(', ')}  
                  QB_Products: ${JSON.stringify(products.map(product => ({Name: product.Name, Id: product.Id})))}`)

  }, [
    membershipLevelMappingList,
    eventMappingList,
    onlineStoreMappingList,
    defaultEventProduct,
    defaultMembershipProduct,
    defaultStoreProduct,
    accountReceivable,
    manualInvoiceMapping
  ]);

  useEffect(() => {
    updateInvoiceData();
  }, [updateInvoiceData]);


  const handleChange = () => {
    updateData({hasClasses: !hasClasses})
    setHasClasses(!hasClasses)
  }
  const handleAccountSelection = (event) => {
    const selectedOption = event.target.options[event.target.selectedIndex];
    const accountId = selectedOption.value; // option's value
    const accountName = selectedOption.text;  // option's name (text inside <option>)

    setAccountReceivable({accountId, accountName});

    if(errorMsg === accountsReceivableErrorMsg){
      setErrorMsg('');
    }
  }

  const validateConfig = () => {
    let errors = [];

    if(!accountReceivable.accountName || !accountReceivable.accountId){
      errors.push('Please select a receivables account. ')
    }

    const defaultMappings = [
      { name: "Default Membership Mapping", data: defaultMembershipProduct },
      { name: "Default Event Mapping", data: defaultEventProduct },
      { name: "Default Online Store Mapping", data: defaultStoreProduct },
      { name: "Manual Invoice Mapping", data: manualInvoiceMapping }
    ];

    defaultMappings.forEach(({ name, data }) => {
      if (!data.QBProductId || !data.QBProduct || (hasClasses && !data.class)) {
        errors.push(`Please complete all fields for ${name}.`);
      }
    });

    const alternateMappings = [
      { name: "Membership Level Mapping", list: membershipLevelMappingList, options: membershipLevels },
      { name: "Event Mapping", list: eventMappingList, options: eventTags },
      { name: "Online Store Mapping", list: onlineStoreMappingList, options: productTags }
    ];

    alternateMappings.forEach(({ name, list, options }) => {
      list.forEach((row, index) => {
        if (!row.WAFieldName || !row.QBProductId || !row.QBProduct || (hasClasses && !row.class)) {
          errors.push(`Row ${index + 1} in ${name} is incomplete.`);
        }
      });

      // if(!options.every(option => list.map(row => row.WAFieldName).includes(option))){
      //   errors.push(`Please map all WildApricot Fields to a QuickBooks Product for ${name}. `);
      // }
    });

    return errors;
  };

  const handleSubmission = async () => {
    try{
      const errors = validateConfig();

      if (errors.length > 0) {
        setErrorMsg(errors);  // Show all errors
        return;
      }

      await updateOnboardingStep('/invoice-config', {
        hasClasses,
        defaultEventProduct,
        defaultMembershipProduct,
        defaultStoreProduct,
        manualInvoiceMapping,
        accountReceivable,
        membershipLevelMappingList,
        eventMappingList,
        onlineStoreMappingList
      })

      await updateDataRecord('ca72cb0afc44', onBoardingData.teamId, {
          ...formatInvoiceConfig(invoiceConfigurations, onBoardingData.invoiceScheduling),
      })

      await markStepAsCompleted("/invoice-config");
      const nextStep = getNextStep();
      if (nextStep) {
        navigate(nextStep);
      }
    }
    catch (e){
      setErrorMsg(e.message || "Cannot save data")
    }

  }

  const handleMapping = (type, payload, fieldName) => {
    switch(fieldName) {
      case "membership":
        dispatchMembershipMapping({type, payload});
        break;
      case "event":
        dispatchEventMapping({type, payload});
        break;
      case "store":
        dispatchOnlineStoreMapping({type, payload});
        break;
      default:
        throw new Error("No field name found")
    }
  }

  const handleGenerateMapping = async (obj: {name: string, WAFields: any[]}) => {
    try{
      setErrorMsg('')
      setIsGenerateMappingLoading(true)

      const waFields = `WA_${obj.name}: ${obj.WAFields.join(', ')}`;
      const qbMethods = `QB_Products: ${JSON.stringify(products.map(product => ({Name: product.Name, Id: product.Id})))}`;

      const prompt = `
        ${waFields} \n
        ${qbMethods}
        `;

      const instructions = `
        You are a mapping assistant.  When given: \\n- A comma-separated string of Wild Apricot (WA) ${obj.name}s. \\n - An array of QuickBooks (QB) products with \`Name\` and \`ID\` attributes.  
        
        Your task:  
        - Map each WA ${obj.name} to the **closest matching QB product** by context or similarity and keep the corresponding \`ID\`.  
        - Return the result as an array of objects in the format:  \`\`\`json [{ WAFieldName: WA_level, QBProduct: QB_name, QBProductId: QB_ID }]. 
        - Ensure **all WA membership levels** are mapped to a QB product—**no null or missing values**. 
        `;

      const response = await generateMapping(prompt, instructions);

      const { message } = response.data

      handleMapping("SET_MAPPING", {mapping: message, products}, obj.name)

    }
    catch (e){
      setErrorMsg(e.response.data.message || "Error mapping with AI")
    }
    finally {
      setIsGenerateMappingLoading(false)
    }
  }

  const handleDefaultMapping = (payload: InvoiceMapping, fieldName) => {
    switch(fieldName) {
      case "membership":
        setDefaultMembershipProduct(prev => ({
          ...prev,
          ...payload, // Modify only QBProduct
        }))
        break;
      case "event":
        setDefaultEventProduct(prev => ({
          ...prev,
          ...payload, // Modify only QBProduct
        }))
        break;
      case "store":
        setDefaultStoreProduct(prev => ({
          ...prev,
          ...payload, // Modify only QBProduct
        }))
        break;
      case "manual":
        setManualInvoiceMapping(prev => ({
          ...prev,
          ...payload, // Modify only QBProduct
        }))
        break;
      default:
        throw new Error("No field name found")
    }
  }

  return (
    <PageTemplate
      title={'Invoice Configuration'}
      subTitle={'Easily match fields from Wild Apricot to QuickBooks for a smooth and accurate integration process.'}
      backUrl={'/customer-information'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <BlurryOverlay isLoading={isGenerateMappingLoading} message={isGenerateMappingLoading ? `Currently Mapping your Invoice Fields. ` : errorMsg ? "Error Occurred!" : "Mapping Completed!"} icon={"stars"} subtitle={"Please wait while our system maps your field names ..."}/>
      <div id={'content'}>
          <div className={'accounts-receivable mb-5'} >
            <h6>QuickBooks Receivable Account for Invoices</h6>
            <p className={'mb-3 mt-2'}>Please select your Accounts Receivable account name below</p>
            <div className="input-group mb-3" style={{maxWidth: '500px'}}>
              <label className="input-group-text" htmlFor="inputAccountsReceivable"><i className={'bi bi-receipt'}></i></label>
              <select className="form-select" id="inputAccountsReceivable" value={accountReceivable.accountId} onChange={handleAccountSelection}>
                <option value={""}>Choose Receivable Account</option>
                {accountList.map(account => {
                  return <option key={account.Id} value={account.Id}>{account.Name}</option>
                })}
              </select>
            </div>
          </div>
          <div className={'quickbooks-class mb-5'} >
            <h6>QuickBooks Classes</h6>
            <p className={'mb-3 mt-2'}>Please select weather you want to enable QuickBooks Classes</p>
            <div className="form-check form-check-inline">
              <input className="form-check-input" id={"inlineRadio1"} type="radio" name="options" value="no" checked={!hasClasses} onChange={handleChange} />
              <label className="form-check-label" htmlFor="inlineRadio1">No</label>
            </div>
            <div className="form-check form-check-inline">
              <input className="form-check-input" id={"inlineRadio2"} type="radio" name="options" value="yes" checked={hasClasses} onChange={handleChange}/>
              <label className="form-check-label"  htmlFor="inlineRadio2">Yes</label>
            </div>
          </div>
          <div className={'default product'} >
            <div className={'membership-level-table'}>
              <h6>Default Membership Level Mapping</h6>
              <p className={'mb-3 mt-2'}>Map your WildApricot membership levels to one of your products by selecting a QuickBooks product from the drop down</p>
              <DefaultMappingTable<InvoiceMapping> classesList={hasClasses ? classes : undefined} headers={["QB Product", "Income Account", ...(hasClasses ? ["Class"] : [])]}  defaultData={defaultMembershipProduct} QBProducts={products}  onMappingChange={(payload) => handleDefaultMapping(payload, "membership")}/>
            </div>
          </div>
          <div className={'membership-level-table mb-4'}>
            <div className={'d-flex justify-content-between align-items-center flex-wrap'}>
              <div>
                <h6>Alternate Membership Level Mapping</h6>
                <p className={'mb-3 mt-2'}>Map your WildApricot membership levels to one of your products by selecting a QuickBooks product from the drop down</p>
              </div>
              <button className={"ai-btn mb-3"} onClick={() => handleGenerateMapping({ name: 'membership', WAFields: membershipLevels})}>
                <i className={'bi bi-stars'} style={{color: 'black'}}></i>
                Map with AI
              </button>
            </div>
            <AlternateMappingTable columns={[...tableColumns.membershipLevels, ...(hasClasses ? tableColumns.classes : [])]} onMappingChange={(actionType, actionPayload) => handleMapping(actionType, actionPayload, "membership")} mappingData={membershipLevelMappingList} data={{products, membershipLevels, classes}}/>
          </div>
          <div className={'default product'} >
            <div className={'event-registration-table'}>
              <h6>Default Event Registration Mapping</h6>
              <p className={'mb-3 mt-2'}>Map your WildApricot membership levels to one of your products by selecting a QuickBooks product from the drop down</p>
              <DefaultMappingTable<InvoiceMapping> classesList={hasClasses ? classes : undefined} headers={["QB Product", "Income Account", ...(hasClasses ? ["Class"] : [])]} QBProducts={products} defaultData={defaultEventProduct} onMappingChange={(payload) => handleDefaultMapping(payload, "event")}/>
            </div>
          </div>
          <div className={'event-registration-table mb-4'}>
            <div className={'d-flex justify-content-between align-items-center flex-wrap'}>
              <div>
                <h6>Alternate Event Registration Mapping</h6>
                <p className={'mb-3 mt-2'}>Map your WildApricot events to one of your products by selecting a QuickBooks product from the drop down</p>
              </div>
              <button className={"ai-btn mb-3"} onClick={() => handleGenerateMapping({ name: 'event', WAFields: eventTags})}>
                <i className={'bi bi-stars'} style={{color: 'black'}}></i>
                Map with AI
              </button>
            </div>
            <AlternateMappingTable columns={[...tableColumns.events, ...(hasClasses ? tableColumns.classes : [])]} onMappingChange={(actionType, actionPayload) => handleMapping(actionType, actionPayload, "event")} mappingData={eventMappingList} data={{products, eventTags, classes}}/>
          </div>
          <div className={'default product'} >
            <div className={'online-store-table'}>
              <h6>Default Online Store Mapping</h6>
              <p className={'mb-3 mt-2'}>Map your WildApricot product tags to one of your QuickBooks products by selecting a QuickBooks product from the drop down</p>
              <DefaultMappingTable<InvoiceMapping> classesList={hasClasses ? classes : undefined} headers={["QB Product", "Income Account", ...(hasClasses ? ["Class"] : [])]} defaultData={defaultStoreProduct} QBProducts={products} onMappingChange={(payload) => handleDefaultMapping(payload, "store")}/>
            </div>
          </div>
          <div className={'online-store-table'}>
            <div className={'d-flex justify-content-between align-items-center flex-wrap'}>
              <div>
                <h6>Alternate Online Store Mapping</h6>
                <p className={'mb-3 mt-2'}>Map your WildApricot online stores to one of your products by selecting a QuickBooks product from the drop down</p>
              </div>
              <button className={"ai-btn mb-3"} onClick={() => handleGenerateMapping({ name: 'store', WAFields: productTags})}>
                <i className={'bi bi-stars'} style={{color: 'black'}}></i>
                Map with AI
              </button>
            </div>
           <AlternateMappingTable columns={[...tableColumns.onlineStore, ...(hasClasses ? tableColumns.classes : [])]} onMappingChange={(actionType, actionPayload) => handleMapping(actionType, actionPayload, "store")} mappingData={onlineStoreMappingList} data={{products, productTags, classes}}/>
          </div>
          <div className={'default product'} >
            <div className={'manual-invoice-table'}>
              <h6>Manual Invoice Mapping</h6>
              <p className={'mb-3 mt-2'}>This section is used to map your manually created invoices to a QuickBooks product.</p>
              <DefaultMappingTable<InvoiceMapping> classesList={hasClasses ? classes : undefined} headers={["QB Product", "Income Account", ...(hasClasses ? ["Class"] : [])]} defaultData={manualInvoiceMapping} QBProducts={products} onMappingChange={(payload) => handleDefaultMapping(payload, "manual")}/>
            </div>
          </div>
        </div>
    </PageTemplate>
  )
}
