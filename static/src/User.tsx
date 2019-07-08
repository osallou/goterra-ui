
import React from "react";
import { RouteComponentProps } from 'react-router-dom'

import axios from "axios"

// import {Auth} from './Auth/Auth'

//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
//import {AppService} from './Apps'

//import{timeConverter} from './Tools'

interface MatchParams {
    userid: string
}

interface UserState {
    msg: string
    user: any

}

class UserService {
    static me(): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/auth/me")
            .then(function (response) {
                // handle success
                resolve(response.data)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static get(user:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.get(root + "/auth/user/" + user.uid)
            .then(function (response) {
                // handle success
                resolve(response.data.user)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static update(user:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.put(root + "/auth/user/" + user.uid, user)
            .then(function (response) {
                resolve(response.data.user)
            })
            .catch(function (error) {
                console.log(error);
                reject(error)
            })
        })
    }
}

export class UserSpace extends React.Component<RouteComponentProps<MatchParams>, UserState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            user: {
                uid: "",
                apikey: "",
                email: "",
                kind: "",
                pub_key: "",
                admin: false,
                super: false
            },

        }

        this.onChange = this.onChange.bind(this)
        this.onUpdate = this.onUpdate.bind(this)

    }

    componentDidMount() {
        let ctx = this
        UserService.me().then(user => {
            ctx.setState({user: user})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })

    }

    onUpdate() {
        let ctx = this
        UserService.update(this.state.user).then(user => {
            ctx.setState({msg: "User updated"})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }

    onChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            let user = {...this.state.user}
            user[event.currentTarget.name] = event.currentTarget.value
            /*
            switch(event.currentTarget.name) {
                case "inputName": {
                    this.setState({inputName: event.currentTarget.value})
                    break
                }
                case "inputLabel": {
                    this.setState({inputLabel: event.currentTarget.value})
                    break
                }
            }*/
            this.setState({user: user})
        }
    }

    render() {
        return (
            <div className="row">
                <form className="col-sm-12" onSubmit={e => { e.preventDefault(); }}>
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                <div className="form-group row">
                    <label htmlFor="uid" >ID</label>
                    <input className="form-control" name="uid" readOnly value={this.state.user.uid}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="apikey">API Key</label>
                    <input className="form-control" name="apikey" onChange={this.onChange} value={this.state.user.apikey}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="email">Email</label>
                    <input className="form-control" name="email" onChange={this.onChange} value={this.state.user.email}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="admin">Admin?</label>
                    <input className="form-control" name="admin" readOnly value={this.state.user.admin}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="super">Super user?</label>
                    <input className="form-control" name="super" readOnly value={this.state.user.super}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="pub_key">SSH public key</label>
                    <input className="form-control" name="pub_key" onChange={this.onChange} value={this.state.user.pub_key}/>
                </div>
                <div className="form-group row">
                    <button type="button" className="btn btn-primary" onClick={this.onUpdate}>Update</button>
                </div>
                {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
           
                </form>
            </div>
        )
    }
}