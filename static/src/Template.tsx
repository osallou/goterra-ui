import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

// import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export class TemplateService {
    static get(nsid:string, template:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/template/" + template)
            .then(function (response) {
                // handle success
                resolve(response.data.template)
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

    static create(nsid:string, template:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.post(root + "/deploy/ns/" + nsid + "/template", template)
            .then(function (response) {
                // handle success
                resolve(response.data.template)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static update(nsid:string, template:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.put(root + "/deploy/ns/" + nsid + "/template/" + template.id, template)
            .then(function (response) {
                // handle success
                resolve(response.data.template)
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
    templateid: string
}

interface TemplateState {
    msg: string
    ns: any
    template: any | null
    templates: any[]
}

interface TemplateSmallCardProps {
    template: any
    ns: string
    onPress: Function
}

interface TemplateCardProps {
    template: any
    ns: string
}

class TemplateSmallCard extends React.Component<TemplateSmallCardProps> {

    /*
    constructor(props:TemplateSmallCardProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
               <div className="card-header" onClick={this.props.onPress(this.props.template)}>{this.props.template.name}</div>
                <div className="card-body">
                    {this.props.template.description}
                    { this.props.template.public === true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.template.public === false && <FontAwesomeIcon icon="lock"/>}
                </div>
                
            </div>
        )
    }
}

class TemplateCard extends React.Component<TemplateCardProps> {

    /*
    constructor(props:TemplateCardProps) {
        super(props);
    }*/

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.template.name}   <Link to={`/ns/${this.props.ns}/edit/template/${this.props.template.id}`}><button type="button" className="btn btn-primary">Edit</button></Link></div>
                <div className="card-body">
                    {this.props.template.description}
                    { this.props.template.public === true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.template.public === false && <FontAwesomeIcon icon="lock"/>}

                    <form onSubmit={e => { e.preventDefault(); }}>
                        <div className="form-group row">
                            <label htmlFor="name">Id</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.name}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Description</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.description}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Previous version</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.prev}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Public</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.public}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Tags</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.tags.join(",")}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Created</label>
                            <input className="form-control" name="name" readOnly value={this.props.template.ts}/>
                        </div>
                        <h5>Templates</h5>
                        {this.props.template.data && Object.keys(this.props.template.data).map((template, _) => (
                            <div className="form-group row" key={template}>
                                <label htmlFor={"tpl"+template}>{template}</label>
                                <textarea rows={20} className="form-control" name={"tpl" + template} readOnly value={this.props.template.data[template]}/>
                            </div>                            
                        ))}
                        <h5>Expected inputs</h5>
                        {this.props.template.inputs && Object.keys(this.props.template.inputs).map((key, _) => (
                        <div className="form-group row" key={key}>
                            <label htmlFor={"input"+key}>{key}</label>
                            <input className="form-control" name={"input"+key} readOnly value={this.props.template.inputs[key]}/>
                        </div>
                        ))}
                    </form>
                </div>
                
            </div>
        )
    }
}


export class TemplateSpace extends React.Component<RouteComponentProps<MatchParams>, TemplateState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: this.props.match.params.nsid,
            template: null,
            templates: []
        }

        this.selectTemplate = this.selectTemplate.bind(this)
    }

    selectTemplate(template: any) {
        let ctx =this
        return function() {
            ctx.setState({template: template})
        }
    }

    componentDidMount() {
        let ctx = this
        if (this.props.match.params.templateid === undefined){
            TemplateService.list(this.props.match.params.nsid).then(templates => {
                ctx.setState({templates: templates})
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        } else {
            TemplateService.get(this.props.match.params.nsid, this.props.match.params.templateid).then(template => {
                ctx.setState({template: template})
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
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
                    <li className="breadcrumb-item" aria-current="page">template</li>
                    {this.state.template && <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns}/template/${this.state.template["id"]}`}>{this.state.template["id"]}</Link></li>}
                </ol>
                </nav>
                </div>
                <div className="col-sm-6">
                    <div className="row">
                    {this.state.templates.map((template:any, index: number) => (
                        <div className="col-sm-6" key={template.id}><TemplateSmallCard onPress={this.selectTemplate} template={template} ns={this.state.ns}/></div>
                    ))}
                    </div>
                </div>
                <div className="col-sm-6">
                    { this.state.template && <TemplateCard template={this.state.template} ns={this.state.ns}/> }
                </div>
            </div>
        )
    }
}