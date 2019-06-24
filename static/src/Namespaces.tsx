import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import axios from "axios"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import {Auth} from './Auth/Auth'


interface NameSpace {
    name: string
    _id: string
    owners: string[]
    members: string[]
}

interface NameSpaceProps {
    ns: NameSpace
    key: string
}

class NameSpaceService {
    static list(): Promise<NameSpace[]> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, _) => {
            axios.get(root + "/deploy/ns", {
                headers: {
                    "Authorization": "Bearer " + Auth.authToken
                }
            })
            .then(function (response) {
                // handle success
                resolve(response.data.ns)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                resolve([])
            })
        })
        

    }
}

class NameSpaceCard extends React.Component<NameSpaceProps> {

    constructor(props:NameSpaceProps) {
        super(props);
    }

    render() {
        return (
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{this.props.ns.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">{this.props.ns["_id"]}</h6>
                    <p className="card-text">
                    <Link to={`/ns/${this.props.ns["_id"]}`}><FontAwesomeIcon icon="sign-out-alt"/></Link>
                    </p>
                </div>
            </div>
        )
    }
}

interface NamespaceState {
    namespaces: NameSpace[]
    msg: string
}

export class NameSpaces extends React.Component<RouteComponentProps<{}>, NamespaceState> {

    constructor(props:RouteComponentProps<{}>) {
        super(props);
        this.state = {
            namespaces: [],
            msg: ""
        }
    }

    componentDidMount() {
        let ctx = this
        if (Auth.user !==null) {
            NameSpaceService.list().then(ns => {
                ctx.setState({namespaces: ns})
            })
        }
    }

    render() {
        return (
            <div className="row">
                <div className="col-sm-12">
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item active" aria-current="page"><Link to={`/ns`}>namespaces</Link></li>
                </ol>
                </nav>
                </div>
            
                    {this.state.namespaces.map((namespace, index) => {
                        return (<div className="col-sm-3" key={namespace.name}><NameSpaceCard ns={namespace} key={namespace.name}/></div>)
                    }
                    )}
                    {Auth.user != null && <div className="col-sm-3"><button className="btn btn-primary">Create new</button></div>}
            </div>
        )
    }
}