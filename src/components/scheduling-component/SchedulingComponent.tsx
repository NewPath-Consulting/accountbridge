import * as React from "react";
import './Scheduling.css'
import {useState} from "react";
import {Action, SchedulingData} from "../../pages/scheduling-page/SchedulingPage.tsx";
interface SchedulingComponentProps {
  title: string,
  schedulingData: SchedulingData,
  dispatch: React.Dispatch<Action>
}

export const SchedulingComponent = ({ title, schedulingData, dispatch }: SchedulingComponentProps) => {

  const handleManualChange = (e) => {
    const { name, value } = e.target
    dispatch({ type: "UPDATE_MANUAL_SCHEDULE", payload: { [name]: value } });
  }

  const handleScheduledChange = (e) => {
    const { name, value } = e.target

    if(name == 'timePeriod'){
      schedulingData.scheduledSchedule.numOfTimePeriods = 1
    }

    dispatch({ type: "UPDATE_SCHEDULED_SCHEDULE", payload: { [name]: value } });
  }

  const renderForm = () => {
    if(schedulingData.jobType == 'Manual'){
      return (
        <>
          <div className="row g-3">
            <div className="col-md-6">
              <label htmlFor={`${title.toLowerCase()}-manual-start-input`} className="form-label">Manual Start Time</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text" id="basic-addon1"><i className={'bi bi-calendar'}></i></span>
                <input onChange={handleManualChange} value={schedulingData.manualSchedule.startDate} name={'startDate'} id={`${title.toLowerCase()}-manual-start-input`} type="date" className="form-control" placeholder="Choose Date" aria-label="Username" aria-describedby="basic-addon1" />
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor={`${title.toLowerCase()}-manual-end-input`} className="form-label">Manual End Time</label>
              <div className="input-group input-group-sm">
                <span className="input-group-text" id="basic-addon1"><i className={'bi bi-calendar'}></i></span>
                <input onChange={handleManualChange} value={schedulingData.manualSchedule.endDate} name={'endDate'} id={`${title.toLowerCase()}-manual-end-input`} type="date" className="form-control" placeholder="Choose Date" aria-label="Username" aria-describedby="basic-addon1" />
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor={`${title.toLowerCase()}-doc-input`} className="form-label">Manual {title} {title.toLowerCase() === 'payment' ? 'ID' : 'Doc'} #</label>
              <div className="input-group input-group-sm">
                <input onChange={handleManualChange} value={schedulingData.manualSchedule.docNumber} name={'docNumber'} id={`${title.toLowerCase()}-doc-input`} type="text" className="form-control" placeholder="Enter here..." aria-label="Username" aria-describedby="basic-addon1" />
              </div>
            </div>
          </div>
        </>
      )

    }

    else if(schedulingData.jobType == 'Scheduled'){
      return (
        <>
          <div className="row">
            <div className="col-md-6">
              <label htmlFor={`${title.toLowerCase()}-time-periods-input`} className="form-label">Time Period for each Run</label>
              <select onChange={handleScheduledChange} id={`${title.toLowerCase()}-time-periods-input`} name={'timePeriod'} className={'form-select'} value={schedulingData.scheduledSchedule.timePeriod}>
                <option value={""}>Choose time period ...</option>
                <option value={"Daily"}>Daily</option>
                <option value={"Weekly"}>Weekly</option>
                <option value={"Monthly"}>Monthly</option>
              </select>
            </div>
          </div>
          <div className="row g-3 align-items-center">
            {schedulingData.scheduledSchedule.timePeriod == 'Weekly' ? <><div className="col-md-6">
                <label htmlFor={`${title.toLowerCase()}-weekly-input`} className="form-label">Day of Week to start run</label>
                <select onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.dayOfWeek} name={'dayOfWeek'} id={`${title.toLowerCase()}-weekly-input`} className={'form-select'}>
                  <option value={""}>Choose day of the week ...</option>
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) =>
                    <option key={index} value={day}>{day}</option>)
                  }
                </select>
              </div>
              <div className="col-md-6 input-group-sm">
                <label htmlFor={`${title.toLowerCase()}-start-time-input`} className="form-label">Start time for run</label>
                <input onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.startTime} name={'startTime'} id={`${title.toLowerCase()}-start-time-input`} type="time" className="form-control" max={31} placeholder="" aria-label="Username" aria-describedby="basic-addon1" />
              </div></>:
              schedulingData.scheduledSchedule.timePeriod == 'Monthly' ?
                <><div className=" col-md-4 input-group-sm">
                  <label htmlFor={`${title.toLowerCase()}-monthly-input`} className="form-label">Day of Month to start run</label>
                  <select onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.dayOfMonth} name={'dayOfMonth'} id={`${title.toLowerCase()}-monthly-input`} className={'form-select'}>
                    <option value={""}>Choose day of the month ...</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((number) => (
                      <option key={number} value={number}>{number}</option>
                    ))}
                  </select>
                </div>
                  <div className=" col-md-4 input-group-sm">
                    <label htmlFor={`${title.toLowerCase()}-num-periods-input `} className="form-label"># of Time Periods</label>
                    <select onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.numOfTimePeriods} name={'numOfTimePeriods'} id={`${title.toLowerCase()}-num-periods-input`} className={'form-select'}>
                      <option value={""}>Choose once or twice ...</option>
                      {Array.from({ length: 2 }, (_, i) => i + 1).map((number) => (
                        <option key={number} value={number}>{number}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 input-group-sm">
                    <label htmlFor={`${title.toLowerCase()}-start-time-input`} className="form-label">Start time for run</label>
                    <input onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.startTime} name={'startTime'} id={`${title.toLowerCase()}-start-time-input`} type="time" className="form-control" max={31} placeholder="" aria-label="Username" aria-describedby="basic-addon1" />
                  </div>
                </> :
                schedulingData.scheduledSchedule.timePeriod == 'Daily' ?
                  <div className="col-md-6 input-group-sm">
                    <label htmlFor={`${title.toLowerCase()}-start-time-input`} className="form-label">Start time for run</label>
                    <input onChange={handleScheduledChange} value={schedulingData.scheduledSchedule.startTime} name={'startTime'} id={`${title.toLowerCase()}-start-time-input`} type="time" className="form-control" max={31} placeholder="" aria-label="Username" aria-describedby="basic-addon1" />
                  </div> :
                  <div className=" col-md-6 m-0"></div>
            }
          </div>
        </>
      )
    }
  }

  return (
    <div className="scheduling-container">
      <h6>{title} Scheduling</h6>
      <div className="row">
        <div className="col-md-6">
          <label htmlFor={`${title.toLowerCase()}-job-type-input`} className="form-label">Job Scheduling Type</label>
          <select id={`${title.toLowerCase()}-job-type-input`} name={'jobType'} className={'form-select'} onChange={(e) => dispatch({ type: "SET_JOB_TYPE", payload: e.target.value })} value={schedulingData.jobType}>
            <option value={""}>Choose job type ...</option>
            <option value={"Manual"}>Manual</option>
            <option value={"Scheduled"}>Scheduled</option>
          </select>
        </div>
      </div>
      {renderForm()}
    </div>
  )
}