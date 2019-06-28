import React from "react";

import './TerraformWizard.css'

interface TerraformWizardProps {
    show:boolean
    onGenerate:Function
    onClose: Function
    model: Model[]
}

interface TerraformWizardState {
    model: Model[]
    templates: any
    recipes: any[]

    msg: string
    newvm: string
}

interface Model {
    name: string
    count: number // O for user defined, else use value
    ephemeral_disk: string
    public_ip: string
    shared_storage: string
}

export class TerraformWizard extends React.Component<TerraformWizardProps, TerraformWizardState> {

    constructor(props:TerraformWizardProps) {
        super(props);
        this.state = {
            msg: "",
            model: [],
            recipes: [],
            templates: {},
            newvm: ""
        }

        this.onClose = this.onClose.bind(this)
        this.onGenerate = this.onGenerate.bind(this)

        this.onNewVmName = this.onNewVmName.bind(this)
        this.onNewVm = this.onNewVm.bind(this)
        this.onChangeFeature = this.onChangeFeature.bind(this)
        this.onChangeCount = this.onChangeCount.bind(this)
        this.onRemoveVm = this.onRemoveVm.bind(this)
    }

    componentDidMount() {
        this.setState({model: this.props.model})
    }

    onNewVmName(event:React.FormEvent<HTMLInputElement>) {
        if (event.currentTarget.value != null) {
            // assert non null as we test before
            this.setState({newvm: event.currentTarget.value!})
        }
    }


    onNewVm() {
        if (this.state.newvm === "") {
            this.setState({msg: "VM name is empty"})
            return
        }

        for(let model of this.state.model) {
            if (model.name === this.state.newvm) {
                this.setState({msg: "A VM with this name already exists"})
                return                
            }
        }
        let model = [...this.state.model]
        model.push({
            name: this.state.newvm,
            count: 0,
            ephemeral_disk: "0",
            public_ip: "0",
            shared_storage: "0"
        })
        this.setState({model: model, msg: "", newvm: ""})
    }

    onClose() {
        this.props.onClose()
    }

    onGenerate() {
        this.props.onGenerate(this.state.model)
    }

    onRemoveVm(key: string) {
        let ctx = this
        return function() {
                let model = [...ctx.state.model]
                let index = -1
                for(let i=0;i<model.length;i++) {
                   if(model[i].name === key) {
                       index = i
                       break
                   } 
                }
                if(index >= 0) {
                    model.splice(index, 1)
                    ctx.setState({model: model})
                }
        }
    }

    onChangeCount(key: string) {
        let ctx = this
        return function(event:React.FormEvent<HTMLInputElement>) {
            if (event.currentTarget.value != null) {
                let model = [...ctx.state.model]
                for(let m of model) {
                   if(m.name === key) {
                       m.count = parseInt(event.currentTarget.value)
                   } 
                }
                ctx.setState({model: model})
            }
        }
    }

    onChangeFeature(key:string) {
        let ctx = this
        return function(event:React.FormEvent<HTMLSelectElement>) {
            if (event.currentTarget.value != null) {
                let model = [...ctx.state.model]
                let value = event.currentTarget.value
                for(let m of model){
                    if (m.name === key) {
                        switch (event.currentTarget.name) {
                            case "public_ip": {
                                m.public_ip = value
                                break
                            }
                            case "shared_storage": {
                                m.shared_storage = value
                                break
                            }
                            case "ephemeral_disk": {
                                m.ephemeral_disk = value
                                break
                            }
                        }
                    }
                }
                ctx.setState({model: model})
            }
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
                    <div className="modal-header">
                    <h5 className="modal-title">Template wizard</h5>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={this.onClose}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                    </div>
                    <div className="modal-body">
                        {this.state.msg && <div className="alert alert-warning">{this.state.msg}</div>}
                        <form className="form form-inline" onSubmit={e => { e.preventDefault(); }}>
                            <input placeholder="name of vm" onChange={this.onNewVmName} className="form-control" name="newvm" value={this.state.newvm}/>
                            <button className="btn btn-primary" type="button" onClick={this.onNewVm}>Add new VM</button>
                        </form>
                        {this.state.model.map((model) => (
                             <div className="card" key={model.name}>
                                <div className="card-header">{model.name} <button type="button" className="btn btn-danger" onClick={this.onRemoveVm(model.name)}>Remove</button></div>
                                <div className="card-body"></div>
                                    <form className="form form-inline" onSubmit={e => { e.preventDefault(); }}>
                                        <div className="control-group">
                                            <label htmlFor="count">Number of instance (if 0, user will select it)</label>
                                            <input className="form-control" name="count" type="number" min="0" value={model.count} onChange={this.onChangeCount(model.name)}/>
                                        </div>
                                        <div className="control-group">
                                            <label htmlFor="public_ip">Public IP?</label>
                                            <select className="form-control" name="public_ip" value={model.public_ip} onChange={this.onChangeFeature(model.name)}>
                                                <option value="0">False</option>
                                                <option value="1">True</option>
                                            </select>
                                        </div>
                                        <div className="control-group">
                                            <label htmlFor="ephemeral_disk">Ephemeral storage?</label>
                                            <select className="form-control" name="ephemeral_disk" value={model.ephemeral_disk} onChange={this.onChangeFeature(model.name)}>
                                                <option value="0">False</option>
                                                <option value="1">True</option>
                                            </select>
                                        </div>
                                        <div className="control-group">
                                            <label htmlFor="shared_storage">Shared storage?</label>
                                            <select className="form-control" name="shared_storage" value={model.shared_storage} onChange={this.onChangeFeature(model.name)}>
                                                <option value="0">False</option>
                                                <option value="1">True</option>
                                            </select>
                                        </div>
                                    </form>
                             </div>
                        ))}
                    </div>
                    <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={this.onGenerate}>Generate</button>
                    <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={this.onClose}>Close</button>
                    </div>
                </div>
                </div>
            </div>
        )
    }
}