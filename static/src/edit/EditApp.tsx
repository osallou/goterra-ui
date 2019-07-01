import React from "react";
import { RouteComponentProps } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {RecipeService} from '../Recipe'
import {TemplateService} from '../Template'

import {AppService} from '../Apps'
import {TerraformWizard} from '../TerraformWizard'

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
    recipesMap: any
    templates: any[]
    selectedTemplate: string
    selectedRecipe: string
    fireModal: boolean
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
    model: any[]
    template: string
    recipes: string[]
}

export class EditApp extends React.Component<RouteComponentProps<MatchParams>, EditAppState> {


    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);

        this.state = {
            fireModal: false,
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
                prev: "",
                model: [],
                template: "",
                recipes: []
            },
            inputName: "",
            inputLabel: "",
            template: CloudTypes[0],
            tags: "",
            baseImages: [],
            recipes: [],
            recipesMap: {},
            templates: [],
            selectedTemplate: "",
            selectedRecipe: "",

            namespace: this.props.match.params.nsid,
            msg: ""
        }

        this.onChangeInput = this.onChangeInput.bind(this)
        this.onAddInput = this.onAddInput.bind(this)
        this.onChangeApp = this.onChangeApp.bind(this)
        this.onChangePublic = this.onChangePublic.bind(this)
        this.trashInput = this.trashInput.bind(this)
        this.onAddTemplate = this.onAddTemplate.bind(this)
        this.onTemplateTypeChange = this.onTemplateTypeChange.bind(this)
        this.saveApp = this.saveApp.bind(this)
        this.fireModal = this.fireModal.bind(this)
        this.cancelModal = this.cancelModal.bind(this)
        this.onSelectedTemplateChange = this.onSelectedTemplateChange.bind(this)


        this.onChangeRecipe = this.onChangeRecipe.bind(this)
        this.onAddRecipe = this.onAddRecipe.bind(this)
        this.trashRecipe = this.trashRecipe.bind(this)

    }

    componentDidMount() {
        let ctx = this
        // If endpointid, get it
        if (this.props.match.params.appid !== undefined && this.props.match.params.appid !== "") {
            AppService.get(this.props.match.params.nsid, this.props.match.params.appid).then(app => {
                ctx.setState({app: app})
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }

        RecipeService.list(this.props.match.params.nsid).then(recipes => {
            let recipeList:any[] = []
            let recipesMap:any = {}
            
            for(let i=0;i<recipes.length; i++){
                let recipe = recipes[i]
                recipeList.push({name: recipe.name, id: recipe.id})
                recipesMap[recipe.id]  = recipe.name
            }
            ctx.setState({recipes: recipeList, recipesMap: recipesMap})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        TemplateService.list(this.props.match.params.nsid).then(templates => {
            let templateList:any[] = []
            
            for(let i=0;i<templates.length; i++){
                let template = templates[i]
                templateList.push({name: template.name, id: template.id})
            }
            ctx.setState({templates: templateList})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

    }


    onAddRecipe() {
        let app = {...this.state.app}
        if(this.state.app.recipes.indexOf(this.state.selectedRecipe)>=0) {
            return
        }
        app.recipes.push(this.state.selectedRecipe)
        this.setState({app: app})
    }

    trashRecipe(input:string) {
        let ctx = this
        return function() {
            let app = {...ctx.state.app}
            let index = app.recipes.indexOf(input)
            if (index >= 0) {
                app.recipes.splice(index, 1)
            }
            ctx.setState({app: app})
        }
    }

    onChangeRecipe(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            // assert non null as we test before
            this.setState({selectedRecipe: event.currentTarget.value!})
        }
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
            this.setState({template: event.currentTarget.value!})
        }
    }

    onSelectedTemplateChange(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            // assert non null as we test before
            let app = {...this.state.app}
            app.template = event.currentTarget.value
            this.setState({selectedTemplate: event.currentTarget.value, app: app})
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

    onChangeApp(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
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
            if (event.currentTarget.value === "true") {
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


    saveApp() {        
        let ctx = this

        if(this.state.app.template === "") {
            ctx.setState({msg: "no template selected"})
            return
        }

        if(this.state.app.id === "") {
            let saveApp = { ...this.state.app}
            delete saveApp.id
            AppService.create(this.state.namespace, saveApp).then(app => {
                ctx.setState({msg: "Application created"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }
        else {
            AppService.update(this.state.namespace, this.state.app).then(app => {
                ctx.setState({msg: "Application updated"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }    
    }

    render() {

        return (
            <div>
            <div className="card">
                <div className="card-body">
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    <form className="form" onSubmit={e => { e.preventDefault(); }}>
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
                            <input className="form-control" name="name" value={this.state.app.name} onChange={this.onChangeApp}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <textarea rows={4} className="form-control" name="description" value={this.state.app.description} onChange={this.onChangeApp}/>
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

                        <h4>Recipes</h4>

                        <div className="form-group row">
                            <select className="form-control" value={this.state.selectedRecipe} onChange={this.onChangeRecipe}>
                                <option value="">Select a recipe</option>
                                {this.state.recipes.map((recipe) => (
                                    <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                                ))}
                            </select>
                            <button type="button" className="btn btn-primary" onClick={this.onAddRecipe}>Add</button>
                        </div>
                        {this.state.app.recipes.map((recipe) => (
                            <div className="form-group row" key={recipe}>
                            <label htmlFor="name">{recipe}  <span onClick={this.trashRecipe(recipe)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                            <input className="form-control" name={recipe} readOnly value={this.state.recipesMap[recipe]}/>
                        </div>                            
                        ))}


                        <h4>Templates</h4>
                        
                        <div className="form-group row">
                            <select className="form-control" value={this.state.selectedTemplate} onChange={this.onSelectedTemplateChange}>
                                <option value="">Select a template</option>
                                {this.state.templates.map((template) => (
                                    <option key={template.id} value={template.id}>{template.name}</option>
                                ))}
                            </select>
                        </div>
 
                        <div className="form-group row">
                            <button type="button" className="btn btn-primary" onClick={this.saveApp}>SAVE</button>
                        </div>
                        {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    </form>
                </div>
                
            </div>
            </div>
        )
    }

}