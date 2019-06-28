import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { string } from "prop-types";
// '/ns/:nsid/edit/endpoint/:endpointid'

import {RecipeService} from '../Recipe'
import {NameSpaceService} from '../Namespace'
import {AppService} from '../Apps'

const CloudTypes:string[] = ["openstack"]


interface MatchParams {
    nsid: string
    appid: string
}

interface EditAppState {
    namespace: string
    msg: string
    app: App

    tags: string
    inputName: string
    inputLabel: string
    template: string
    baseImages: any[]
    recipes: any[]
}


// EndPoint specifies a cloud endpoint data
interface App {
	id:string
    name:string
    description:string
    public:boolean
    namespace: string
    templates: any
    inputs:any
    image:string
    ts:number
    prev:string
}

export class EditApp extends React.Component<RouteComponentProps<MatchParams>, EditAppState> {


    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);

        this.state = {
            app: {
                id: "",
                name: "",
                description: "",
                public: false,
                namespace: this.props.match.params.nsid,
                templates: {},
                inputs: {},
                image: "",
                ts: 0,
                prev: ""
            },
            inputName: "",
            inputLabel: "",
            template: CloudTypes[0],
            tags: "",
            baseImages: [],
            recipes: [],

            namespace: this.props.match.params.nsid,
            msg: ""
        }

        this.onChangeInput = this.onChangeInput.bind(this)
        this.onAddInput = this.onAddInput.bind(this)
        this.onChangeRecipe = this.onChangeRecipe.bind(this)
        this.onChangePublic = this.onChangePublic.bind(this)
        this.trashInput = this.trashInput.bind(this)
        this.onChangeTemplate = this.onChangeTemplate.bind(this)
        this.onAddTemplate = this.onAddTemplate.bind(this)
        this.onTrashTemplate = this.onTrashTemplate.bind(this)
        this.onTemplateTypeChange = this.onTemplateTypeChange.bind(this)
        this.saveRecipe = this.saveRecipe.bind(this)
    }

    componentDidMount() {
        let ctx = this
        // If endpointid, get it
        if (this.props.match.params.appid !== undefined && this.props.match.params.appid !== "") {
            AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
                ctx.setState({app: app})
            }).catch(error => {
                ctx.setState({msg: error.message})
            })
        }

        RecipeService.list(this.props.match.params.nsid).then(recipes => {
            let recipeList:any[] = []
            
            for(let i=0;i<recipes.length; i++){
                let recipe = recipes[i]
                recipeList.push({name: recipe.name, id: recipe.id})
            }
            ctx.setState({recipes: recipeList})
        }).catch(err => {
            ctx.setState({msg: err.message})
        })

    }
    
    onTemplateTypeChange(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            // assert non null as we test before
            this.setState({template: event.currentTarget.nodeValue!})
        }
    }

    onAddTemplate() {
        let app = {...this.state.app}
        app.templates[this.state.template] = ""
        console.log("set templates", app.templates)
        this.setState({app: app})

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
        let app = {...this.state.app}
        app.inputs[this.state.inputName] = this.state.inputLabel
        this.setState({app: app})
    }

    onChangeTemplate(key:string) {
        let ctx = this
        return function(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
            if (event.currentTarget.value != null) {
                let app = {...ctx.state.app}
                app.templates[key] = event.currentTarget.value
                ctx.setState({app: app})
            }
        }
    }

    onChangeRecipe(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
        if (event.currentTarget.value != null) {
            let app = {...this.state.app}
            switch(event.currentTarget.name) {
            case "name": {
                app.name = event.currentTarget.value
                break
            }
            case "description": {
                app.description = event.currentTarget.value
                break
            }
        }

        this.setState({app: app})
        }
    }

    onChangePublic(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            let app = {...this.state.app}
            if (event.currentTarget.value == "true") {
                app.public = true
            } else {
                app.public = false
            }
            this.setState({app: app})
        }
    }

    isPublic(): string {
        if(this.state.app.public) {
            return "true"
        }
        return "false"
    }

    trashInput(input:string) {
        let ctx = this
        return function() {
            let app = {...ctx.state.app}
            delete app.inputs[input]
            ctx.setState({app: app})
        }
    }

    onTrashTemplate(template:string) {
        let ctx = this
        return function() {
            let app = {...ctx.state.app}
            delete app.templates[template]
            ctx.setState({app: app})
        }
    }

    saveRecipe() {        
        let ctx = this

        if(this.state.app.id == "") {
            let saveApp = { ...this.state.app}
            delete saveApp.id
            RecipeService.create(this.state.namespace, saveApp).then(app => {
                ctx.setState({msg: "Application created"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(err => {
                ctx.setState({msg: err.message})
            })
        }
        else {
            AppService.update(this.state.namespace, this.state.app).then(app => {
                ctx.setState({msg: "Application updated"})
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
                            <label htmlFor="id">ID</label>
                            <input className="form-control" name="id" readOnly value={this.state.app.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="namespace">Namespace</label>
                            <input className="form-control" name="namespace" readOnly value={this.state.app.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.app.name} onChange={this.onChangeRecipe}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <textarea rows={4} className="form-control" name="description" value={this.state.app.description} onChange={this.onChangeRecipe}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="image">Used image</label>
                            <input className="form-control" name="image" value={this.state.app.image} readOnly/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="public">Public?</label>
                            <select className="form-control" name="description" value={this.isPublic()} onChange={this.onChangePublic}>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>

                        { this.state.app.prev && 
                            <div className="form-group row">
                                <label htmlFor="prev">Previous version</label>
                                <input readOnly className="form-control" name="prev" value={this.state.app.prev}/>
                            </div>  
                        }
        
                        <h4>Inputs</h4>
                        <div className="form-group row">
                            <label htmlFor="inputName">Variable name</label>
                            <input className="form-control" name="inputName" value={this.state.inputName} onChange={this.onChangeInput}/>
                            <label htmlFor="inputLabel">Label</label>
                            <input className="form-control" name="inputLabel" value={this.state.inputLabel} onChange={this.onChangeInput}/>
                            <button type="button" className="btn btn-primary" onClick={this.onAddInput}>Add</button>
                        </div>
                        {  Object.keys(this.state.app.inputs).map((key:string) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}  <span onClick={this.trashInput(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <input className="form-control" name={key} readOnly value={this.state.app.inputs[key]}/>
                            </div>
                        ))}
                        <h4>Templates</h4>
                        <div className="form-group row">
                                <select className="form-control" name="newtpl" value={this.state.template} onChange={this.onTemplateTypeChange}>
                                    { CloudTypes.map((cloud) => (
                                        <option key={cloud} value={cloud}>{cloud}</option>
                                    ))}
                                </select>
                                <button type="button" className="btn btn-primary" onClick={this.onAddTemplate}>Add</button>
                        </div>
                        { Object.keys(this.state.app.templates).map((key) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor={"tpl" + key}>{key} <span onClick={this.onTrashTemplate(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <textarea rows={20} className="form-control" name={"tpl" + key} value={this.state.app.templates[key]} onChange={this.onChangeTemplate(key)}/>
                            </div>
                        ))}
 
                        <div className="form-group row">
                            <button type="button" className="btn btn-primary" onClick={this.saveRecipe}>SAVE</button>
                        </div>
                        {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    </form>
                </div>
                
            </div>
        )
    }

}