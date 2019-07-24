
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
    password1: string
    password2: string

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

    static updatePassword(user:any, password:any): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            axios.put(root + "/auth/user/" + user.uid + "/password", {password: password})
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
            password1: "",
            password2: "",

        }

        this.onChange = this.onChange.bind(this)
        this.onUpdate = this.onUpdate.bind(this)
        this.onChangePasswordConfirm = this.onChangePasswordConfirm.bind(this)
        this.onChangePassword1 = this.onChangePassword1.bind(this)
        this.onChangePassword2 = this.onChangePassword2.bind(this)
    }

    onChangePasswordConfirm() {
        let ctx = this
        if(this.state.password1 !== this.state.password2) {
            this.setState({msg: "Passwords are not identical"})
            return
        }
        UserService.updatePassword(this.state.user, this.state.password1).then(_ => {
            ctx.setState({msg: "password updated"})
        }).catch(error => {
            ctx.setState({msg: error.response.data.message || error.message})
        })
    }

    onChangePassword1(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({password1: event.currentTarget.value})
        }
    }

    onChangePassword2(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({password2: event.currentTarget.value})
        }
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
            this.setState({user: user})
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-6">
                    <form onSubmit={e => { e.preventDefault(); }}>
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    <div className="form-group">
                        <label htmlFor="uid" >ID</label>
                        <input className="form-control" name="uid" readOnly value={this.state.user.uid}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="apikey">API Key</label>
                        <input className="form-control" name="apikey" onChange={this.onChange} value={this.state.user.apikey}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input className="form-control" name="email" onChange={this.onChange} value={this.state.user.email}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="admin">Admin?</label>
                        <input className="form-control" name="admin" readOnly value={this.state.user.admin}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="super">Super user?</label>
                        <input className="form-control" name="super" readOnly value={this.state.user.super}/>
                    </div>
                    <div className="form-group">
                        <label htmlFor="pub_key">SSH public key</label>
                        <input className="form-control" name="pub_key" onChange={this.onChange} value={this.state.user.pub_key}/>
                    </div>
                    <div className="form-group">
                        <button type="button" className="btn btn-primary" onClick={this.onUpdate}>Update</button>
                    </div>
                    {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                    </form>
                </div>
                <div className="col-sm-6">
                    {this.state.user.kind === "" &&
                    <div className="card">
                        <div className="card-header">Update password</div>
                        <div className="card-body">
                            <form onSubmit={e => { e.preventDefault(); }}>
                                <div className="form-group">
                                    <label htmlFor="password" >Password</label>
                                    <input type="password" autoComplete="new-password" className="form-control" name="password1" onChange={this.onChangePassword1} value={this.state.password1}/>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="password" >Confirm password</label>
                                    <input type="password" autoComplete="new-password" className="form-control" name="password2" onChange={this.onChangePassword2} value={this.state.password2}/>
                                </div>
                                <div className="form-group">
                                    <button type="button" className="btn btn-primary" onClick={this.onChangePasswordConfirm}>Update</button>
                                </div>
                            </form>
                        </div>
                    </div>
                    }
                </div>
            </div>
        )
    }
}