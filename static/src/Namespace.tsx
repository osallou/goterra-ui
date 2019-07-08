import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {AppService} from './Apps'


interface NameSpaceProps {
    ns: NameSpace
}


interface NamespaceState {
    msg: string
    ns: any
    endpoints: any[]
    public_endpoints: any[]
    recipes: any[]
    templates: any[]
    apps: any[],
    acct: any[],
    acctMonth: any[]
}

export class NameSpaceService {

    static getAcct(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/acct/ns/" + nsid)
            .then(function (response) {
                // handle success
                resolve(response.data.acct)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static getAcctFrom(nsid:string, from:number): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/acct/ns/" + nsid + "/from/" + from)
            .then(function (response) {
                // handle success
                resolve(response.data.acct)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }
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

    static templates(nsid:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/template")
            .then(function (response) {
                // handle success
                resolve(response.data.templates)
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

    /*
    constructor(props:EndpointProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{this.props.endpoint.name} [{this.props.endpoint.kind}]</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{this.props.endpoint["id"]}
                    { this.props.endpoint.public === true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.endpoint.public === false && <FontAwesomeIcon icon="lock"/>}
                    </h6>
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
            templates: [],
            recipes: [],
            apps: [],
            public_endpoints: [],
            acct: [],
            acctMonth: []
        }
    }

    componentDidMount() {
        let ctx = this
        NameSpaceService.get(this.props.match.params.nsid).then(ns => {
            ctx.setState({ns: ns})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
            ctx.setState({endpoints: endpoints})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        AppService.public_endpoints().then(endpoints => {
            ctx.setState({public_endpoints: endpoints})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.recipes(this.props.match.params.nsid).then(recipes => {
            ctx.setState({recipes: recipes})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.templates(this.props.match.params.nsid).then(templates => {
            ctx.setState({templates: templates})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.apps(this.props.match.params.nsid).then(apps => {
            ctx.setState({apps: apps})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.getAcct(this.props.match.params.nsid).then(acct => {
            ctx.setState({acct: acct})
        }).catch(error => {
            ctx.setState({msg: error.message})
        })

        var date = new Date()
        var firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
        NameSpaceService.getAcctFrom(this.props.match.params.nsid, firstDay.getTime()/1000).then(acctMonth => {
            ctx.setState({acctMonth: acctMonth})
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
                        <br/>
                        {this.state.public_endpoints && this.state.public_endpoints.map((endpoint, index) => {
                        return (<div key={index}><EndpointCard ns={this.state.ns["_id"]} endpoint={endpoint}/></div>)
                        })}
                        <Link to={`/ns/${this.state.ns["_id"]}/edit/endpoint`}><button type="button" className="btn btn-primary">Create</button></Link>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Recipes <Link to={`/ns/${this.state.ns["_id"]}/recipe`}><FontAwesomeIcon icon="sign-out-alt"/></Link></div>
                        <div className="card-body">
                        {this.state.recipes && <div>{this.state.recipes.length}</div>}
                        <Link to={`/ns/${this.state.ns["_id"]}/edit/recipe`}><button type="button" className="btn btn-primary">Create</button></Link>

                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Templates <Link to={`/ns/${this.state.ns["_id"]}/template`}><FontAwesomeIcon icon="sign-out-alt"/></Link></div>
                        <div className="card-body">
                        {this.state.templates && <div>{this.state.templates.length}</div>}
                        <Link to={`/ns/${this.state.ns["_id"]}/edit/template`}><button type="button" className="btn btn-primary">Create</button></Link>

                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">Applications <Link to={`/ns/${this.state.ns["_id"]}/app`}><FontAwesomeIcon icon="sign-out-alt"/></Link></div>
                        <div className="card-body">
                        {this.state.apps && <div>{this.state.apps.length}</div>}
                        <Link to={`/ns/${this.state.ns["_id"]}/edit/app`}><button type="button" className="btn btn-primary">Create</button></Link>

                        </div>
                    </div>
                </div>
                <div className="col-sm-12">
                <div className="card">
                    <div className="card-header">Accounting</div>
                    <div className="card-body">
                    <h5>Total</h5>
                    { this.state.acct.map((acct) => (
                            <table className="table">
                                <thead><th>Resource</th><th>Kind</th><th>Quantity</th><th>Duration</th></thead>
                                <tbody>
                            {acct.Series.map((serie:any) => (
                                <tr>
                                    <td>{serie.tags.resource}</td>
                                    <td>{serie.tags.kind}</td>
                                    <td>{serie.values[0][1]}</td>
                                    <td>{serie.values[0][2]}</td>
                                </tr>
                            ))}
                            </tbody>
                            </table>
                    ))}

                    <h5>This month</h5>
                    { this.state.acctMonth.map((acct) => (
                            <table className="table">
                                <thead><th>Resource</th><th>Kind</th><th>Quantity</th><th>Duration</th><th>Max</th></thead>
                                <tbody>
                            {acct.Series.map((serie:any) => (
                                <tr>
                                    <td>{serie.tags.resource}</td>
                                    <td>{serie.tags.kind}</td>
                                    <td>{serie.values[0][1]}</td>
                                    <td>{serie.values[0][2]}</td>
                                    <td>{serie.values[0][3]}</td>
                                </tr>
                            ))}
                            </tbody>
                            </table>
                )   )}
                    </div>
                </div>
                </div>
            </div>
        )
    }
}