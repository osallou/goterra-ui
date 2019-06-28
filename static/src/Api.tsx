import React from "react";
import { Redirect, RouteComponentProps, Link } from 'react-router-dom'

import SwaggerUI from 'swagger-ui-react'
import "swagger-ui-react/swagger-ui.css"

interface MatchParams {
    id: string
}

export class Api extends React.Component<RouteComponentProps<MatchParams>> {

    render() {
        return (
            <SwaggerUI url={"https://raw.githubusercontent.com/osallou/" + this.props.match.params.id + "/master/openapi.yaml"} />
        )
    }

}