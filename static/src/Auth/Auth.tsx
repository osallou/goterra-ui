import React from "react";

import { Redirect } from 'react-router-dom'
import axios from 'axios'

import {NameSpaceService} from '../Namespaces'

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
    googleOIDC: boolean
    AAIOIDC: boolean
    userid: string
    userpwd: string
}


export class Login extends React.Component<LoginProps,LoginState> {
    constructor(props:LoginProps) {
        super(props);
        this.state = {
            errors: "",
            onLogin: props.onLogin || null,
            apiKey: "",
            userid: "",
            userpwd: "",
            msg: "",
            googleOIDC: false,
            AAIOIDC: false
  
        }
        this.oidcGoogle = this.oidcGoogle.bind(this)
        this.oidcAAI = this.oidcAAI.bind(this)

        this.onApiKeyChange = this.onApiKeyChange.bind(this)
        this.onLogin = this.onLogin.bind(this)
        this.onPasswordChange = this.onPasswordChange.bind(this)
        this.onLoginChange = this.onLoginChange.bind(this)

    }

    componentDidMount() {
        let ctx = this
        NameSpaceService.config().then(config => {
            let aai = false
            let google = false
            if(config.oidc_aai) {
                aai = true
            }
            if(config.oidc_google) {
                google = true
            }
            ctx.setState({googleOIDC: google, AAIOIDC: aai})
            
        })
    }

    onApiKeyChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({apiKey: event.currentTarget.value})
        }
    }

    onLoginChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({userid: event.currentTarget.value})
        }
    }

    onPasswordChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            this.setState({userpwd: event.currentTarget.value})
        }
    }

    onLogin() {
        // Should send api key to bind session and get a token
        let ctx = this
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        axios.post(root + "/auth/login", {
            uid: this.state.userid,
            password: this.state.userpwd
        })
        .then(function (response) {
            // handle success
            ctx.setState({msg: ""})
            let user = Auth.login(response.data.user, response.data.token)
            ctx.props.onLogin(user)
        })
        .catch(function (error: any) {
            // handle error
            ctx.setState({errors: error.response.data.message || error.message})
            console.log(error);
        })
    }

    oidcGoogle() {
        //{process.env.REACT_APP_GOT_BASENAME} redirect
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        window.location.href = root + "/auth/oidc/google"
    }

    oidcAAI() {
        //{process.env.REACT_APP_GOT_BASENAME} redirect
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        window.location.href = root + "/auth/oidc/aai"
    }

    render() {
        return (
            <div>
                {this.state.errors && <div className="alert alert-warning" role="alert">{this.state.errors}</div>}
                <div style={{marginTop: "30px"}}>
                <p><b>Sign in to access Goterra</b></p>
                <input name="userid" value={this.state.userid} autoComplete="username" onChange={this.onLoginChange} placeholder="user identifier"></input>
                <input name="userpwd" type="password" autoComplete="current-password" value={this.state.userpwd} onChange={this.onPasswordChange} placeholder="password"></input>
                <button onClick={this.onLogin} className="btn btn-primary">Log in</button>
                </div>
                <div className="row btn-group" style={{margin: "10px"}}>
                { this.state.googleOIDC && <button  style={{margin: "10px"}} onClick={this.oidcGoogle} className="btn btn-primary">Log with google</button>}
                { this.state.AAIOIDC && <button  style={{margin: "10px"}} onClick={this.oidcAAI} className="btn btn-primary">Log with Elixir AAI</button>}
                </div>
            </div>)
    }
}