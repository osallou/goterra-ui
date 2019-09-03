import React from "react";
import { RouteComponentProps } from 'react-router-dom'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import {RecipeService} from './Recipe'
import {AppService} from './Apps'
import {EndpointService} from './Endpoint'
import { NameSpaceService } from "./Namespace";
import {RunService} from './Runs'
import {TemplateService} from './Template'

import {RunActionDialog} from './RunActionDialog'
import { runInContext } from "vm";

interface MatchParams {
    nsid: string
    appid: string
}

interface RunState {
    namespace: string
    msg: string
    appInputs: any
    app: any

    run: Run
    endpoints: ShortEndpoint[]
    public_endpoints: ShortEndpoint[]
    defaults: any

    inputName: string
    inputValue: string
    endpoint: string
    endpointName: string
    hasSecret: boolean
    confirmRun: boolean

}


// EndPoint specifies a cloud endpoint data
interface Run {
    name:string
    description:string
    appID:string
    inputs:any
    secretinputs:any
    endpoint:string
    namespace:string

}

interface ShortEndpoint {
    id:string
    name:string
    kind:string
    namespace:string
}



export class RunApp extends React.Component<RouteComponentProps<MatchParams>, RunState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            namespace: this.props.match.params.nsid,
            msg: "",
            app: null,
            appInputs: null,
            run: {
                name: "",
                description: "",
                appID: this.props.match.params.appid,
                inputs: {},
                secretinputs:{},
                endpoint: "",
                namespace: this.props.match.params.nsid,
            },
            endpoints: [],
            public_endpoints: [],
            defaults: {},
        
            inputName: "",
            inputValue: "",
            endpoint: "",
            endpointName: "",
            hasSecret: false,
            confirmRun: false      
        }

        this.onEndpointChange = this.onEndpointChange.bind(this)
        this.onRun = this.onRun.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onChangeInfo = this.onChangeInfo.bind(this)
        this.onSelectChange = this.onSelectChange.bind(this)
        this.askRunConfirm = this.askRunConfirm.bind(this)
        this.onRunConfirm = this.onRunConfirm.bind(this)
        this.onRunCancel = this.onRunCancel.bind(this)
    }

    askRunConfirm() {
        this.setState({confirmRun: true})
    }
    onRunCancel() {
        this.setState({confirmRun: false})
    }
    onRunConfirm(username:string, password:string) {
        let run = {...this.state.run}
        if(!this.state.hasSecret) {
            run.secretinputs["user_name"] = username
            run.secretinputs["password"] = password
        }
        this.setState({run: run, confirmRun: false})
        this.onRun()
    }

    onRun() {
        let ctx =this
        if (!this.state.hasSecret && (this.state.run.inputs["user_name"] === "" || this.state.run.inputs["password"] ==="")) {
            this.setState({msg: "user name or password is empty and no secret is defined for this endpoint"})
            return
        }
        let run = {...this.state.run}
        if(this.state.hasSecret) {
            delete run.inputs["user_name"]
            delete run.inputs["password"]
        }
        if (run.inputs["password"]) {
            run.secretinputs["password"] = run.inputs["password"]
            delete run.inputs["password"]
        }
        if (run.endpoint === "") {
            this.setState({msg: "no endpoint selected"})
            return            
        }
        RunService.run(this.props.match.params.nsid, this.props.match.params.appid, run).then(newrun => {
            ctx.props.history.push("/run")
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }

    onChange(input:string) {
        let ctx =this
        return function(event:React.FormEvent<HTMLInputElement>) {
            if (event.currentTarget.value != null && event.currentTarget.value !== "") {
                let run = {...ctx.state.run}
                run.inputs[input] = event.currentTarget.value
                ctx.setState({run: run})
            }
        }
    }

    onSelectChange(input:string) {
        let ctx =this
        return function(event:React.FormEvent<HTMLSelectElement>) {
            if (event.currentTarget.value != null && event.currentTarget.value !== "") {
                let run = {...ctx.state.run}
                run.inputs[input] = event.currentTarget.value
                ctx.setState({run: run})
            }
        }
    }

    onChangeInfo(event:React.FormEvent<HTMLInputElement>) {
        let ctx =this
        if (event.currentTarget.value != null && event.currentTarget.value !== "") {
            let run = {...ctx.state.run}
            switch(event.currentTarget.name) {
                case "name": {
                    run.name = event.currentTarget.value
                    break
                }
                case "description": {
                    run.description = event.currentTarget.value
                    break
                }
            }
            ctx.setState({run: run})
        }
    }      


    onEndpointChange(event:React.FormEvent<HTMLSelectElement>) {
        let ctx =this
        if (event.currentTarget.value != null && event.currentTarget.value !== "") {
            let run = {...this.state.run}
            run.endpoint = event.currentTarget.value
            let endpointNS = this.props.match.params.nsid

            let endpointName = ""
            let defaults = {...ctx.state.appInputs.defaults}

            for(let ep of this.state.endpoints) {
                if (ep.id === run.endpoint) {
                    endpointName = ep.name
                    endpointNS = ep.namespace
                    break
                } 
            }
            if(endpointName === "") {
                for(let ep of this.state.public_endpoints) {
                    if (ep.id === run.endpoint) {
                        endpointName = ep.name
                        endpointNS = ep.namespace
                        break
                    } 
                }               
            }
            if(endpointName === "") {
                this.setState({msg: "endpoint not found"})
                return
            }
            EndpointService.hasSecret(endpointNS, run.endpoint).then(res => {
                ctx.setState({hasSecret: true})
            }).catch(err => {
                ctx.setState({hasSecret: false})
            })

            if (ctx.state.appInputs.endpointdefaults !== undefined && ctx.state.appInputs.endpointdefaults !== null && ctx.state.appInputs.endpointdefaults[endpointName]) {
                Object.keys(ctx.state.appInputs.endpointdefaults[endpointName]).forEach((key, _ ) => {
                    defaults[key] = ctx.state.appInputs.endpointdefaults[endpointName][key]                })

            }

            delete defaults["user_id"]
            delete defaults["tenant_id"]
            delete defaults["tenant_name"]
            delete defaults["key_pair"]

            EndpointService.getDefaults(run.namespace, run.endpoint).then(endpointDefaults => {
                Object.keys(endpointDefaults).forEach((key, _) => {
                    defaults[key] = endpointDefaults[key]
                })
                this.setState({endpoint: run.endpoint, run: run, endpointName: endpointName, defaults: defaults})
                console.log("defaults", defaults)
            }).catch(error => {
                console.debug("failed to get endpoint defaults", error)
                this.setState({endpoint: run.endpoint, run: run, endpointName: endpointName, defaults: defaults})
                console.log("defaults", defaults)
            })

            
        }
    }

    componentDidMount() {
        let ctx = this


        AppService.getInputs(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
            let run = {...this.state.run}
            for(let input in app.recipes) {
                run.inputs[input] = ""
            }
            for(let input in app.template) {
                run.inputs[input] = ""
            }
            ctx.setState({appInputs: app, run: run})
        }).catch(error => {
            console.log(error)
            ctx.setState({msg: error.response.data.message || error.message})
        })

        AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
            ctx.setState({app: app})
            TemplateService.get(this.props.match.params.nsid, app.template).then(template => {
                let endpointList:ShortEndpoint[] = []
                AppService.public_endpoints().then(endpoints => {
                    for(let endpoint of endpoints) {
                        if (template.data[endpoint.kind] === undefined) {
                            console.log("no template available for this kind of endpoint", endpoint.kind)
                            continue
                        }
                        // Check images compatible
                        let gotMatch = false
                        for(let image of app.image) {
                            // is image available in endpoint
                            if (endpoint.images[image] !== undefined && endpoint.images[image] !== "") {
                                gotMatch = true
                                break
                            }
                        }
                        if (gotMatch) {
                            endpointList.push({id: endpoint.id, name: endpoint.name, kind: endpoint.kind, namespace: endpoint.namespace})
                        }
                    }
                    ctx.setState({public_endpoints: endpointList})
                }).catch(error => {
                    ctx.setState({msg: error.response.data.message || error.message})
                })

                NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
                    let endpointList:ShortEndpoint[] = []
                    
                    for(let endpoint of endpoints) {
                        if (template.data[endpoint.kind] === undefined) {
                            console.log("no template available for this kind of endpoint", endpoint.kind)
                            continue
                        }
                        // Check images compatible
                        let gotMatch = false
                        for(let image of app.image) {
                            // is image available in endpoint
                            if (endpoint.images[image] !== undefined && endpoint.images[image] !== "") {
                                gotMatch = true
                                break
                            }
                        }
                        if (gotMatch) {
                            endpointList.push({id: endpoint.id, name: endpoint.name, kind: endpoint.kind, namespace: endpoint.namespace})
                        }
                    }
                    ctx.setState({endpoints: endpointList})

                }).catch(error => {
                    ctx.setState({msg: error.response.data.message || error.message})
                })

            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })

        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }

    render() {
        return (
            <div className="card">
                <div className="card-header">New run [{this.state.app && <span>{this.state.app.name}</span>}]</div>
                <div className="card-body">
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                <form className="form"  onSubmit={e => { e.preventDefault(); }}>
                    <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.run.name} onChange={this.onChangeInfo}/>
                    </div>
                    <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <input className="form-control" name="description" value={this.state.run.description} onChange={this.onChangeInfo}/>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="endpoint">Endpoint</label>
                        <select className="form-control" name="endpoint" value={this.state.endpoint} onChange={this.onEndpointChange}>
                                <option value="">Select an endpoint</option>
                                <optgroup label="Private">
                                {this.state.endpoints.map((endpoint) => (
                                    <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>
                                ))}
                                </optgroup>
                                <optgroup label="Public">
                                {this.state.public_endpoints.map((endpoint) => (
                                    <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>
                                ))}  
                                </optgroup>

                        </select>
                    </div>
                    {this.state.appInputs && Object.keys(this.state.appInputs.template).length > 0 && <h4>Application inputs</h4>}
                    {this.state.appInputs && Object.keys(this.state.appInputs.template).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.template[input]}</label>
                            {this.state.defaults[input] === undefined &&  <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>}
                            {this.state.defaults[input] !== undefined && <select className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onSelectChange(input)}>
                                <option value="">Select a value</option>
                                {this.state.defaults[input].map((val:string) => (
                                    <option key={val}>{val}</option>
                                ))}
                            </select>}


                        </div>
                    ))}
                    { this.state.appInputs && Object.keys(this.state.appInputs.recipes).length > 0 && <h4>Recipes inputs</h4>}
                    {this.state.appInputs && Object.keys(this.state.appInputs.recipes).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.recipes[input]}</label>
                            {this.state.defaults[input] === undefined && <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>}
                            {this.state.defaults[input] !== undefined && <select className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onSelectChange(input)}>
                                <option value="">Select a value</option>
                                {this.state.defaults[input].map((val:string) => (
                                    <option key={val}>{val}</option>
                                ))}
                            </select>}
                        </div>
                    ))}
                    <h4>Endpoint inputs</h4>
                    {!this.state.hasSecret &&
                    <div>
                    No secrets defined for this endpoint, please set one before
                    </div>
                    }
                    {this.state.hasSecret && <div>
                        Using secret credentials stored for this endpoint
                    </div>
                    }

                    {this.state.appInputs && this.state.endpoint !== "" && this.state.appInputs.endpoints[this.state.endpointName] !== undefined && Object.keys(this.state.appInputs.endpoints[this.state.endpointName]).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.endpoints[this.state.endpointName][input]}</label>
                            {this.state.defaults[input] === undefined && <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>}
                            {this.state.defaults[input] !== undefined && <select className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onSelectChange(input)}>
                                <option value="">Select a value</option>
                                {this.state.defaults[input].map((val:string) => (
                                    <option key={val}>{val}</option>
                                ))}
                            </select>}


                        </div>
                    ))}
                    
                    <button type="button" className="btn btn-primary" onClick={this.askRunConfirm}>Run</button>
                </form>
                </div>
                <RunActionDialog hasSecret={this.state.hasSecret} show={this.state.confirmRun} data={this.state.run.inputs} msg="" title="Confirm run execution" onCancel={this.onRunCancel} onConfirm={this.onRunConfirm}/>

            </div>
        )
    }

}