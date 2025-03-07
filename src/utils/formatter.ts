import {ICustomerInfo} from "../pages/customer-info-page/CustomerInformationPage.tsx";
import {Account, PaymentConfig} from "../pages/payment-config-page/PaymentConfigPage.tsx";
import {DonationFieldName, DonationMapping} from "../pages/donation-config-page/DonationConfigPage.tsx";
import {InvoiceConfiguration} from "../typings/InvoiceConfiguration.ts";
import {SchedulingData} from "../pages/scheduling-page/SchedulingPage.tsx";
import {IGeneralInformation} from "../pages/general-information-page/GeneralInformationPage.tsx";
import {configurations} from "../configurations.ts";

const convertTo12Hour = (time: string | undefined) => {
  if (!time) return undefined;
  let [hours, minutes] = time.split(":").map(Number);
  let period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format
  return `${hours}:${String(minutes).padStart(2, "0")} ${period}`;
};

const formatDateToYYYYMMDD = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

export const formatQBVersionInfo = (generalInfo: IGeneralInformation) => {
  return {
    "QB Version Info": {
      "QB Country": generalInfo.QuickBooksCountry,
      "QB Platform": "Online",
      "QBO Root URL": generalInfo.QuickBooksUrl
    }
  }
}
export const formatCustomerInfo = (customerInfo: ICustomerInfo) => {
  return {
    "Customer Field Config": {
      "WA Contact Field Names": {
        "User ID": customerInfo.userId || null,
        "First Name": customerInfo.firstName || null,
        "Last Name": customerInfo.lastName || null,
        "Email": customerInfo.email || null,
        "Phone": customerInfo.phoneNumber || null,
        "Organization": customerInfo.organization || null,
        "Street Address 1": customerInfo.address || null,
        "Street Address 2": null,
        "City": customerInfo.city || null,
        "Province": customerInfo.state || null,
        "Postal Code": null,
        "Country": customerInfo.country || null
      },
      "QB Display Name Format": customerInfo.displayName || null
    }
  };
}

export const formatPaymentConfig = (paymentConfig: PaymentConfig[], accountReceivable: Account, depositAccount: Account, schedulingData: SchedulingData) => {

  return {
    "Payment Config": {
      "Payment Jobs Enabled": true,
      "Payment Job Scheduling": {
        "Payment Job Scheduling Type": schedulingData?.jobType || null,
        "Manual Payment Job Config": {
          "Manual Start Date": schedulingData?.manualSchedule?.startDate || null,
          "Manual End Date": schedulingData?.manualSchedule?.endDate || null,
          "Manual Payment Doc Number": schedulingData?.manualSchedule?.docNumber || null
        },
        "Auto Scheduled Payment Job Config": {
          "Time Period Type for Each Run": schedulingData?.scheduledSchedule?.timePeriod || null,
          "Number of Time Periods for Each Run": schedulingData?.scheduledSchedule?.numOfTimePeriods || 1,
          "Weekly-Day of Week to Start Run": schedulingData?.scheduledSchedule?.dayOfWeek || null,
          "Monthly-Day of Month to Start Run": schedulingData?.scheduledSchedule?.dayOfMonth || null,
          "Start Time": convertTo12Hour(schedulingData?.scheduledSchedule?.startTime) || "12:45 AM",
          "Last AutoRun for Payment": null
        }
      },
      "Default Payment Mapping": {
        "QB Payment Deposit Account": depositAccount?.accountName || null,
        "QBO Payment Deposit Account ID": depositAccount?.accountId || null,
        "QB Receivables Account": accountReceivable?.accountName || null,
        "QBO Receivables Account ID": accountReceivable?.accountId || null
      },
      "Payment Tender Mapping": paymentConfig?.map(row => {
        return {
          "WA Payment Tender Name": row.WATender || null,
          "QB Payment Tender Name": row.QBTender || null,
          "QBO Payment Tender ID": row.QBTenderId || null
        }
      })
    }
  }
}

interface DonationConfig {
  campaignName: DonationFieldName,
  commentName: DonationFieldName,
  defaultDonationConfig: DonationMapping,
  alternateDonationConfig: DonationMapping[]
}

export const formatDonationConfig = (donationConfig: DonationConfig, schedulingData: SchedulingData) => {

  return {
    "Donation Config": {
      "Donations Jobs Enabled": true,
      "Donation Job Scheduling": {
        "Donation Job Scheduling Type": schedulingData?.jobType || null,
        "Manual Donation Job Config": {
          "Manual Start Date": schedulingData?.manualSchedule?.startDate || null,
          "Manual End Date": schedulingData?.manualSchedule?.endDate || null,
          "Manual Donation Doc Number": schedulingData?.manualSchedule?.docNumber || null
        },
        "Auto Scheduled Donation Job Config": {
          "Time Period Type for Each Run": schedulingData?.scheduledSchedule?.timePeriod || null,
          "Number of Time Periods for Each Run": schedulingData?.scheduledSchedule?.numOfTimePeriods || 1,
          "Weekly-Day of Week to Start Run": schedulingData?.scheduledSchedule?.dayOfWeek || null,
          "Monthly-Day of Month to Start Run": schedulingData?.scheduledSchedule?.dayOfMonth || null,
          "Start Time": convertTo12Hour(schedulingData?.scheduledSchedule?.startTime) || "12:20 AM",
          "Last AutoRun for Donation": null
        }
      },
      "WA Donation Mapping": {
        "WA Campaign Field Name": donationConfig?.campaignName?.FieldName || null,
        "WA Donation Comment Field Name": donationConfig?.commentName?.FieldName || null,
        "QB Donor Comment Format": "{Comment}",
        "QB Exempt Tax Code for Donations": null,
        "QBO Exempt Tax Code ID for Donations": null,
        "Default Donation Mappings": {
          "QB Payment Deposit Account": donationConfig.defaultDonationConfig?.depositAccount || null,
          "QBO Payment Deposit Account ID": donationConfig.defaultDonationConfig?.depositAccountId || null,
          "QB Income Account": donationConfig.defaultDonationConfig?.IncomeAccount || null,
          "QB Item Product": donationConfig.defaultDonationConfig?.QBProduct || null,
          "QBO Item Product ID": donationConfig.defaultDonationConfig?.QBProductId || null,
          "QB Txn Class": donationConfig.defaultDonationConfig?.class || null,
          "QBO Txn Class ID": donationConfig.defaultDonationConfig?.classId || null,
          "QB Donation Line Description Format": null
        },
        "Donation Campaign Mapping": donationConfig.alternateDonationConfig?.map(config => {
          return {
            "AlternateMappingFilter": config?.WAFieldName || null,
            "QB Alt Payment Deposit Account": config?.depositAccount || null,
            "QBO Alt Payment Deposit Account ID": config?.depositAccountId || null,
            "QB Alt Item Product": config?.QBProduct || null,
            "QBO Alt Item Product ID": config?.QBProductId || null,
            "QB Alt Income Account": config?.IncomeAccount || null,
            "QB Alt Line Description Format": "{Campaign}",
            "QB Alt Txn Class": config?.class || null,
            "QBO Alt Txn Class ID": config?.classId || null
          }
        })
      }
    }
  }
}

export const formatInvoiceConfig = (invoiceConfig: InvoiceConfiguration[], schedulingData: SchedulingData) => {

  return {
    "Invoice Config": {
      "Invoices Jobs Enabled": true,
      "Invoice Job Scheduling": {
        "Invoice Job Scheduling Type": schedulingData?.jobType || null,
        "Manual Invoice Job Config": {
          "Manual Start Date": schedulingData?.manualSchedule?.startDate || null,
          "Manual End Date": schedulingData?.manualSchedule?.endDate || null,
          "Manual Invoice Doc Number": schedulingData?.manualSchedule?.docNumber || null
        },
        "Auto Scheduled Invoice Job Config": {
          "Time Period Type for Each Run": schedulingData?.scheduledSchedule?.timePeriod || null,
          "Number of Time Periods for Each Run": schedulingData?.scheduledSchedule?.numOfTimePeriods || 1,
          "Weekly-Day of Week to Start Run": schedulingData?.scheduledSchedule?.dayOfWeek || null,
          "Monthly-Day of Month to Start Run": schedulingData?.scheduledSchedule?.dayOfMonth || null,
          "Start Time for Run": convertTo12Hour(schedulingData?.scheduledSchedule?.startTime) || "12:20 AM",
          "Last AutoRun for Invoice": null
        }
      },
      "WA Invoice Mapping": invoiceConfig.map(config => {
        return {
          "Invoice Order Type": config?.invoiceOrderType || null,
          "Default Invoice Mappings": {
          "QB Receivables Account": config?.accountReceivable?.accountName || null,
            "QBO Receivables Account ID": config?.accountReceivable?.accountId || null,
            "QB Item Product": config?.defaultInvoiceMapping?.QBProduct || null,
            "QBO Item Product ID": config?.defaultInvoiceMapping?.QBProductId || null,
            "QB Income Account": config?.defaultInvoiceMapping?.IncomeAccount || null,
            "QBO Income Account ID": null,
            "QB Txn Class": config?.defaultInvoiceMapping?.class || null,
            "QBO Txn Class ID": config?.defaultInvoiceMapping?.classId || null,
            "QB Payment Deposit Account": null,
            "QBO Payment Deposit Account ID": null,
            "Use Membership Application Mapping for All Membership Order Types": null
        },
          "Alternate Invoice Mappings": config?.alternateInvoiceMapping?.map(value => {
            return  {
              "AlternateMappingFilter": value?.WAFieldName || null,
              "QB Alt Item Product": value?.QBProduct || null,
              "QBO Alt Item Product ID": value?.QBProductId || null,
              "QB Alt Income Account": value?.IncomeAccount || null,
              "QB Alt Txn Class": value?.class || null,
              "QBO Alt Txn Class ID": value?.classId || null,
              "QB Alt Payment Deposit Account": null,
              "QBO Alt Payment Deposit Account ID": null
            }
          })
        }
      }),
      "WA Invoice Line Item ExtraCost Exceptions": []
    },
  }
}

export const formatNotificationConfig = (generalInfo: IGeneralInformation) => {
  return {
    "Notification Email Config": {
      "From Email Address": generalInfo.fromEmailAddress,
      "To Email Addresses": generalInfo.toEmailAddresses,
      "Bcc-Support Email Addresses": [
        "dwreed@rockitproject.com",
        "dwreed@rockitproject.com"
      ],
      "Mailgun Domain Name": "rockitproject.com"
    }
  }
}

interface IDataRecord {
  "WA Org Name": string,
  "WA Config Record Name": string,
  "Org Time Zone": string,
  "Config Last Updated": Date,
  "QB Version Info": any,
  "WAQM Version info": any,
  "Customer Field Config": any,
  "Invoice Config": any,
  "Payment Config": any,
  "Donation Config": any,
}

export const formatDataRecord = (onBoardingData, invoiceConfigurations: InvoiceConfiguration[]): IDataRecord => {
  return {
    "Org Time Zone": onBoardingData.generalInfo.timeZone,
    "WA Config Record Name": onBoardingData.generalInfo.recordName,
    "WA Org Name": onBoardingData.generalInfo.organizationName,
    ...configurations,
    "Config Last Updated": new Date(),
    ...formatQBVersionInfo(onBoardingData.generalInfo),
    ...formatCustomerInfo(onBoardingData.customerInfo),
    ...formatPaymentConfig(onBoardingData.paymentMappingList, onBoardingData.accountReceivable, onBoardingData.qbDepositAccount, onBoardingData.paymentScheduling),
    ...formatDonationConfig({
      defaultDonationConfig: onBoardingData.defaultDonationMapping,
      alternateDonationConfig: onBoardingData.donationMappingList,
      commentName: onBoardingData.donationCommentName,
      campaignName: onBoardingData.donationCampaignName
    }, onBoardingData.donationScheduling),
    ...formatInvoiceConfig(invoiceConfigurations, onBoardingData.invoiceScheduling),
    ...formatNotificationConfig(onBoardingData.generalInfo)
  }
}