import React, { ChangeEvent } from "react";

import { Redirect } from 'react-router-dom'
import axios from 'axios'



export interface User {
    uid:string
    password?: string
    apikey: string
    email: String
    admin:  Boolean    
}



export class Auth {

    static user:User | null  = null;
    static authToken:string | null = "";

    static init() {

    }

    static login(user:User, token:string){
        Auth.user = user
        Auth.authToken = token
        localStorage.setItem('gotauth-token', token)
        return Auth.user
    }

    static logout() {
        localStorage.removeItem('gotauth-token')
        Auth.authToken = ""
        Auth.user = null
    }
}

type LogoutProps = {
    onLogout: Function
}
type LogoutState = {
    onLogout: Function
}
export class Logout extends React.Component<LogoutProps, LogoutState> {
    constructor(props:LogoutProps) {
        super(props);
        this.state = {
            'onLogout': props.onLogout || null
        }
        Auth.logout();
        this.state.onLogout();
    }
    render() {
        return (
            <Redirect to="/auth/login"/>
        )
    }
}

type LoginProps = {
    onLogin: Function
    onMessage: Function
}
type LoginState = {
    onLogin: Function
    errors: string
    apiKey: string
    msg: string
}


export class Login extends React.Component<LoginProps,LoginState> {
    constructor(props:LoginProps) {
        super(props);
        this.state = {
            errors: "",
            onLogin: props.onLogin || null,
            apiKey: "",
            msg: ""
  
        }
        this.oidcGoogle = this.oidcGoogle.bind(this)
        this.onApiKeyChange = this.onApiKeyChange.bind(this)
        this.onLogin = this.onLogin.bind(this)
        // this.handleSubmit = this.handleSubmit.bind(this);
    }

    onApiKeyChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({apiKey: event.currentTarget.value})
        }
    }

    onLogin() {
        // Should send api key to bind session and get a token
        let ctx = this
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        axios.get(root + "/auth/api", {
            headers: {
                "X-API-Key": ctx.state.apiKey
            }
        })
        .then(function (response) {
            // handle success
            ctx.setState({msg: "cool"})
            let user = Auth.login(response.data.user, response.data.token)
            ctx.props.onLogin(user)
        })
        .catch(function (error: any) {
            // handle error
            ctx.setState({errors: error.message})
            console.log(error);
        })
    }

    oidcGoogle() {
        //{process.env.REACT_APP_GOT_BASENAME} redirect
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        window.location.href = root + "/auth/oidc/google"
    }

    render() {
        return (
            <div>
                {this.state.errors && <div className="alert alert-warning" role="alert">{this.state.errors}</div>}
                <p>Login with google</p>
                <input name="apikey" value={this.state.apiKey} onChange={this.onApiKeyChange} placeholder="api key"></input>
                <button onClick={this.onLogin} className="btn btn-primary">Log in</button>

                <button onClick={this.oidcGoogle} className="btn btn-primary">Log with google</button>
            </div>)
    }
}