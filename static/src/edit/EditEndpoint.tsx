import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {EndpointService} from '../Endpoint'
import { string } from "prop-types";
// '/ns/:nsid/edit/endpoint/:endpointid'

interface MatchParams {
    nsid: string
    endpointid: string
}

interface EditEndpointState {
    namespace: string
    msg: string
    endpoint: EndPoint

    imageID: string
    imageName: string
}

interface Openstack {
	tenant_name:       string 
	tenant_id:        string 
	auth_url:           string 
	region:           string 
	domain_id:          string 
	project_domain_id:   string 
	user_domain_id:      string 
    network: string
}

// EndPoint specifies a cloud endpoint data
interface EndPoint {
	id:string
	name:string
	kind:string
	namespace:string
	features:any
	inputs:any
	config:any
	images:any
}

const CloudTypes:string[] = ["openstack"]


export class EditEndpoint extends React.Component<RouteComponentProps<MatchParams>, EditEndpointState> {


    /*
    getOpenstackConfig():Map<string,string> {
        let openstackConfig:Map<string,string> = new Map<string,string>()
        openstackConfig.set("tenant_name", "")
        openstackConfig.set("tenant_id", "")
        openstackConfig.set("auth_url", "")
        openstackConfig.set("region", "")
        openstackConfig.set("domain_id", "")
        openstackConfig.set("project_domain_id", "")
        openstackConfig.set("user_domain_id", "")
        openstackConfig.set("network", "")
        return openstackConfig
    }*/

    getConfig(kind:string):any {
        if(kind === "openstack") {
            return this.getOpenstackConfig()
        }
        return this.getOpenstackConfig()
    } 

    getOpenstackConfig():any {
        return {
            tenant_name:       "", 
            tenant_id:        "",
            auth_url:           "" ,
            region:           "" ,
            domain_id:          "", 
            project_domain_id:   "", 
            user_domain_id:      "", 
            network: ""
        }
    }

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);

        let features = {
            disk_ephemeral: "0",
            ip_public: "0",
            disk_shared: "0"
        }

        let inputs = {
            user_name: "User identifier",
            password: "password"
        }

        this.state = {
            imageName: "",
            imageID: "",

            namespace: this.props.match.params.nsid,
            msg: "",
            endpoint: {
                id: "",
                name: "",
                kind: CloudTypes[0],
                namespace: this.props.match.params.nsid,
                features: features,
                inputs: inputs,
                config: this.getConfig(CloudTypes[0]),
                images: {}
            }
        }
        this.onChangeType = this.onChangeType.bind(this)
        this.onChangeEndpoint = this.onChangeEndpoint.bind(this)
        this.onChangeImage = this.onChangeImage.bind(this)
        this.onAddImage = this.onAddImage.bind(this)
        this.onFeatureChange = this.onFeatureChange.bind(this)
        this.onConfigChange = this.onConfigChange.bind(this)
        this.trashImage = this.trashImage.bind(this)
        this.saveEndpoint = this.saveEndpoint.bind(this)
    }

    componentDidMount() {
        let ctx = this
        // If endpointid, get it
        if (this.props.match.params.endpointid !== undefined && this.props.match.params.endpointid !== "") {
            EndpointService.get(this.props.match.params.nsid, this.props.match.params.endpointid).then(endpoint => {
                ctx.setState({endpoint: endpoint})
            }).catch(err => {
                ctx.setState({msg: err.message})
            })
        }
    }

    onChangeType(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            let endpoint = {...this.state.endpoint}
            endpoint.kind = event.currentTarget.value
            endpoint.config = this.getConfig(endpoint.kind)
            this.setState({endpoint: endpoint})
        }
    }

    onChangeImage(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            switch(event.currentTarget.name) {
                case "imageID": {
                    this.setState({imageID: event.currentTarget.value})
                    break
                }
                case "imageName": {
                    this.setState({imageName: event.currentTarget.value})
                    break
                }
            }
        }
    }

    onAddImage() {
        let endpoint = {...this.state.endpoint}
        endpoint.images[this.state.imageName] = this.state.imageID
        this.setState({endpoint: endpoint})
    }


    onChangeEndpoint(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            let endpoint = {...this.state.endpoint}
            switch(event.currentTarget.name) {
                case "name": {
                    endpoint.name = event.currentTarget.value
                    break

                }
            }
            this.setState({endpoint: endpoint})
        }
    }

    onConfigChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            let endpoint = {...this.state.endpoint}
            endpoint.config[event.currentTarget.name] = event.currentTarget.value
            this.setState({endpoint: endpoint})
        }
    }

    onFeatureChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            let endpoint = {...this.state.endpoint}
            endpoint.features[event.currentTarget.name] = event.currentTarget.value
            this.setState({endpoint: endpoint})
        }
    }

    trashImage(image:string) {
        let ctx = this
        return function() {
            let endpoint = {...ctx.state.endpoint}
            delete endpoint.images[image]
            ctx.setState({endpoint: endpoint})
        }
    }

    saveEndpoint() {
        let ctx = this
        if(this.state.endpoint.id == "") {
            let saveEndpoint = { ...this.state.endpoint}
            delete saveEndpoint.id
            EndpointService.create(this.state.namespace, saveEndpoint).then(endpoint => {
                ctx.setState({msg: "Endpoint created"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(err => {
                ctx.setState({msg: err.message})
            })
        }
        else {
            EndpointService.update(this.state.namespace, this.state.endpoint).then(endpoint => {
                ctx.setState({msg: "Endpoint updated"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(err => {
                ctx.setState({msg: err.message})
            })
        }
    }

    render() {

        return (
            <div className="card">
                <div className="card-body">
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    <form className="form">
                        <div className="form-group row">
                        <label htmlFor="type">Type</label>
                        <select className="form-control" name="type" value={this.state.endpoint.kind} onChange={this.onChangeType}>
                            {CloudTypes.map((ctype, _) => (
                                <option value={ctype} key={ctype}>{ctype}</option>
                            ))}
                        </select>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">ID</label>
                            <input className="form-control" name="id" readOnly value={this.state.endpoint.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Namespace</label>
                            <input className="form-control" name="namespace" readOnly value={this.state.endpoint.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.endpoint.name} onChange={this.onChangeEndpoint}/>
                        </div>
                        <h4>Configuration</h4>
                        { this.state.endpoint.kind === "openstack" && 
                            <div>
                            {  Object.keys(this.state.endpoint.config).map((key:string) => (
                                <div className="form-group row" key={key}>
                                    <label htmlFor={key}>{key}</label>
                                    <input className="form-control" name={key} value={this.state.endpoint.config[key]} onChange={this.onConfigChange}/>
                                </div>                            
                            ))}
                            </div>
                        }
                        <h4>Images</h4>
                        <div className="form-group row">
                            <label htmlFor="imageName">Name</label>
                            <input className="form-control" name="imageName" value={this.state.imageName} onChange={this.onChangeImage}/>
                            <label htmlFor="imageID">ID</label>
                            <input className="form-control" name="imageID" value={this.state.imageID} onChange={this.onChangeImage}/>
                            <button type="button" className="btn btn-primary" onClick={this.onAddImage}>Add</button>
                        </div>
                        {  Object.keys(this.state.endpoint.images).map((key:string) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor={key}>{key}  <span onClick={this.trashImage(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <input className="form-control" name={key} readOnly value={this.state.endpoint.images[key]}/>
                            </div>
                        ))}
                        <h4>Features</h4>
                        {Object.keys(this.state.endpoint.features).map((key:string) => (
                                <div className="form-group row" key={key}>
                                <label htmlFor={key}>{key}</label>
                                <input className="form-control" type="number" max="1" min="0" name={key} value={this.state.endpoint.features[key]} onChange={this.onFeatureChange}/>
                            </div>  
                        ))}    
                        <div className="form-group row">
                            <button type="button" className="btn btn-primary" onClick={this.saveEndpoint}>SAVE</button>
                        </div>
                        {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    </form>
                </div>
                
            </div>
        )
    }

}