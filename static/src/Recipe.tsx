import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


class RecipeService {
    static get(nsid:string, recipe:string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/deploy/ns/" + nsid + "/recipe/" + recipe)
            .then(function (response) {
                // handle success
                resolve(response.data.recipe)
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
            axios.get(root + "/deploy/ns/" + nsid + "/recipe")
            .then(function (response) {
                // handle success
                resolve(response.data.recipes)
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
    recipeid: string
}

interface RecipeState {
    msg: string
    ns: any
    recipe: any | null
    recipes: any[]
}

interface RecipeSmallCardProps {
    recipe: any
    ns: string
    onPress: Function
}

interface RecipeCardProps {
    recipe: any
    ns: string
}

class RecipeSmallCard extends React.Component<RecipeSmallCardProps> {

    constructor(props:RecipeSmallCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header" onClick={this.props.onPress(this.props.recipe)}>{this.props.recipe.name}</div>
                <div className="card-body">
                    {this.props.recipe.description}
                    { this.props.recipe.public ==true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.recipe.public ==false && <FontAwesomeIcon icon="lock"/>}
                </div>
                
            </div>
        )
    }
}

class RecipeCard extends React.Component<RecipeCardProps> {

    constructor(props:RecipeCardProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
               <div className="card-header">{this.props.recipe.name}</div>
                <div className="card-body">
                    {this.props.recipe.description}
                    { this.props.recipe.public ==true && <FontAwesomeIcon icon="lock-open"/>}
                    { this.props.recipe.public ==false && <FontAwesomeIcon icon="lock"/>}

                    <form>
                        <div className="form-group row">
                            <label htmlFor="name">Id</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.id}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Name</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.name}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Description</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.description}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Base images</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.base.join(',')}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Parent recipe</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.parent}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Previous version</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.prev}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Public</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.public}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Tags</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.tags.join(",")}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Created</label>
                            <input className="form-control" name="name" readOnly value={this.props.recipe.ts}/>
                        </div>
                        <div className="form-group row">
                            <label htmlFor="name">Script</label>
                            <textarea rows={20} className="form-control" name="name" readOnly value={this.props.recipe.script}/>
                        </div>
                        <h5>Expected inputs</h5>
                        {this.props.recipe.inputs && Object.keys(this.props.recipe.inputs).map((key, _) => (
                        <div className="form-group row" key={key}>
                            <label htmlFor={"input"+key}>{key}</label>
                            <textarea rows={20} className="form-control" name={"input"+key} readOnly value={this.props.recipe.inputs[key]}/>
                        </div>
                        ))}
                    </form>
                </div>
                
            </div>
        )
    }
}


export class RecipeSpace extends React.Component<RouteComponentProps<MatchParams>, RecipeState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            ns: this.props.match.params.nsid,
            recipe: null,
            recipes: []
        }

        this.selectRecipe = this.selectRecipe.bind(this)
    }

    selectRecipe(recipe: any) {
        let ctx =this
        return function() {
            ctx.setState({recipe: recipe})
        }
    }

    componentDidMount() {
        let ctx = this
        if (this.props.match.params.recipeid === undefined){
            RecipeService.list(this.props.match.params.nsid).then(recipes => {
                this.setState({recipes: recipes})
            }).catch(error => {
                this.setState({msg: error})
            })
        } else {
            RecipeService.get(this.props.match.params.nsid, this.props.match.params.recipeid).then(recipe => {
                this.setState({recipe: recipe})
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
                    <li className="breadcrumb-item" aria-current="page">recipe</li>
                    {this.state.recipe && <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns/${this.state.ns}/recipe/${this.state.recipe["id"]}`}>{this.state.recipe["id"]}</Link></li>}

                </ol>
                </nav>
                </div>
                <div className="col-sm-6">
                    <div className="row">
                    {this.state.recipes.map((recipe:any, index: number) => (
                        <div className="col-sm-6" key={recipe.id}><RecipeSmallCard onPress={this.selectRecipe} recipe={recipe} ns={this.state.ns}/></div>
                    ))}
                    </div>
                </div>
                <div className="col-sm-6">
                    { this.state.recipe && <RecipeCard recipe={this.state.recipe} ns={this.state.ns}/> }
                </div>
            </div>
        )
    }
}