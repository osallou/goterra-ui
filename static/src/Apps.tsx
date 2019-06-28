import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

// import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

 export class AppService {
    static get(nsid:string, app:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/app/" + app)
            .then(function (response) {
                // handle success
                resolve(response.data.app)
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

    static create(nsid:string, app:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.post(root + "/deploy/ns/" + nsid + "/app", app)
            .then(function (response) {
                // handle success
                resolve(response.data.app)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static update(nsid:string, app:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.put(root + "/deploy/ns/" + nsid + "/endpoint/" + app.id, app)
            .then(function (response) {
                // handle success
                resolve(response.data.app)
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
    appid: string
}

interface AppsState {
    msg: string
    ns: any
    app: any | null
    apps: any[]
}

interface AppSmallCardProps {
    app: any
    ns: string
    onPress: Function
}

interface AppCardProps {
    app: any
    ns: string
}

class AppSmallCard extends React.Component<AppSmallCardProps> {

    constructor(props:AppSmallCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header" onClick={this.props.onPress(this.props.app)}>{this.props.app.name}</div>
                <div className="card-body">
                    {this.props.app.description}
                    { this.props.app.public ==true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.app.public ==false && <FontAwesomeIcon icon="lock"/>}
                </div>
                
            </div>
        )
    }
}

class AppCard extends React.Component<AppCardProps> {

    constructor(props:AppCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.app.name} <Link to={`/ns/${this.props.ns}/edit/app/${this.props.app.id}`}><button type="button" className="btn btn-primary">Edit</button></Link></div>
                <div className="card-body">
                    {this.props.app.description}
                    { this.props.app.public ==true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.app.public ==false && <FontAwesomeIcon icon="lock"/>}

                    <form>
                        <div className="form-group row">
                            <label htmlFor="name">Id</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.name}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Description</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.description}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Base image</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.image}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Previous version</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.prev}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Recipes</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.recipes.join(",")}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Created</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.ts}/>
                        </div>
                        <h5>Templates</h5>
                        {this.props.app.templates && Object.keys(this.props.app.templates).map((template, _) => (
                            <div className="form-group row" key={template}>
                                <label htmlFor={"tpl"+template}>{template}</label>
                                <textarea rows={20} className="form-control" name={"tpl" + template} readOnly value={this.props.app.templates[template]}/>
                            </div>                            
                        ))}
                        <h5>Expected inputs</h5>
                        {this.props.app.inputs && Object.keys(this.props.app.inputs).map((key, _) => (
                        <div className="form-group row" key={key}>
                            <label htmlFor={"input"+key}>{key}</label>
                            <input className="form-control" name={"input"+key} readOnly value={this.props.app.inputs[key]}/>
                        </div>
                        ))}
                    </form>
                </div>
                
            </div>
        )
    }
}



export class AppsSpace extends React.Component<RouteComponentProps<MatchParams>, AppsState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: this.props.match.params.nsid,
            app: null,
            apps: []
        }
        this.selectApp = this.selectApp.bind(this)
    }

    selectApp(app: any) {
        let ctx =this
        return function() {
            ctx.setState({app: app})
        }
    }

    componentDidMount() {
        let ctx = this
        if (this.props.match.params.appid === undefined){
            AppService.list(this.props.match.params.nsid).then(apps => {
                this.setState({apps: apps})
            }).catch(error => {
                this.setState({msg: error})
            })
        } else {
            AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
                this.setState({app: app})
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
                    <li className="breadcrumb-item" aria-current="page">application</li>
                    {this.state.app && <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns}/app/${this.state.app["id"]}`}>{this.state.app["id"]}</Link></li>}

                </ol>
                </nav>
                </div>
                <div className="col-sm-6">
                <div className="row">
                    {this.state.apps.map((app:any, index: number) => (
                        <div className="col-sm-6" key={app.id}><AppSmallCard onPress={this.selectApp} app={app} ns={this.state.ns}/></div>
                    ))}
                    </div>
                </div>
                <div className="col-sm-6">
                { this.state.app && <AppCard app={this.state.app} ns={this.state.ns}/> }
                </div>
            </div>
        )
    }
}