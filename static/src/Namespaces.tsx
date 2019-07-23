import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {Auth} from './Auth/Auth'


interface NameSpace {
    name: string
    _id: string
    owners: string[]
    members: string[]
}

interface NameSpaceProps {
    ns: NameSpace
    key: string
}

export class NameSpaceService {

    static config() : Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/app/config")
            .then(function (response) {
                resolve(response.data)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static create(ns: any): Promise<NameSpace> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.post(root + "/deploy/ns", {"name": ns})
            .then(function (response) {
                resolve(response.data.ns)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static list(): Promise<NameSpace[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/deploy/ns", {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data.ns)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
    }
}

class NameSpaceCard extends React.Component<NameSpaceProps> {

    /*
    constructor(props:NameSpaceProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{this.props.ns.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{this.props.ns["_id"]}</h6>
                    <p className="card-text">
                    <Link to={`/ns/${this.props.ns["_id"]}`}><FontAwesomeIcon icon="sign-out-alt"/></Link>
                    </p>
                </div>
            </div>
        )
    }
}

interface NamespaceState {
    namespaces: NameSpace[]
    msg: string
    newns: string
    config: any
}

export class NameSpaces extends React.Component<RouteComponentProps<{}>, NamespaceState> {

    constructor(props:RouteComponentProps<{}>) {
        super(props);
        this.state = {
            namespaces: [],
            msg: "",
            newns: "",
            config: {}
        }
        this.onNewNSChange = this.onNewNSChange.bind(this)
        this.onNewNS = this.onNewNS.bind(this)
    }

    componentDidMount() {
        let ctx = this
        if (Auth.user !==null) {
            NameSpaceService.list().then(ns => {
                ctx.setState({namespaces: ns})
            })
        }
        NameSpaceService.config().then(cfg => {
            ctx.setState({config: cfg})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }
    
    onNewNS() {
        let ctx = this
        NameSpaceService.create(this.state.newns).then( () => {
            ctx.setState({newns: ""})
            NameSpaceService.list().then(ns => {
                ctx.setState({namespaces: ns})
            })     
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

    }

    onNewNSChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({newns: event.currentTarget.value})
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns`}>namespaces</Link></li>
                </ol>
                </nav>
                </div>
                <div className="col-sm-12">
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                </div>            
                {this.state.namespaces.map((namespace, index) => {
                    return (<div className="col-sm-3" key={namespace.name}><NameSpaceCard ns={namespace} key={namespace.name}/></div>)
                })}
                {Auth.user != null && this.state.config && this.state.config.acl_user_createns &&
                <div className="col-sm-3">
                    <div className="card">
                        <div className="card-header">Create new</div>
                        <div className="card-body">
                            <input className="form-control" value={this.state.newns} onChange={this.onNewNSChange}/>
                            <button className="btn btn-primary" onClick={this.onNewNS}>Create new</button>
                        </div>
                    </div>
                </div>}
                <div className="col-sm-12">
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                </div>  
            </div>
        )
    }
}