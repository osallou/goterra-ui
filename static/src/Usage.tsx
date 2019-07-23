import React from "react";
import { RouteComponentProps } from 'react-router-dom'

import axios from "axios"

import {Treemap} from 'react-vis';
import '../node_modules/react-vis/dist/style.css';

import {AppService} from './Apps'
import {NameSpaceService} from './Namespace'


interface MatchParams {
    nsid: string
}

interface UsageState {
    msg: string
    resources: any
}

export class UsageService {

    static getResources(): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            let url = "/acct/resources"
            axios.get(root + url)
            .then(function (response) {
                // handle success
                resolve(response.data.resources)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }

    static getNSResources(nsid: string): Promise<any> {
        let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
        return new Promise( (resolve, reject) => {
            let url = "/acct/resources/ns/" + nsid
            axios.get(root + url)
            .then(function (response) {
                // handle success
                resolve(response.data.resources)
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                reject(error)
            })
        })
    }
}


export class Usage extends React.Component<RouteComponentProps<MatchParams>, UsageState> {

    constructor(props:RouteComponentProps<MatchParams>) {
        super(props);
        this.state = {
            msg: "",
            resources: {},
        }

    }

    computeResources(resources:any, endpointNames:any) {
        let usedResource:any = {
            "title": "resources",
            "children": []
        }
        let endpoints:any = {}
        for(let i=0;i<resources.length;i++) {
            let run = resources[i]
            if (endpoints[run.Endpoint] === undefined) {
                endpoints[run.Endpoint] = []
            }
            let runResources:any = []
            for(let r=0;r<run.Resources.length;r++) {
                let res = run.Resources[r]
                runResources.push({title: res.Kind + "(" + res.Quantity + ")", size: 1})
            }
            endpoints[run.Endpoint].push({
                title: run.Run,
                children: runResources
            })
        }
        for(let endpoint in endpoints){
            let endpointName = endpoint
            if (endpointNames[endpoint] !== undefined) {
                endpointName = endpointNames[endpoint]
            }
            usedResource.children.push({"title": endpointName, "children": endpoints[endpoint]}) 
        };
        this.setState({resources: usedResource})
    }

    componentDidMount() {

        let ctx = this


        AppService.public_endpoints().then(pubendpoints => {
            let endpointNames:any = {}
            for(let pubendpoint in pubendpoints) {
                endpointNames[pubendpoints[pubendpoint].id] = pubendpoints[pubendpoint].name
            }
            if (this.props.match.params.nsid !== undefined) {
                NameSpaceService.endpoints(this.props.match.params.nsid).then(endpoints => {
                    for(let endpoint in endpoints) {
                        endpointNames[endpoints[endpoint].id] = endpoints[endpoint].name
                    }
                    UsageService.getNSResources(this.props.match.params.nsid).then(resources => {
                        ctx.computeResources(resources, endpointNames)
                    }).catch(error => {
                    console.log(error)
                    })
                })
            }
            else {
                UsageService.getResources().then(resources => {
                    ctx.computeResources(resources, endpointNames)
                }).catch(error => {
                    console.log(error)
                })
            }

        }).catch(error => {
            console.log(error)
        })
    }

    render() {
        return (
            <div >
                <Treemap
                    mode="partition"
                    width={"800"}
                    height={"600"}
                    colorType='literal'
                    data={this.state.resources}
                />
            </div>
        )
    }

}