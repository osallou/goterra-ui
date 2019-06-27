import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


interface EndpointProps {
    
}


interface EndpointState {
    msg: string
    ns: any
    endpoint: any
}

export class EndpointService {

    static hasSecret(nsid:string, endpoint:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/endpoint/" + endpoint + '/secret')
            .then(function (response) {
                resolve(true)
            })
            .catch(function (error) {
                // handle error
                reject(false)
            })
        })
    }

    static setSecret(nsid:string, endpoint:string, name:string, password: string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            let secret = {
                name: name,
                password: password
            }
            axios.put(root + "/deploy/ns/" + nsid + "/endpoint/" + endpoint + '/secret', secret)
            .then(function (response) {
                resolve(true)
            })
            .catch(function (error) {
                // handle error
                reject(false)
            })
        })
    }

    static get(nsid:string, endpoint:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/endpoint/" + endpoint)
            .then(function (response) {
                // handle success
                resolve(response.data.endpoint)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static create(nsid:string, endpoint:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.post(root + "/deploy/ns/" + nsid + "/endpoint", endpoint)
            .then(function (response) {
                // handle success
                resolve(response.data.endpoint)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static update(nsid:string, endpoint:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.put(root + "/deploy/ns/" + nsid + "/endpoint/" + endpoint.id, endpoint)
            .then(function (response) {
                // handle success
                resolve(response.data.endpoint)
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
    endpointid: string
}

interface EndpointProps {
    endpoint: any
    ns: string
}

interface EndpointCardState {
    name:string
    password:string
    secretMsg:string
}

class EndpointCard extends React.Component<EndpointProps,EndpointCardState> {

    constructor(props:EndpointProps) {
        super(props);
        this.state = {
            name: "",
            password: "",
            secretMsg: ""
        }
        this.setSecret = this.setSecret.bind(this)
        this.updateSecret = this.updateSecret.bind(this)
    }

    componentDidMount() {
        let ctx =this
        if (this.props.endpoint.id === undefined) {return}
        EndpointService.hasSecret(this.props.ns, this.props.endpoint.id).then(res => {
            ctx.setState({secretMsg: "You already have some credentials for this endpoint"})
        }).catch(err => {
            ctx.setState({secretMsg: "No credentials defined yet"})
        })
    }

    componentDidUpdate(prevProps: EndpointProps, _: EndpointCardState) {
        let ctx = this
        if (this.props.endpoint.id === undefined) {return}

        if(prevProps.endpoint.id !== this.props.endpoint.id) {
            EndpointService.hasSecret(this.props.ns, this.props.endpoint.id).then(res => {
                ctx.setState({secretMsg: "You already have some credentials for this endpoint"})
            }).catch(err => {
                ctx.setState({secretMsg: "No credentials defined yet"})
            })
        }
    }

    updateSecret(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            switch(event.currentTarget.name) {
                case "name": {
                    this.setState({name: event.currentTarget.value})
                    break
                }
                case "password": {
                    this.setState({password: event.currentTarget.value})
                    break
                }
            }
        }
    }

    setSecret(){
        let ctx = this
        EndpointService.setSecret(this.props.ns, this.props.endpoint.id, this.state.name, this.state.password).then(res => {
            ctx.setState({secretMsg: "Secret updated"})
        }).catch(err => {
            ctx.setState({secretMsg: err.message})
        })

    }

    render() {
        return (
            <div className="card">
                { this.props.endpoint.id && 
                <div className="card-body">
                    <div className="card">
                        <div className="card-header">Endpoint credentials [{this.state.secretMsg}]</div>
                        <div className="card-body">
                            <div className="form-group row">
                                <label htmlFor="name">Name</label>
                                <input className="form-control" name="name" value={this.state.name} onChange={this.updateSecret}/>
                            </div>
                            <div className="form-group row">
                                <label htmlFor="password">Password</label>
                                <input className="form-control" name="password" value={this.state.password} onChange={this.updateSecret}/>
                            </div>
                            <div className="form-group row">
                                <button type="button" className="btn btn-primary" onClick={this.setSecret}>Add credentials</button>
                            </div>
                        </div>
                    </div>
                    <form className="form">
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" readOnly value={this.props.endpoint.name}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Description</label>
                            <input className="form-control" name="name" readOnly value={this.props.endpoint.description}/>
                        </div>
                        <h4>Configuration</h4>
                        {  Object.keys(this.props.endpoint.config).map((key:string, _: number) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}</label>
                                <input className="form-control" name="name" readOnly value={this.props.endpoint.config[key]}/>
                            </div>                            
                        ))}
                        <h4>Images</h4>
                        {  Object.keys(this.props.endpoint.images).map((key:string, _: number) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}</label>
                                <input className="form-control" name="name" readOnly value={this.props.endpoint.images[key]}/>
                            </div>                            
                        ))}
                        <h4>Features</h4>
                        {  Object.keys(this.props.endpoint.features).map((key:string, _: number) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}</label>
                                <input className="form-control" name="name" readOnly value={this.props.endpoint.features[key]}/>
                            </div>                            
                        ))}                       
                    </form>
                </div>
                }
            </div>
        )
    }
}

export class EndpointSpace extends React.Component<RouteComponentProps<MatchParams>, EndpointState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: this.props.match.params.nsid,
            endpoint: {},
        }
    }

    componentDidMount() {
        let ctx = this
        EndpointService.get(this.props.match.params.nsid, this.props.match.params.endpointid).then(endpoint => {
            ctx.setState({endpoint: endpoint})
        }).catch(error => {
            ctx.setState({msg: error.message})
        })

    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item" aria-current="page"><Link to={`/ns`}>namespaces</Link></li>
                    <li className="breadcrumb-item" aria-current="page"><Link to={`/ns/${this.state.ns}`}>{this.state.ns}</Link></li>
                    <li className="breadcrumb-item" aria-current="page">endpoint</li>
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns}/endpoint/${this.state.endpoint["id"]}`}>{this.state.endpoint["id"]}</Link></li>
                </ol>
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to={`/ns/${this.state.ns}/edit/endpoint/${this.state.endpoint["id"]}`}>Edit</Link></li>
                </ol>
                </nav>
                </div>
                <div className="col-sm-12">
                    <EndpointCard ns={this.state.ns} endpoint={this.state.endpoint}/>
                </div>
            </div>
        )
    }
}