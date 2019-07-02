import React from "react";
import { RouteComponentProps } from 'react-router-dom'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {RecipeService} from '../Recipe'
import {NameSpaceService} from '../Namespace'


interface MatchParams {
    nsid: string
    recipeid: string
}

interface EditRecipeState {
    namespace: string
    msg: string
    recipe: Recipe

    tags: string
    inputName: string
    inputLabel: string
    baseImage: string
    baseImages: any[]
    recipes: any[]
}


// EndPoint specifies a cloud endpoint data
interface Recipe {
	id:string
    name:string
    description:string
    script:string
    public:boolean
    namespace:string
    base:string[]
    parent:string
    ts:number
    prev:string
    inputs:any
    tags:string[]
    version:string
}


export class EditRecipe extends React.Component<RouteComponentProps<MatchParams>, EditRecipeState> {


    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);

        this.state = {
            inputName: "",
            inputLabel: "",
            baseImage: "",
            tags: "",
            baseImages: [],
            recipes: [],

            namespace: this.props.match.params.nsid,
            msg: "",
            recipe: {
                id: "",
                name: "",
                description: "",
                script: "!#/bin/bash\n",
                public: false,
                namespace: this.props.match.params.nsid,
                base: [],
                parent: "",
                ts: 0,
                prev: "",
                inputs: {},
                tags: [],
                version: ""
            }
        }

        this.onChangeInput = this.onChangeInput.bind(this)
        this.onAddInput = this.onAddInput.bind(this)
        this.onChangeRecipe = this.onChangeRecipe.bind(this)
        this.onChangeTags = this.onChangeTags.bind(this)
        this.onChangePublic = this.onChangePublic.bind(this)
        this.trashInput = this.trashInput.bind(this)
        this.onChangeImage = this.onChangeImage.bind(this)
        this.addBaseImage  = this.addBaseImage.bind(this)
        this.onChangeParent = this.onChangeParent.bind(this)
        this.saveRecipe = this.saveRecipe.bind(this)
    }

    componentDidMount() {
        let ctx = this
        // If endpointid, get it
        if (this.props.match.params.recipeid !== undefined && this.props.match.params.recipeid !== "") {
            RecipeService.get(this.props.match.params.nsid, this.props.match.params.recipeid).then(recipe => {
                if(recipe.inputs === null || recipe.inputs === undefined) {
                    recipe.inputs = {}
                }
                console.log('recipe', recipe)
                ctx.setState({recipe: recipe, tags: recipe.tags.join(",")})
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }

        RecipeService.list(this.props.match.params.nsid).then(recipes => {
            let recipeList:any[] = []
            
            for(let i=0;i<recipes.length; i++){
                let recipe = recipes[i]
                recipeList.push({name: recipe.name, id: recipe.id})
            }
            ctx.setState({recipes: recipeList})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

        NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
            let baseImages:string[] = []
            
            for(let i=0;i<endpoints.length; i++){
                Object.keys(endpoints[i].images).forEach(function (image, _) {
                    baseImages.push(image)
                })
            }
            ctx.setState({baseImages: baseImages})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
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
        let recipe = {...this.state.recipe}
        recipe.inputs[this.state.inputName] = this.state.inputLabel
        this.setState({recipe: recipe})
    }

    onChangeTags(event:React.FormEvent<HTMLInputElement>) {
        let recipe = {...this.state.recipe}
        recipe.tags = event.currentTarget.value.split(",")
        this.setState({tags: event.currentTarget.value, recipe: recipe})
    }

    onChangeRecipe(event:React.FormEvent<HTMLInputElement|HTMLTextAreaElement>) {
        if (event.currentTarget.value != null) {
            let recipe = {...this.state.recipe}
            switch(event.currentTarget.name) {
            case "name": {
                recipe.name = event.currentTarget.value
                break
            }
            case "description": {
                recipe.description = event.currentTarget.value
                break
            }
            case "script": {
                recipe.script = event.currentTarget.value
                break
            }
            case "parent": {
                recipe.parent = event.currentTarget.value
                break
            }
        }

        this.setState({recipe: recipe})
        }
    }

    onChangePublic(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            let recipe = {...this.state.recipe}
            if (event.currentTarget.value === "true") {
                recipe.public = true
            } else {
                recipe.public = false
            }
            this.setState({recipe: recipe})
        }
    }

    onChangeImage(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            this.setState({baseImage: event.currentTarget.value})
        }
    }

    onChangeParent(event:React.FormEvent<HTMLSelectElement>) {
        if (event.currentTarget.value != null) {
            let recipe = {...this.state.recipe}
            recipe.parent = event.currentTarget.value
            this.setState({recipe: recipe})
        }
    }

    addBaseImage() {
        let recipe = {...this.state.recipe}
        recipe.base.push(this.state.baseImage)
        this.setState({recipe: recipe})
    }

    trashImage(key:string, index:number) {
        let ctx = this
        return function() {
        let recipe = {...ctx.state.recipe}
        recipe.base.splice(index, 1)
        ctx.setState({recipe: recipe})  
        }      
    }

    isPublic(): string {
        if(this.state.recipe.public) {
            return "true"
        }
        return "false"
    }

    trashInput(input:string) {
        let ctx = this
        return function() {
            let recipe = {...ctx.state.recipe}
            delete recipe.inputs[input]
            ctx.setState({recipe: recipe})
        }
    }

    saveRecipe() {
        let ctx = this
        if(this.state.recipe.parent === "" && this.state.recipe.base.length === 0) {
            ctx.setState({msg: "Error: both base images and recipe parent are empty"})
            return
        }
        if(this.state.recipe.parent !== "" && this.state.recipe.base.length > 0) {
            ctx.setState({msg: "Error: both base images and recipe parent are set"})
            return
        }
        if(this.state.recipe.id === "") {
            let saveRecipe = { ...this.state.recipe}
            delete saveRecipe.id
            RecipeService.create(this.state.namespace, saveRecipe).then(recipe => {
                ctx.setState({msg: "Recipe created"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }
        else {
            RecipeService.update(this.state.namespace, this.state.recipe).then(recipe => {
                ctx.setState({msg: "Recipe updated"})
                ctx.props.history.push(`/ns/${this.state.namespace}`)
            }).catch(error => {
                ctx.setState({msg: error.response.data.message || error.message})
            })
        }
    }

    render() {

        return (
            <div className="card">
                <div className="card-body">
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    <form className="form" onSubmit={e => { e.preventDefault(); }}>
                        <div className="form-group row">
                            <label htmlFor="id">ID</label>
                            <input className="form-control" name="id" readOnly value={this.state.recipe.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="namespace">Namespace</label>
                            <input className="form-control" name="namespace" readOnly value={this.state.recipe.namespace}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" value={this.state.recipe.name} onChange={this.onChangeRecipe}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="description">Description</label>
                            <textarea rows={4} className="form-control" name="description" value={this.state.recipe.description} onChange={this.onChangeRecipe}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Version</label>
                            <input className="form-control" name="name" readOnly value={this.state.recipe.version}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="public">Public?</label>
                            <select className="form-control" name="description" value={this.isPublic()} onChange={this.onChangePublic}>
                                <option value="true">True</option>
                                <option value="false">False</option>
                            </select>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="script">script</label>
                            <textarea rows={20} className="form-control" name="script" value={this.state.recipe.script} onChange={this.onChangeRecipe}/>
                        </div>
                        { this.state.recipe.prev && 
                            <div className="form-group row">
                                <label htmlFor="prev">Previous version</label>
                                <input readOnly className="form-control" name="prev" value={this.state.recipe.prev}/>
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
                        {  Object.keys(this.state.recipe.inputs).map((key:string) => (
                            <div className="form-group row" key={key}>
                                <label htmlFor="name">{key}  <span onClick={this.trashInput(key)}><FontAwesomeIcon icon="trash-alt"/></span></label>
                                <input className="form-control" name={key} readOnly value={this.state.recipe.inputs[key]}/>
                            </div>
                        ))}
                        <h4>Base images</h4>
                        <div className="form-group row">
                            <select className="form-control" value={this.state.baseImage} onChange={this.onChangeImage}>
                                {this.state.baseImages.map((image) => (
                                    <option value={image} key={image}>{image}</option>
                                ))}
                            </select>
                            <button type="button" className="btn btn-primary" onClick={this.addBaseImage}>Add</button>
                        </div>

                        {  this.state.recipe.base.map((key:string, index:number) => (
                            <div className="form-group row" key={key}>
                                <input className="form-control" name={key} readOnly value={key}/>
                                <span onClick={this.trashImage(key, index)}><FontAwesomeIcon icon="trash-alt"/></span>
                            </div>
                        ))}
                        <h4>Or use parent recipe</h4>
                        <div className="form-group row">
                            <select className="form-control" value={this.state.recipe.parent} onChange={this.onChangeParent}>
                            <option value="">None</option>
                            {this.state.recipes.map((recipe, _) => (
                                <option key={recipe.id} value={recipe}>{recipe.name}</option>

                            ))}
                            </select>
                        </div>
 
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