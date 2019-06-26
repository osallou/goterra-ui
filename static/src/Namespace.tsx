import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


interface NameSpaceProps {
    ns: NameSpace
}


interface NamespaceState {
    msg: string
    ns: any
    endpoints: any[]
    recipes: any[]
    apps: any[]
}

export class NameSpaceService {
    static get(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid)
            .then(function (response) {
                // handle success
                resolve(response.data.ns)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static endpoints(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/endpoint")
            .then(function (response) {
                // handle success
                resolve(response.data.endpoints)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static recipes(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/recipe")
            .then(function (response) {
                // handle success
                resolve(response.data.recipes)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    } 
    
    static apps(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/app")
            .then(function (response) {
                // handle success
                resolve(response.data.apps)
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
}

interface EndpointProps {
    endpoint: any
    ns: string
}

class EndpointCard extends React.Component<EndpointProps> {

    constructor(props:EndpointProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{this.props.endpoint.name} [{this.props.endpoint.kind}]</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{this.props.endpoint["id"]}</h6>
                    <p className="card-text">
                    <Link to={`/ns/${this.props.ns}/endpoint/${this.props.endpoint["id"]}`}><FontAwesomeIcon icon="sign-out-alt"/></Link>
                    </p>
                </div>
            </div>
        )
    }
}

export class NameSpace extends React.Component<RouteComponentProps<MatchParams>, NamespaceState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: {},
            endpoints: [],
            recipes: [],
            apps: []
        }
    }

    componentDidMount() {
        let ctx = this
        NameSpaceService.get(this.props.match.params.nsid).then(ns => {
            ctx.setState({ns: ns})
        }).catch(error => {
            ctx.setState({msg: error})
        })

        NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
            ctx.setState({endpoints: endpoints})
        }).catch(error => {
            ctx.setState({msg: error})
        })

        NameSpaceService.recipes(this.props.match.params.nsid).then(recipes => {
            ctx.setState({recipes: recipes})
        }).catch(error => {
            ctx.setState({msg: error})
        })

        NameSpaceService.apps(this.props.match.params.nsid).then(apps => {
            ctx.setState({apps: apps})
        }).catch(error => {
            ctx.setState({msg: error})
        })
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item" aria-current="page"><Link to={`/ns`}>namespaces</Link></li>
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns["_id"]}`}>{this.state.ns["_id"]}</Link></li>

                </ol>
                </nav>

                </div>
                <div className="col-sm-6">
                    <div className="card">
                        <div className="card-header">Owners</div>
                        <div className="card-body">
                        {this.state.ns["owners"] && this.state.ns["owners"].map((owner:string, _:number) => (
                            <div key={owner}>{owner}</div>
                        ))}
                        </div>
                    </div>
                    { this.state.ns["members"] &&
                    <div className="card">
                        <div className="card-header">Members</div>
                        <div className="card-body">
                            <div>Quantity: {this.state.ns["members"].length}</div>
                            { Auth.user && Auth.user.admin && this.state.ns["members"].map((member:string, _:number) => (
                            <div key={member}>{member}</div>
                        ))}
                        </div>
                    </div>
                    }
                </div>
                <div className="col-sm-6">
                    <div className="card">
                        <div className="card-header">Endpoints</div>
                        <div className="card-body">
                        {this.state.endpoints && this.state.endpoints.map((endpoint, index) => {
                        return (<div key={index}><EndpointCard ns={this.state.ns["_id"]} endpoint={endpoint}/></div>)
                        })}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Recipes <Link to={`/ns/${this.state.ns["_id"]}/recipe`}><FontAwesomeIcon icon="sign-out-alt"/></Link></div>
                        <div className="card-body">
                        {this.state.recipes && <div>{this.state.recipes.length}</div>}
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Applications <Link to={`/ns/${this.state.ns["_id"]}/app`}><FontAwesomeIcon icon="sign-out-alt"/></Link></div>
                        <div className="card-body">
                        {this.state.apps && <div>{this.state.apps.length}</div>}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}