import {useOnBoarding} from "../../hooks/useOnboarding.ts";
import {useEffect} from "react";
import {
  ReviewDefaultMappingTable,
  ReviewMappingTable
} from "../../components/review-mapping-table/ReviewMappingTable.tsx";


export const ReviewDonationConfigPage = () => {
  const { onBoardingData } = useOnBoarding()

  return (
    <div className={'pt-4 pb-3 ps-1 review-page-container'}>
      <div className="mb-2">
        <p className="mb-2 fw-regular" style={{fontSize: '0.9em'}}>Donation Campaign Field Name</p>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div className="input-group input-group-sm mb-3">
            <input type="text" style={{fontSize: '12px'}} className="form-control" disabled value={onBoardingData.donationCampaign?.FieldName || ""} placeholder="Field Name" aria-label="field-name"/>
          </div>
        </div>
      </div>
      <div className="mb-2">
        <p className="mb-2 fw-regular" style={{fontSize: '0.9em'}}>Donation Comment Field Name</p>
        <div className="col-lg-3 col-md-6 col-sm-12">
          <div className="input-group input-group-sm mb-3">
            <input type="text" style={{fontSize: '12px'}} className="form-control" disabled value={onBoardingData.donationComment?.FieldName || ""} placeholder="Field Name" aria-label="field-name"/>
          </div>
        </div>
      </div>
      <div className={'mb-2'}>
        <p className={'mb-2 fw-regular'} style={{fontSize: '0.9em'}}>Default Donation Mapping</p>
        <ReviewDefaultMappingTable defaultFields={onBoardingData.defaultDonationMapping} headers={["Deposit Account", "QB Product", "Income Account", ...(onBoardingData.hasClasses ? ["Class"] : [])]} columns={["depositAccount", "QBProduct", "IncomeAccount", ...(onBoardingData.hasClasses ? ["class"] : [])]}/>
      </div>
      <div className={'mb-2'}>
        <p className={'mb-2 fw-regular'} style={{fontSize: '0.9em'}}>Alternate Donation Mapping</p>
        <ReviewMappingTable mappingList={onBoardingData.donationMappingList} headers={["Campaign Name", "Deposit Account", "QB Product", "Income Account", ...(onBoardingData.hasClasses ? ["Class"] : [])]} columns={["WAFieldName", "depositAccount", "QBProduct", "IncomeAccount", ...(onBoardingData.hasClasses ? ["class"] : [])]} />
      </div>
    </div>
  )
}