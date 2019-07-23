import React from "react";
import { Redirect, RouteComponentProps } from 'react-router-dom'

import queryString from 'query-string'
import axios from 'axios'


import {Auth} from './Auth'

type AAIAuthState = {
    logged: boolean
    msg: string
}

interface AAIAuthProps extends RouteComponentProps<{}> {
    onLogin: Function
}

export class AAIAuth extends React.Component<AAIAuthProps, AAIAuthState> {
    constructor(props:AAIAuthProps) {
        super(props);
        this.state = {
            logged: false,
            msg: ""
        }

    }

    componentDidMount() {
        let values = queryString.parse(this.props.location.search)
        let state = values.state
        let code = values.code
        let session_state = values.session_state
        let prompt = values.prompt
        let ctx = this
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""

        axios.get(root + "/auth/oidc/aai/callback", {
            params: {
                state: state,
                code: code,
                session_state: session_state,
                prompt: prompt
            }
        })
        .then(function (response) {
            // handle success
            ctx.setState({msg: "cool"})
            let user = {
                uid: response.data.uid,
                apikey: response.data.apikey,
                email: "",
                admin: false
            }
            Auth.login(user, response.data.token)
            ctx.props.onLogin(user)
        })
        .catch(function (error) {
            // handle error
            console.log(error);
            ctx.setState({msg: error.response.data.message ||error.message})
        })
    }


    render() {
        return (
            <div>
            { this.state.logged && <Redirect to="/ns"/> }
            <div className="row">
                <div className="label label-info">Validating authentication...</div>
            </div>
            </div>
        )
    }
}