
import React from "react";
import { RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"

// import {Auth} from './Auth/Auth'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {AppService} from './Apps'

import{timeConverter} from './Tools'

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
}

export class UserSpace extends React.Component<RouteComponentProps<MatchParams>, UserState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            user: {},

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

    render() {
        return (
            <div className="row">
                <form className="col-sm-12" onSubmit={e => { e.preventDefault(); }}>
                <div className="form-group row">
                    <label htmlFor="name" >ID</label>
                    <input className="form-control" name="name" readOnly value={this.state.user.uid}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="name">API Key</label>
                    <input className="form-control" name="name" readOnly value={this.state.user.apikey}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="name">Email</label>
                    <input className="form-control" name="name" readOnly value={this.state.user.email}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="name">Admin?</label>
                    <input className="form-control" name="name" readOnly value={this.state.user.admin}/>
                </div>
                <div className="form-group row">
                    <label htmlFor="name">Super user?</label>
                    <input className="form-control" name="name" readOnly value={this.state.user.super}/>
                </div>
                </form>
            </div>
        )
    }
}