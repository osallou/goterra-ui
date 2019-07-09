import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

// import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

 export class AppService {

    static public_apps(): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/apps")
            .then(function (response) {
                resolve(response.data.apps)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static public_endpoints(): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/endpoints")
            .then(function (response) {
                resolve(response.data.endpoints)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static public_recipes(light_mode: boolean): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/recipes", {
                params: { light: light_mode ? "1": "0"}
            })
            .then(function (response) {
                resolve(response.data.recipes)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static public_templates(light_mode: boolean): Promise<any[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/templates", {
                params: { light: light_mode ? "1": "0"}
            })
            .then(function (response) {
                resolve(response.data.templates)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }

    static getInputs(nsid:string, app:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/app/" + app + "/inputs")
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
    publicApps: any[]

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

    /*
    constructor(props:AppSmallCardProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
               <div className="card-header" onClick={this.props.onPress(this.props.app)}>{this.props.app.name}</div>
                <div className="card-body">
                    {this.props.app.description}
                    { this.props.app.public === true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.app.public === false && <FontAwesomeIcon icon="lock"/>}
                    <div>ID: {this.props.app.id}</div>
                    <div>Version: {this.props.app.rversion}</div>
                    <div><Link to={`/ns/${this.props.ns}/run/app/${this.props.app.id}`}><button type="button" className="btn btn-primary">Run</button></Link></div>
                </div>
                
            </div>
        )
    }
}

class AppCard extends React.Component<AppCardProps> {

    /*
    constructor(props:AppCardProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.app.name} { this.props.ns === this.props.app.namespace && <Link to={`/ns/${this.props.app.namespace}/edit/app/${this.props.app.id}`}><button type="button" className="btn btn-primary">Edit</button></Link>}</div>
                <div className="card-body">
                    {this.props.app.description}
                    { this.props.app.public === true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.app.public === false && <FontAwesomeIcon icon="lock"/>}

                    <form onSubmit={e => { e.preventDefault(); }}>
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
                        { this.props.app.image &&
                        <div className="form-group row">
                            <label htmlFor="name">Base image</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.image.join(',')}/>
                        </div>}
                        <div className="form-group row">
                            <label htmlFor="name">Public</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.public}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Previous version</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.prev}/>
                        </div>
                        {this.props.app.recipes && <div className="form-group row">
                            <label htmlFor="name">Recipes</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.recipes.join(",")}/>
                        </div>}
                        <div className="form-group row">
                            <label htmlFor="name">Created</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.ts}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Template</label>
                            <input className="form-control" name="name" readOnly value={this.props.app.template}/>
                        </div>
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
            apps: [],
            publicApps: []
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
                ctx.setState({apps: apps})
            }).catch(error => {
                ctx.setState({msg: error})
            })
        } else {
            AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
                ctx.setState({app: app})
            }).catch(error => {
                ctx.setState({msg: error})
            })
        }
        AppService.public_apps().then(apps => {
            ctx.setState({publicApps: apps})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
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
                    <div className="row"><div className="col-sm-6"><h4>Public applications</h4></div></div>
                    <div className="row">
                    {this.state.publicApps.map((app:any, index: number) => (
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