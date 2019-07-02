import React from "react";
import { RouteComponentProps } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {TemplateService} from '../Template'
import {TerraformWizard} from '../TerraformWizard'

const CloudTypes:string[] = ["openstack"]


interface MatchParams {
    nsid: string
    templateid: string
}

interface EditTemplateState {
    namespace: string
    msg: string
    template: Template

    tags: string
    inputName: string
    inputLabel: string
    fireModal: boolean
    templateKind: string
}


// EndPoint specifies a cloud endpoint data
interface Template {
	id:string
    name:string
    description:string
    public:boolean
    namespace: string
    inputs:any
    image:string
    ts:number
    prev:string
    model: any[]
    data: any
    tags: string[]
    version:string
}

export class EditTemplate extends React.Component<RouteComponentProps<MatchParams>, EditTemplateState> {


    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);

        this.state = {
            fireModal: false,
            template: {
                id: "",
                name: "",
                description: "",
                public: false,
                namespace: this.props.match.params.nsid,
                data: {},
                inputs: {},
                image: "",
                ts: 0,
                prev: "",
                model: [],
                tags: [],
                version: ""
            },
            inputName: "",
            inputLabel: "",
            tags: "",
            templateKind: CloudTypes[0],

            namespace: this.props.match.params.nsid,
            msg: ""
        }

        this.onChangeInput = this.onChangeInput.bind(this)
        this.onAddInput = this.onAddInput.bind(this)
        this.onChangeTemplateInfo = this.onChangeTemplateInfo.bind(this)
        this.onChangePublic = this.onChangePublic.bind(this)
        this.trashInput = this.trashInput.bind(this)
        this.onChangeTemplate = this.onChangeTemplate.bind(this)
        this.onAddTemplate = this.onAddTemplate.bind(this)
        this.onTrashTemplate = this.onTrashTemplate.bind(this)
        this.onTemplateTypeChange = this.onTemplateTypeChange.bind(this)
        this.fireModal = this.fireModal.bind(this)
        this.cancelModal = this.cancelModal.bind(this)
        this.generateTemplates = this.generateTemplates.bind(this)
        this.onChangeTags = this.onChangeTags.bind(this)

    }

    componentDidMount() {
        let ctx = this
        // If endpointid, get it
        if (this.props.match.params.templateid !== undefined && this.props.match.params.templateid !== "") {
            TemplateService.get(this.props.match.params.nsid, this.props.match.params.templateid).then(template => {
                ctx.setState({template: template, tags: template.tags.join(",")})
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }

    }

    onChangeTags(event:React.FormEvent<HTMLInputElement>) {
        let template = {...this.state.template}
        template.tags = event.currentTarget.value.split(",")
        this.setState({tags: event.currentTarget.value, template: template})
    }

    fireModal() {
        this.setState({fireModal: true})
    }
    cancelModal() {
        this.setState({fireModal: false})
    }
    
    onTemplateTypeChange(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            // assert non null as we test before
            this.setState({templateKind: event.currentTarget.value!})
        }
    }


    onChangeTemplateInfo(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
        if (event.currentTarget.value != null) {
            let template = {...this.state.template}
            switch(event.currentTarget.name) {
            case "name": {
                template.name = event.currentTarget.value
                break
            }
            case "description": {
                template.description = event.currentTarget.value
                break
            }
            case "version": {
                template.version = event.currentTarget.value
                break
            }
        }

        this.setState({template: template})
        }
    }

    onAddTemplate() {
        let template = {...this.state.template}
        template.data[this.state.templateKind] = ""
        console.log("set templates", template.data)
        this.setState({template: template})

    }
    onChangeInput(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            switch(event.currentTarget.name) {
                case "inputName": {
                    this.setState({inputName: event.currentTarget.value})
                    break
                }
                case "inputLabel": {
                    this.setState({inputLabel: event.currentTarget.value})
                    break
                }
            }
        }
    }

    onAddInput() {
        let template = {...this.state.template}
        template.inputs[this.state.inputName] = this.state.inputLabel
        this.setState({template: template})
    }

    onChangeTemplate(key:string) {
        let ctx = this
        return function(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
            if (event.currentTarget.value != null) {
                let template = {...ctx.state.template}
                template.data[key] = event.currentTarget.value
                ctx.setState({template: template})
            }
        }
    }

    onChangePublic(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            let template = {...this.state.template}
            if (event.currentTarget.value === "true") {
                template.public = true
            } else {
                template.public = false
            }
            this.setState({template: template})
        }
    }

    isPublic(): string {
        if(this.state.template.public) {
            return "true"
        }
        return "false"
    }

    trashInput(input:string) {
        let ctx = this
        return function() {
            let template = {...ctx.state.template}
            delete template.inputs[input]
            ctx.setState({template: template})
        }
    }

    onTrashTemplate(templateKind:string) {
        let ctx = this
        return function() {
            let template = {...ctx.state.template}
            delete template.data[templateKind]
            ctx.setState({template: template})
        }
    }

    generateTemplates(model: any[]) {
        let template = {...this.state.template}
        template.model = model
        this.setState({fireModal: false, template: template})
    }

    saveTemplate() {        
        let ctx = this

        if(this.state.template.id === "") {
            let saveTemplate = { ...this.state.template}
            delete saveTemplate.id
            TemplateService.create(this.state.namespace, saveTemplate).then(template => {
                ctx.setState({msg: "Template created"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }
        else {
            TemplateService.update(this.state.namespace, this.state.template).then(template => {
                ctx.setState({msg: "Template updated"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }    
    }

    render() {

        return (
            <div>
                {this.state.fireModal && 
                <TerraformWizard model={this.state.template.model} show={this.state.fireModal} onGenerate={this.generateTemplates} onClose={this.cancelModal}/>
                }
            <div className="card">
                <div className="card-body">
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    <form className="form" onSubmit={e => { e.preventDefault(); }}>
                        <div className="form-group row">
                            <label htmlFor="id">ID</label>
                            <input className="form-control" name="id" readOnly value={this.state.template.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="namespace">Namespace</label>
                            <input className="form-control" name="namespace" readOnly value={this.state.template.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.template.name} onChange={this.onChangeTemplateInfo}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <textarea rows={4} className="form-control" name="description" value={this.state.template.description} onChange={this.onChangeTemplateInfo}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Version</label>
                            <input className="form-control" name="name" value={this.state.template.version} onChange={this.onChangeTemplateInfo}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="public">Public?</label>
                            <select className="form-control" name="description" value={this.isPublic()} onChange={this.onChangePublic}>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>

                        { this.state.template.prev && 
                            <div className="form-group row">
                                <label htmlFor="prev">Previous version</label>
                                <input readOnly className="form-control" name="prev" value={this.state.template.prev}/>
                            </div>  
                        }

                        <div className="form-group row">
                            <label htmlFor="tags">Tags (comma separated)</label>
                            <input className="form-control" name="tags" value={this.state.tags} onChange={this.onChangeTags}/>
                        </div> 
        
                        <h4>Inputs</h4>
                        <div className="form-group row">
                            <label htmlFor="inputName">Variable name</label>
                            <input className="form-control" name="inputName" value={this.state.inputName} onChange={this.onChangeInput}/>
                            <label htmlFor="inputLabel">Label</label>
                            <input className="form-control" name="inputLabel" value={this.state.inputLabel} onChange={this.onChangeInput}/>
                            <button type="button" className="btn btn-primary" onClick={this.onAddInput}>Add</button>
                        </div>
                        {  Object.keys(this.state.template.inputs).map((key:string) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}  <span onClick={this.trashInput(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <input className="form-control" name={key} readOnly value={this.state.template.inputs[key]}/>
                            </div>
                        ))}
                        <h4>Templates</h4>
                        {this.state.template.model && this.state.template.model.length > 0 && <div className="alert alert-warning">
                            A model is already defined, templates will be generated from model
                        </div>}
                        <div className="form-group row">
                                <select className="form-control" name="newtpl" value={this.state.templateKind} onChange={this.onTemplateTypeChange}>
                                    { CloudTypes.map((cloud) => (
                                        <option key={cloud} value={cloud}>{cloud}</option>
                                    ))}
                                </select>
                                <button type="button" className="btn btn-primary" onClick={this.onAddTemplate}>Add</button>
                                <button type="button" className="btn btn-primary" onClick={this.fireModal}>Wizard</button>

                        </div>
                        { Object.keys(this.state.template.data).map((key) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor={"tpl" + key}>{key} <span onClick={this.onTrashTemplate(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <textarea rows={20} className="form-control" name={"tpl" + key} value={this.state.template.data[key]} onChange={this.onChangeTemplate(key)}/>
                            </div>
                        ))}
 
                        <div className="form-group row">
                            <button type="button" className="btn btn-primary" onClick={this.saveTemplate}>SAVE</button>
                        </div>
                        {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    </form>
                </div>
                
            </div>
            </div>
        )
    }

}