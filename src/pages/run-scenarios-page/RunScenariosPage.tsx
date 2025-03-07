import {PageTemplate} from "../../components/page-template/PageTemplate.tsx";
import {useEffect, useState} from "react";
import {Clock, CheckCircle, AlertCircle, RotateCw, PlayCircle, ClipboardCheck, ClipboardList, Timer,} from 'lucide-react';
import './RunScenarios.css'
import {
  activateScenario,
  getScenarioDetails,
  getScenarios, getUserScenarios,
  runScenario
} from "../../services/api/make-api/scenariosService.ts";
import {folderId, teamId} from "../../App.tsx";

interface ScenarioRun {
  scenarioId: number,
  numOfRuns: number,
  lastRun: string | null,
  isCompleted: boolean,
  isSuccessful: boolean,
  subtitle: string,
  title: string,
  isRunning: boolean,
  runDuration: number
}


export const RunScenariosPage = () => {
  const [errorMsg, setErrorMsg] = useState<string | string[]>('')
  const [scenarios, setScenarios] = useState<ScenarioRun[]>([]);

  const handleSubmission = () => {

  }

  useEffect(() => {
    const listScenarios = async() => {
      try {
        const response = await getUserScenarios(teamId, folderId )

        const scenarios: ScenarioRun[] = response.data.map((scenario, index) => {
          let subtitle;

          if(scenario.name.toLowerCase().includes('donation')) {
            subtitle = "Configure your donations"
          }
          else if (scenario.name.toLowerCase().includes('invoice')){
            subtitle = "Configure your Invoices"
          }
          else if(scenario.name.toLowerCase().includes('payment')) {
            subtitle = "Configure your Payments"
          }
          else{
            subtitle = "Configure this workflow"
          }

          return {
            scenarioId: scenario.id,
            numOfRuns: 0,
            lastRun: null,
            isCompleted: false,
            isSuccessful: false,
            subtitle,
            title: scenario.name,
            isRunning: false,
            runDuration: 0
          }
        })

        setScenarios(scenarios)
      } catch (error) {
        console.error("Failed to activate scenarios:", error);
        setErrorMsg(error.response.data.message)
      }
    }

    listScenarios()
    // Empty dependency array means this only runs once on mount
  }, []);


  const runScenarios = async () => {
    setScenarios(current =>
      current.map((s) => ({...s, isRunning: true}))
    );

    setErrorMsg('')
    try {
      // Create a copy of scenarios to work with
      const updatedScenarios = [...scenarios];

      for (let i = 0; i < updatedScenarios.length; i++) {
        // Update single scenario to show it's running
        const scenario = updatedScenarios[i];
        let isActive = true;
        const startTime = Date.now();

        const scenarioDetails = await getScenarioDetails(scenario.scenarioId)
        // Activate if needed
        if (!scenarioDetails.data.isActive) {
          const activateResponse = await activateScenario(scenario.scenarioId);
          if (!activateResponse.data.isActive) {
            isActive = false;
          }
        }

        // Run the scenario with its specific ID
        if (isActive) {
          const response = await runScenario(scenario.scenarioId);
          console.log(response.data);

          // Check if successful and update accordingly
          const isSuccessful = response.data?.status === 1; // Adjust based on your API response

          setScenarios(current =>
            current.map((s, index) =>
              index === i ? {
                ...s,
                isRunning: false,
                isCompleted: true,
                isSuccessful,
                numOfRuns: s.numOfRuns + 1,
                lastRun: new Date().toLocaleString(),
                runDuration: Math.round((Date.now()-startTime)/1000)
              } : s
            )
          );
        }
      }
    }
    catch(e){
      console.log(e)
      setErrorMsg(e.response.data.error)
    }
    finally {
      setScenarios(current =>
        current.map(s => ({ ...s, isRunning: false }))
      );
    }
  }

  return (
    <PageTemplate
      title={'Run and Test Automation'}
      subTitle={'Test your automation by creating invoices or payments, and then clicking run to see expected results.'}
      validate={handleSubmission}
      errorMsg={errorMsg}
    >
      <div className=" mb-4 gap-3 d-flex flex-wrap justify-content-between">
        <div className="flex-grow-1">
          <strong>Run all workflows</strong>
          <p className="mt-1 text-muted" style={{ fontSize: '14px' }}>
            This will run all automations in this workplace
          </p>
        </div>
        <button
          style={{ backgroundColor: '#0D7CF2', fontSize: '14px' }}
          className="fw-bold pe-2 ps-2 pt-1 pb-1 align-self-center"
          onClick={runScenarios}
        >
          Run Now
        </button>
      </div>
      <div>
        <div className="row g-3">
          {scenarios.map((scenario, i) => <RunScenarioComponent key={i} scenario={scenario}/>)}
        </div>
      </div>

    </PageTemplate>
  )
}

interface RunScenarioProps {
  scenario: ScenarioRun
}

const RunScenarioComponent = ({ scenario}: RunScenarioProps) => {

  const getStatusIcon = () => {
    if(scenario.isRunning) return <RotateCw className={'text-info run-scenario-spinner'} style={{width: '20px'}} />

    else if(!scenario.isCompleted) return <PlayCircle style={{width: '20px'}}/>

    else if(scenario.isSuccessful) return <CheckCircle className={'text-success'} style={{width: '20px'}}/>

    else return <AlertCircle className={'text-danger'} style={{width: '20px'}} />

  };

  const getStatusText = () => {
    if(scenario.isRunning) return 'Running...'

    else if(!scenario.isCompleted) return 'Not run yet'

    else if(scenario.isSuccessful) return 'Completed'

    else return 'Failed'
  };

  return (
    <div className={'d-flex flex-column'}>
      <div className={`d-flex bg-light justify-content-between align-items-center p-3 border border-1 rounded-3 ${scenario.isCompleted ? 'rounded-bottom-0' : ''}`}>
        <div className="d-flex align-items-center gap-3">
          <div>{getStatusIcon()}</div>
          <div className="d-flex flex-column justify-content-center">
            <p className="text-dark fw-semibold" style={{ fontSize: 'calc(0.7em + 0.1vw)' }}>
              {scenario.title}
            </p>
            <p className="text-secondary" style={{ fontSize: 'calc(0.6em + 0.1vw)' }}>
              {scenario.subtitle}
            </p>
          </div>
        </div>
        <div className={'d-flex flex-column'}>
          <p className={'run-scenario-progress text-dark fw-bold text-truncate align-self-end'} style={{ fontSize: 'calc(0.6em + 0.1vw)' }}>{getStatusText()}</p>
          {!scenario.isRunning && scenario.lastRun && <p className={'run-scenario-progress text-truncate text-secondary'}
              style={{fontSize: 'calc(0.6em + 0.1vw)'}}>Last run: {scenario.lastRun}</p>}
        </div>
      </div>
      {scenario.isCompleted && <div className={'p-3 border border-1 rounded-3 border-top-0 rounded-top-0 d-grid gap-2 text-dark'}>
        <div className="">
          <div className="d-flex align-items-center gap-2">
            <Timer style={{width: '15px'}}/>
            <p style={{fontSize: 'calc(0.7em + 0.1vw)'}}>Time to execute: {(scenario.runDuration ? scenario.runDuration + 's' : '--')}</p>
          </div>
        </div>

        <div className="">
          <div className="d-flex align-items-center gap-2">
            <ClipboardList style={{width: '15px'}}/>
            <p style={{fontSize: 'calc(0.7em + 0.1vw)'}}>Total Runs: {scenario.numOfRuns || '--'}</p>
          </div>
        </div>
      </div>}
    </div>
  )
}
