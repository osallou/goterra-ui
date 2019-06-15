import React from "react";

import { Redirect } from 'react-router-dom'



export type User = {
    uid:string
    password: string
    apikey: string
    email: String
    admin:  Boolean    
}



export class Auth {

    static user:User | null  = null;
    static authToken:string = "";

    static init() {

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
    fireRedirect: boolean
    errors: string
}


export class Login extends React.Component<LoginProps,LoginState> {
    constructor(props:LoginProps) {
        super(props);
        this.state = {
            errors: "",
            fireRedirect: false,
            onLogin: props.onLogin || null
  
        }
        this.oidcGoogle = this.oidcGoogle.bind(this)
        // this.handleSubmit = this.handleSubmit.bind(this);
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
                {this.state.fireRedirect && (<Redirect to={'/home'}/>)}
                <p>Login with google</p>
                <button onClick={this.oidcGoogle} className="btn btn-primary">Log with google</button>
            </div>)
    }
}