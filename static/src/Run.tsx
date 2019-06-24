import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class RunService {
    static get(nsid:string, run:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/run/" + run)
            .then(function (response) {
                // handle success
                resolve(response.data.run)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static list_app(nsid:string, app:string): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/run/" + app)
            .then(function (response) {
                // handle success
                resolve(response.data.runs)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }


    static list(nsid:string): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/run")
            .then(function (response) {
                // handle success
                resolve(response.data.runs)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

}



interface MatchParams {
    nsid: string
    runid: string
}

interface RunState {
    msg: string
    ns: any
    run: any | null
    runs: any[]
}

interface RunSmallCardProps {
    run: any
    ns: string
    onPress: Function
}

interface RunCardProps {
    run: any
    ns: string
}

class RunSmallCard extends React.Component<RunSmallCardProps> {

    constructor(props:RunSmallCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header" onClick={this.props.onPress(this.props.run)}>{this.props.run.id}</div>
                <div className="card-body">

                </div>
                
            </div>
        )
    }
}

class RunCard extends React.Component<RunCardProps> {

    constructor(props:RunCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.run.id}</div>
                <div className="card-body">
                   
                </div>
                
            </div>
        )
    }
}


export class RunSpace extends React.Component<RouteComponentProps<MatchParams>, RunState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: this.props.match.params.nsid,
            run: null,
            runs: []
        }

        this.selectRun = this.selectRun.bind(this)
    }

    selectRun(run: any) {
        let ctx =this
        return function() {
            ctx.setState({run: run})
        }
    }

    componentDidMount() {
        let ctx = this
        if (this.props.match.params.runid === undefined){
            RunService.list(this.props.match.params.nsid).then(runs => {
                this.setState({runs: runs})
            }).catch(error => {
                this.setState({msg: error})
            })
        } else {
            RunService.get(this.props.match.params.nsid, this.props.match.params.runid).then(run => {
                this.setState({run: run})
            }).catch(error => {
                this.setState({msg: error})
            })
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item" aria-current="page"><Link to={`/ns`}>namespaces</Link></li>
                    <li className="breadcrumb-item" aria-current="page"><Link to={`/ns/${this.state.ns}`}>{this.state.ns}</Link></li>
                    <li className="breadcrumb-item" aria-current="page">run</li>
                    {this.state.run && <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns}/recipe/${this.state.run["id"]}`}>{this.state.run["id"]}</Link></li>}

                </ol>
                </nav>
                </div>
                <div className="col-sm-6">
                    <div className="row">
                    {this.state.runs.map((run:any, index: number) => (
                        <div className="col-sm-6" key={run.id}><RunSmallCard onPress={this.selectRun} run={run} ns={this.state.ns}/></div>
                    ))}
                    </div>
                </div>
                <div className="col-sm-6">
                    { this.state.run && <RunCard run={this.state.run} ns={this.state.ns}/> }
                </div>
            </div>
        )
    }
}