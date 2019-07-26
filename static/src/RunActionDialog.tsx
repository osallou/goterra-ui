import React from "react";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



interface MatchParams {
    nsid: string
    appid: string
}

interface RunActionDialogProps {
    hasSecret: boolean
    data: any
    title: string
    msg: string
    onConfirm: Function
    onCancel: Function
    show: boolean
}

interface RunActionDialogState {
    username: string
    password: string
}


export class  RunActionDialog extends React.Component<RunActionDialogProps, RunActionDialogState> {


    constructor(props:RunActionDialogProps) {
        super(props);
        this.state = {
            username: "",
            password: ""
        }
        this.onUserNameChange = this.onUserNameChange.bind(this)
        this.onUserPasswordChange = this.onUserPasswordChange.bind(this)
        this.onConfirm = this.onConfirm.bind(this)
        this.onCancel = this.onCancel.bind(this)
    }

    onConfirm() {
        this.props.onConfirm(this.state.username, this.state.password)
    }

    onCancel() {
        this.props.onCancel()
    }

    onUserNameChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null && event.currentTarget.value !== "") {
            this.setState({username: event.currentTarget.value})
        }
    }

    onUserPasswordChange(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null && event.currentTarget.value !== "") {
            this.setState({password: event.currentTarget.value})
        }
    }

    render() {
        return (
            <div className={`modal ${this.props.show ? 'show' : ''}`} style={{
                display: `${this.props.show ? 'block' : 'none'}`,
                overflow: 'scroll',  height: "500px",
            }} role="dialog">
                <div className="modal-dialog modal-lg" role="document"  aria-hidden="true">
                <div className="modal-content">
                    <div className="modal-header">{this.props.title}</div>
                    <div className="modal-body">
                        <div className="row">
                        {this.props.msg && <div className="col-sm-12">{this.props.msg}</div>}
                        {this.props.data && <div>
                            {Object.keys(this.props.data).map((key) => (
                                <div className="col-sm-12" key={key}>{key}: {this.props.data[key]}</div>
                            ))}
                        </div>}
                        </div>
                        {!this.props.hasSecret && <div >
                            <form className="form form-inline" style={{marginTop: "10px"}} onSubmit={e => { e.preventDefault(); }}>
                            <div className="form-group mb-2">
                                <label htmlFor="username">User identifier for endpoint</label>
                                <input className="form-control" autoComplete="username" name="username"  value={this.state.username} onChange={this.onUserNameChange}/>
                            </div>
                            <div className="form-group mb-2">
                                <label htmlFor="password">Password</label>
                                <input className="form-control" name="password" autoComplete="current-password"  value={this.state.password} onChange={this.onUserPasswordChange}/>
                            </div>
                            </form>
                        </div>}
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={this.onConfirm}>Submit</button>
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.onCancel}>Cancel</button>
                    </div>
                </div>
                </div>
            </div>

        )
    }

}