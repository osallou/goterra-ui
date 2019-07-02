import React from "react";
import { RouteComponentProps } from 'react-router-dom'

// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

// import {RecipeService} from './Recipe'
import {AppService} from './Apps'
import {EndpointService} from './Endpoint'
import { NameSpaceService } from "./Namespace";
import {RunService} from './Runs'

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

    inputName: string
    inputValue: string
    endpoint: string
    endpointName: string
    hasSecret: boolean

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
        
            inputName: "",
            inputValue: "",
            endpoint: "",
            endpointName: "",
            hasSecret: false       
        }

        this.onEndpointChange = this.onEndpointChange.bind(this)
        this.onRun = this.onRun.bind(this)
        this.onChange = this.onChange.bind(this)
        this.onChangeInfo = this.onChangeInfo.bind(this)
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
            for(let ep of this.state.endpoints) {
                if (ep.id === run.endpoint) {
                    endpointName = ep.name
                    endpointNS = ep.namespace
                    break
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
            this.setState({endpoint: event.currentTarget.value, run: run, endpointName: endpointName})
        }
    }

    componentDidMount() {
        let ctx = this

        AppService.getInputs(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
            ctx.setState({appInputs: app})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
            ctx.setState({app: app})
            NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
                let endpointList:ShortEndpoint[] = []
                let availableTemplates:any[] = []
                let controlTemplates = false
                /* TODO get template and check
                if (app.model === undefined || app.model === null || app.model.length === 0) {
                    controlTemplates = true
                    let kinds = Object.keys(app.templates)
                    for(let kind of kinds) {
                        availableTemplates.push(kind)
                    }
                }*/
                for(let endpoint of endpoints) {
                    if(controlTemplates && availableTemplates.indexOf(endpoint.kind) < 0) {
                        console.log("no template available for this kind of endpoint", endpoint.kind)
                        continue
                    }
                    endpointList.push({id: endpoint.id, name: endpoint.name, kind: endpoint.kind, namespace: endpoint.namespace})
                }
                AppService.public_endpoints().then(endpoints => {
                    for(let endpoint of endpoints) {
                        if(controlTemplates && availableTemplates.indexOf(endpoint.kind) < 0) {
                            console.log("no template available for this kind of endpoint", endpoint.kind)
                            continue
                        }
                        endpointList.push({id: endpoint.id, name: endpoint.name + "[public]", kind: endpoint.kind, namespace: endpoint.namespace})
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
                <div className="card-header">New run</div>
                <div className="card-body">
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                <form className="form"  onSubmit={e => { e.preventDefault(); }}>
                    <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.run.name} onChange={this.onChangeInfo()}/>
                    </div>
                    <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <input className="form-control" name="description" value={this.state.run.description} onChange={this.onChangeInfo()}/>
                    </div>
                    <div className="form-group row">
                        <label htmlFor="endpoint">Endpoint</label>
                        <select className="form-control" name="endpoint" value={this.state.endpoint} onChange={this.onEndpointChange}>
                            <option value="">Select an endpoint</option>
                            {this.state.endpoints.map((endpoint) => (
                                <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>
                            ))}
                        </select>
                    </div>
                    {this.state.appInputs && Object.keys(this.state.appInputs.template).length > 0 && <h4>Application inputs</h4>}
                    {this.state.appInputs && Object.keys(this.state.appInputs.template).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.template[input]}</label>
                            <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>
                        </div>
                    ))}
                    { this.state.appInputs && Object.keys(this.state.appInputs.recipes).length > 0 && <h4>Recipes inputs</h4>}
                    {this.state.appInputs && Object.keys(this.state.appInputs.recipes).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.recipes[input]}</label>
                            <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>
                        </div>
                    ))}
                    <h4>Endpoint inputs</h4>
                    {!this.state.hasSecret &&
                    <div>
                    <div className="form-group row">
                            <label htmlFor="user_name">User identifier</label>
                            <input className="form-control" name="user_name" value={this.state.run.inputs["user_name"] || ""} onChange={this.onChange("user_name")}/>
                    </div>
                    <div className="form-group row">
                            <label htmlFor="password">Password</label>
                            <input type="password" className="form-control" name="password" value={this.state.run.inputs["password"] || ""} onChange={this.onChange("password")}/>
                    </div>
                    </div>
                    }
                    {this.state.hasSecret && <div>
                        Using secret credentials stored for this endpoint
                    </div>
                    }

                    {this.state.appInputs && this.state.endpoint !== "" && this.state.appInputs.endpoints[this.state.endpointName] !== undefined && Object.keys(this.state.appInputs.endpoints[this.state.endpointName]).map((input) => (
                        <div className="form-group row" key={input}>
                            <label htmlFor={input}>{this.state.appInputs.endpoints[this.state.endpointName][input]}</label>
                            <input className="form-control" name={input} value={this.state.run.inputs[input] || ""} onChange={this.onChange(input)}/>
                        </div>
                    ))}
                    
                    <button type="button" className="btn btn-primary" onClick={this.onRun}>Run</button>
                    
                </form>
                </div>
            </div>
        )
    }

}