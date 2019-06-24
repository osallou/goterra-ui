import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {Auth} from './Auth/Auth'


interface Run {

}

interface RunsProps {

}

class RunService {
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
                resolve(response.data.runs.reverse())
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
                resolve(response.data)
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
}

function timeConverter(UNIX_timestamp:number){
    if (UNIX_timestamp === undefined) {
        return ""
    }
    try {
        var a = new Date(UNIX_timestamp * 1000);
        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
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
}

  class RunCard extends React.Component<RunCardProps, RunCardState> {

    constructor(props:RunCardProps) {
        super(props);
        this.state = {
            store: null,
            status: null
        }
        this.getStoreInfo = this.getStoreInfo.bind(this)
    }

    getStoreInfo() {
        let ctx = this
        if (this.props.run.deployment === undefined || this.props.run.deployment === ""){
            return
        }
        //return function() {
        RunService.getStoreInfo(ctx.props.run.deployment).then(depl => {
            ctx.setState({store: depl})
            console.log("depl store", depl)
        }).catch(err => {})
        //}
    }

    componentDidUpdate(prevProps: RunCardProps, _: RunCardState) {
        let ctx = this

        if(prevProps.run.id == this.props.run.id) {
            // no run change
            return
        }
        ctx.setState(({store: null, status: null}))
        if(this.props.run.deployment !== undefined && this.props.run.deployment !== ""){
            RunService.getStoreInfoStatus(this.props.run.deployment).then(depl => {
                ctx.setState({status: depl})
                console.log("depl statuses", depl)
            })
        }
    }

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.run.id}</div>
                <div className="card-body">
                <form>
                        <div className="form-group row">
                            <label htmlFor="name">Status</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.status}/>
                        </div>
                        
                        <div className="form-group row">
                            <label htmlFor="name">Start</label>
                            <input className="form-control" name="name" readOnly value={timeConverter(this.props.run.start)}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">End</label>
                            <input className="form-control" name="name" readOnly value={timeConverter(this.props.run.end)}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Application</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.appID}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Namespace</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Endpoint</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.endpoint}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Deployment</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.deployment}/>
                        </div>
                        <h5>Outputs</h5>
                        {Object.keys(this.props.run.outputs).map((key, index) => (
                        <div className="form-group row" key={index}>
                            <label htmlFor="name">{key}</label>
                            <input className="form-control" name="name" readOnly value={this.props.run.outputs[key].value}/>
                        </div>                            
                        ))}
                        <h5>Events</h5>
                        {this.props.run.events && this.props.run.events.map((event:any, index:number) => (
                            <div className="form-group row" key={this.props.run.id + "-" + event.ts}>
                               <label htmlFor="name">{timeConverter(event.ts)}</label>
                               <input className="form-control" name="name" readOnly value={event.action + "-> " + event.success}/>
                           </div>                   
                        ))}
                        <h5>Recipes status</h5>
                        {this.state.status && Object.keys(this.state.status).map((key, index) => (
                         <div className="form-group row" key={index}>
                            <label htmlFor="name">{key}</label>
                            <input className="form-control" name="name" readOnly value={this.state.status[key]}/>
                        </div>                           
                        ))}
                        <h5>Store information</h5>
                        <button type="button" className="btn btn-secondary" onClick={this.getStoreInfo}>Show</button>
                        {this.state.store && Object.keys(this.state.store).map((key, index) => (
                         <div className="form-group row" key={index}>
                            <label htmlFor="name">{key}</label>
                            <input className="form-control" name="name" readOnly value={this.state.store[key]}/>
                        </div>                           
                        ))}
                </form>                  
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
            msg: ""
        }
        this.selectRun = this.selectRun.bind(this)
    }

    componentDidMount() {
        let ctx = this
        if (Auth.user !==null) {
            RunService.list().then(runs => {
                ctx.setState({runs: runs})
            })
        }
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
            /*
            RunService.getAgentInfo(run.namespace, run.id).then(runInfo => {
                try {
                runInfo.outputs = JSON.parse(runInfo.outputs)
                } catch(err) {
                    console.log("outputs cannot be parsed")
                }
                ctx.setState({runInfo: runInfo})
            }).catch(error => {
                ctx.setState({msg: error})
            })
            */
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/run`}>run</Link></li>
                </ol>
                </nav>
                </div>
                <div className="col-sm-12">
                    <div className="row">
                        <div className="col-sm-6">
                            <table className="table">
                                <tbody>
                                {this.state.runs.map((run:any, _:number) => {
                                    return (<tr  key={run["id"]}>
                                    <td>{timeConverter(run["start"])}</td>
                                    <td onClick={this.selectRun(run)}>{run["id"]}</td>
                                    <td>{run["status"]}</td>
                                    </tr>)
                                }
                                )}
                                </tbody>
                            </table>
                        </div>
                        <div className="col-sm-6">
                        {this.state.run && <RunCard run={this.state.run}/>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}