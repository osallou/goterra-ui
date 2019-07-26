import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'
import * as moment from 'moment';
import axios from "axios"

import {Auth} from './Auth/Auth'
import {NameSpaceService} from './Namespace'
import {RunActionDialog} from './RunActionDialog'
import {EndpointService} from './Endpoint'
import {AppService} from './Apps'


import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


import './Runs.css'

interface Run {

}

interface RunsProps {

}

export class RunService {

    static run(nsid: string, app:string, run:any): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.post(root + "/deploy/ns/" + nsid + "/run/" + app, run)
            .then(function (response) {
                // handle success
                resolve(response.data.run)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }
    static list(): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/deploy/run", {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data.runs)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }

    static get(ns: string, run:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/deploy/ns/" + ns + "/run/" + run, {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }

    static stop(ns: string, run:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.delete(root + "/deploy/ns/" + ns + "/run/" + run.id, {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                },
                data: run
            })
            .then(function (response) {
                // handle success
                resolve(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }

    static getAgentInfo(ns: string, run:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            //	r.HandleFunc("/run-agent/ns/{id}/run/{run}", GetRunStatusHandler).Methods("GET")              // deploy app

            axios.get(root + "/run-agent/ns/" + ns + "/run/" + run, {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }

    static getStoreInfo(deployment: string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/store/" + deployment, {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data.deployment)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }

    static getStoreInfoStatus(deployment: string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/store/" + deployment, {
                params: {
                    "filter": "status"
                },
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data.deployment)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }
}

interface RunsState {
    runs: any[]
    run: any | null
    msg: string
    runningOnly: boolean,
}

function addZeroBefore(n:number) {
    return (n < 10 ? '0' : '') + n;
  }

function timeConverter(UNIX_timestamp:number){
    if (UNIX_timestamp === undefined || UNIX_timestamp === 0) {
        return ""
    }
    try {
        var a = new Date(UNIX_timestamp * 1000);
        // var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = a.getMonth();
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = addZeroBefore(date)+ '/' + addZeroBefore(month) + '/' + year + ' ' + addZeroBefore(hour) + ':' + addZeroBefore(min) + ':' + addZeroBefore(sec) ;
        return time;
    } catch(err) {
        return ""
    }
}


  interface RunCardProps {
    run: any
}

interface RunCardState {
    store: any | null
    status: any | null
    msg: string
    endpoints: any
    confirmRunAction: boolean
    hasSecret: boolean
}

interface RunProgressProps {
    status: string
    action: string
}

class RunProgress extends React.Component<RunProgressProps> {

    getInitClass() {
        switch (this.props.status)  {
            case "pending":
                return "running";
            default:
                return "completed"
        }
    }

    getProgressClass() {
        switch (this.props.status)  {
            case "pending":
                return "waiting";
            case "in_progress":
                return "running"
            default:
                return "completed"
        }
    }

    getDoneClass() {
        switch (this.props.status)  {
            case "pending":
                return "waiting";
            case "in_progress":
                return "waiting"
            case "success":
                return "completed"
            case "failure":
                return "failed"
            default:
                return ""
        }
    }


    render() {
        return (
            <div>
                <div className="md-stepper-horizontal">
                    <div className={"md-step active " + this.getInitClass()}>
                    <div className="md-step-circle"><span>1</span></div>
                    <div className="md-step-title">{ this.props.status === "pending" ? "Waiting to schedule": " Scheduled"}</div>
                    <div className="md-step-bar-left"></div>
                    <div className="md-step-bar-right"></div>
                    </div>
                    <div className={"md-step active " + this.getProgressClass()}>
                    <div className="md-step-circle"><span>2</span></div>
                    <div className="md-step-title">{this.props.action.indexOf("deploy") > -1 ? "Deploying" : "Destroying"}</div>
                    <div className="md-step-bar-left"></div>
                    <div className="md-step-bar-right"></div>
                    </div>
                    <div className={"md-step active " + this.getDoneClass()}>
                    <div className="md-step-circle"><span>{this.props.status === "failure" ? <FontAwesomeIcon icon="exclamation"/> : 3}</span></div>
                    <div className="md-step-title">{this.props.status.indexOf("success") > -1 ? "Done" : this.getDoneClass() === "waiting" ? "Waiting": "Failed"}</div>
                    <div className="md-step-bar-left"></div>
                    <div className="md-step-bar-right"></div>
                    </div>
                </div>
            </div>
        )
    }
}

  class RunCard extends React.Component<RunCardProps, RunCardState> {

    constructor(props:RunCardProps) {
        super(props);
        this.state = {
            store: null,
            status: null,
            msg: "",
            endpoints: {},
            confirmRunAction: false,
            hasSecret: false
        }
        this.getStoreInfo = this.getStoreInfo.bind(this)
        this.stop = this.stop.bind(this)
        this.getEndpointName = this.getEndpointName.bind(this)

        this.onRunActionConfirm = this.onRunActionConfirm.bind(this)
        this.onRunActionCancel = this.onRunActionCancel.bind(this)
        this.requestRunActionConfirm = this.requestRunActionConfirm.bind(this)
    }

    requestRunActionConfirm() {
        this.setState({confirmRunAction: true})
    }

    onRunActionCancel() {
        this.setState({confirmRunAction: false})
    }
    onRunActionConfirm(username:string, password:string) {
        if(!this.state.hasSecret) {
        this.props.run.secretinputs["user_name"] = username
        this.props.run.secretinputs["password"] = password
        }
        this.setState({confirmRunAction: false})
        this.stop()
    }

    getMainStatus() {
        return this.props.run.status.replace("destroy_", "").replace("deploy_", "")
    }

    stop() {
        let ctx = this
        let run = {...this.props.run}
        run.outputs = ""
        RunService.stop(this.props.run.namespace, run).then(res => {
            ctx.setState({msg: "Stop request sent"})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }

    getStoreInfo() {
        let ctx = this
        if (this.props.run.deployment === undefined || this.props.run.deployment === ""){
            return
        }
        RunService.getStoreInfo(ctx.props.run.deployment).then(depl => {
            ctx.setState({store: depl})
            console.log("depl store", depl)
        }).catch(err => {})
    }

    componentDidMount() {
        let ctx = this
        NameSpaceService.endpoints(this.props.run.namespace).then(endpoints => {
            let ns_endpoints:any = {}
            for(let i=0;i<endpoints.length;i++) {
                let endpoint = endpoints[i]
                ns_endpoints[endpoint.id] = endpoint
            }

            AppService.public_endpoints().then(public_endpoints => {
                for(let i=0;i<public_endpoints.length;i++) {
                    let endpoint = public_endpoints[i]
                    ns_endpoints[endpoint.id] = endpoint
                } 
                ctx.setState({endpoints: ns_endpoints})
            }).catch(_ => {
                console.log("failed to fetch public endpoints")
                ctx.setState({endpoints: ns_endpoints})
            })

        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        if(this.props.run.deployment !== undefined && this.props.run.deployment !== ""){
            RunService.getStoreInfoStatus(this.props.run.deployment).then(depl => {
                ctx.setState({status: depl})
            })
        }
        EndpointService.hasSecret(this.props.run.namespace, this.props.run.endpoint).then(_ => {
            ctx.setState({hasSecret: true})
        }).catch(_ => {
            ctx.setState({hasSecret: false})
        })
    }

    componentDidUpdate(prevProps: RunCardProps, _: RunCardState) {

        let ctx = this

        if(prevProps.run.id === this.props.run.id) {
            // no run change
            return
        }
        ctx.setState(({store: null, status: null}))
        if(this.props.run.deployment !== undefined && this.props.run.deployment !== ""){
            RunService.getStoreInfoStatus(this.props.run.deployment).then(depl => {
                ctx.setState({status: depl})
                //console.log("depl statuses", depl)
            })
        }

        EndpointService.hasSecret(this.props.run.namespace, this.props.run.endpoint).then(_ => {
            ctx.setState({hasSecret: true})
        }).catch(_ => {
            ctx.setState({hasSecret: false})
        })
    }

    getEndpointName(id: string):string {
        return this.state.endpoints[id] ? (this.state.endpoints[id].name + "[" + id + "]") : id
    }

    render() {
        return (
            <div className="card run">
               <div className="card-header">{this.props.run.id}</div>
                <div className="card-body">
                <form onSubmit={e => { e.preventDefault(); }}>
                        { this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                        <div className="row">
                            <RunProgress action={this.props.run.status} status={this.getMainStatus()}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.name}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="desc">Description</label>
                            <input className="form-control" name="desc" readOnly value={this.props.run.description}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="status">Status</label>
                            <input className="form-control" name="status" readOnly value={this.props.run.status}/>
                            { this.props.run.status !== "destroy_success" && <button type="button" className="btn btn-danger" onClick={this.requestRunActionConfirm}>stop</button>}
                        </div>
                        <div className="form-group row">
                            <label htmlFor="start">Start</label>
                            <input className="form-control" name="start" readOnly value={timeConverter(this.props.run.start)}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="end">End</label>
                            <input className="form-control" name="end" readOnly value={timeConverter(this.props.run.end)}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="app">Application</label>
                            <input className="form-control" name="app" readOnly value={this.props.run.appID}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="ns">Namespace</label>
                            <input className="form-control" name="ns" readOnly value={this.props.run.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="endpoint">Endpoint</label>
                            <input className="form-control" name="endpoint" readOnly value={this.getEndpointName(this.props.run.endpoint)}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="depl">Deployment</label>
                            <input className="form-control" name="depl" readOnly value={this.props.run.deployment}/>
                        </div>
                        <h5>Outputs</h5>
                        {Object.keys(this.props.run.outputs).map((key, index) => (
                        <div className="form-group row" key={index}>
                            <label htmlFor={key}>{key}</label>
                            <input className="form-control" name={key} readOnly value={this.props.run.outputs[key].value}/>
                        </div>                            
                        ))}
                        { this.props.run.error &&
                        <div className="form-group row">
                               <label htmlFor="error">Error</label>
                               <textarea rows={20} className="form-control" name="error" readOnly value={this.props.run.error}/>
                        </div>
                        }
                        <h5>Events</h5>
                        {this.props.run.events && this.props.run.events.map((event:any, index:number) => (
                            <div className="form-group row" key={this.props.run.id + "-" + event.ts}>
                               <label htmlFor={event.ts}>{timeConverter(event.ts)}</label>
                               <input className="form-control" name={event.ts} readOnly value={event.action + "-> " + event.success}/>
                           </div>                   
                        ))}
                        <h5>Recipes status</h5>
                        {this.state.status && Object.keys(this.state.status).map((key, index) => (
                         <div className="form-group row" key={index}>
                            <label htmlFor={key}>{key}</label>
                            <input className="form-control" name={key} readOnly value={this.state.status[key]}/>
                        </div>                           
                        ))}
                        {(this.state.status === null &&  this.props.run.status === "deploy_success") && <div className="form-group row">
                            <span>Recipes waiting for execution</span>
                        </div>}
                        <h5>Store information</h5>
                        <button type="button" className="btn btn-secondary" onClick={this.getStoreInfo}>Show</button>
                        {this.state.store && Object.keys(this.state.store).map((key, index) => (
                         <div className="form-group row" key={index}>
                            <label htmlFor={key}>{key}</label>
                        { key.indexOf("_") !== 0 && <input className="form-control" name={key} readOnly value={this.state.store[key]}/> }
                        { key.indexOf("_") === 0 && <textarea rows={20} className="form-control" name={key} readOnly value={this.state.store[key]}/> }
                        </div>                           
                        ))}
                </form>
                <RunActionDialog hasSecret={this.state.hasSecret} show={this.state.confirmRunAction} data={null} msg="" title="Confirm run deletion" onCancel={this.onRunActionCancel} onConfirm={this.onRunActionConfirm}/>                 
                </div>
                
            </div>
        )
    }
}
    

export class Runs extends React.Component<RouteComponentProps<{}>, RunsState> {

    constructor(props:RouteComponentProps<{}>) {
        super(props);
        this.state = {
            runs: [],
            run: null,
            msg: "",
            runningOnly: false,
        }
        this.selectRun = this.selectRun.bind(this)
        this.refresh = this.refresh.bind(this)
        this.getDuration = this.getDuration.bind(this)
        this.onChangeRunningOnly = this.onChangeRunningOnly.bind(this)

    }

    componentDidMount() {
        let ctx = this
        if (Auth.user !==null) {
            RunService.list().then(runs => {
                ctx.setState({runs: runs})
            })
        }
    }

    refresh() {
        let ctx = this
        RunService.list().then(runs => {
            ctx.setState({runs: runs, run: null})
        }).catch(err => {
            console.log("failed to refresh list")
        })
    }

    selectRun(run: any) {
        let ctx =this
        return function() {
            try {
                run.outputs = JSON.parse(run.outputs)
            } catch(err) {
                console.log("outputs cannot be parsed")
            }
            ctx.setState({run: run})
        }
    }

    getClassStatus(status:string) {
        if (status.indexOf("success")) {
            return "success"
        }
        if (status.indexOf("failure")) {
            return "failure"
        }
        if (status.indexOf("pending")) {
            return "pending"
        }
        return ""
    }

    onChangeRunningOnly(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            let runningOnly = this.state.runningOnly
            if (event.currentTarget.checked) {
                runningOnly = true
            } else {
                runningOnly = false
            }
            this.setState({runningOnly: runningOnly})
        }
    }

    getDuration(run:any):string {
        // console.log("run duration", run.start, run.end, moment.duration(run.end - run.start))
        if (run.end === 0) {
            return moment.duration(new Date().getTime() - (run.start * 1000)).humanize()
        }
        else {
            return moment.duration((run.end - run.start)*1000).humanize()
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/run`}>run</Link></li>
                    <li className="breadcrumb-item"><button type="button" className="btn btn-secondary" onClick={this.refresh}>Refresh</button></li>
                </ol>
                </nav>
                </div>
                <div className="col-sm-12">
                    <div className="row">
                        <div className="col-sm-3">
                            <div className="form-check">
                                <input onChange={this.onChangeRunningOnly} type="checkbox" className="form-check-input" id="runningOnly" checked={this.state.runningOnly}/>
                                <label className="form-check-label" htmlFor="runningOnly">Running only</label>
                            </div>
                            <table className="table runs">
                                <tbody>
                                {this.state.runs.map((run:any, _:number) => {
                                    if (this.state.runningOnly && run.end > 0) {
                                        return null
                                    }
                                    return (<tr  key={run["id"]}>
                                    <td onClick={this.selectRun(run)}>
                                        <p><small>{timeConverter(run["start"])} [{run["UID"]} - #{run["id"].slice(-5)}]</small></p>
                                        <p>{run["name"]} <span className={run["status"]}>{run["status"]}</span></p>
                                        <div>
                                        <p><FontAwesomeIcon icon="clock"/> Duration: {this.getDuration(run)}</p>
                                        { run["end"] > 0 &&
                                        <p><FontAwesomeIcon icon="calendar-alt"/> Finished: {moment.duration(new Date().getTime() - (run.end * 1000)).humanize()}</p>
                                        }
                                        </div>
                                    </td>
                                    </tr>)
                                }
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-sm-9">
                        {this.state.run && <RunCard run={this.state.run}/>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}