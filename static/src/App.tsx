import React from 'react';
import { Switch, Route, Redirect, Link } from 'react-router-dom'

import logo from './logo.svg';
import './App.css';

import {Auth, Login, Logout, User} from './Auth/Auth'
import {GoogleAuth} from './Auth/GoogleAuth'
import {NameSpaces} from './Namespaces'
import {NameSpace} from './Namespace'
import {EndpointSpace} from './Endpoint'
import {RecipeSpace} from './Recipe'
import {AppsSpace} from './Apps'
import {Runs} from './Runs'
import {EditEndpoint} from './edit/EditEndpoint'


import axios from 'axios'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faLock, faLockOpen, faSignOutAlt, faUser, faPlusSquare,faArrowCircleRight, faArrowCircleLeft, faToolbox, faCog, faCheck, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { render } from 'react-dom';
library.add(faEye, faLock, faLockOpen, faSignOutAlt, faUser, faPlusSquare, faArrowCircleRight, faArrowCircleLeft, faToolbox, faCog, faCheck, faTrashAlt)



axios.interceptors.request.use(
  config => {
      config.headers['Authorization'] = Auth.authToken !== "" ? 'Bearer ' + Auth.authToken : '';
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(function (config) {
  return config
}, function (error) {
  if (error.request !== undefined && error.request.status === 401) {
    Auth.logout()
    return window.location.href = '/login'
  }
  if(error.response === undefined) {error.response={data:{msg: 'error'}}}
  return Promise.reject(error)
})

type AppState = {
  isLogged:boolean,
  user:User | null,
  msg: string,
  fireRedirect: boolean
}
type AppProps = {}

class App extends React.Component<AppProps, AppState> {

  constructor(props:AppProps) {
    super(props);
    
    this.state = {
      isLogged: false,
      user: null,
      msg: '',
      fireRedirect: false
    }

    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.resetMessage = this.resetMessage.bind(this);

    Auth.init();
 
  }

  componentDidMount() {
    if(localStorage.getItem('gotauth-token') !== "") {
      Auth.authToken = localStorage.getItem('gotauth-token') ? localStorage.getItem('gotauth-token'): ""
      let ctx = this
      let root = process.env.REACT_APP_GOT_SERVER ? process.env.REACT_APP_GOT_SERVER : ""
      axios.get(root + "/auth/api")
      .then(function (response) {
          // handle success
          ctx.setState({fireRedirect: true})
          let user = Auth.login(response.data.user, response.data.token)
          ctx.onLogin(user)
      })
      .catch(function (error: any) {
          // handle error
          console.log(error);
      })
    }
  }

  resetMessage(){
    this.setState({msg: ''})
  }

  onMessage(msg:string) {
    this.setState({msg: msg})
  }

  onLogin(user:User) {
    this.setState({isLogged: true, user: Auth.user, fireRedirect: true})
  }

  onLogout() {
    this.setState({isLogged: false, user: null})
  }

  render() {
  return (
    <div className="App container">
      <header className="navbar navbar-inverse navbar-fixed-top navbar-expand-lg navbar-dark bg-dark">
        <Link className="navbar-brand" to="/">GoTerra</Link>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/ns">Namespaces</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/run">Runs</Link>
            </li>
          </ul>
          <ul className="navbar-nav my-2 my-lg-0">
            { !this.state.isLogged && <li className="nav-item"><Link className="nav-link" to="/login">login</Link></li>}
            { this.state.isLogged && this.state.user && <li className="nav-item"><Link className="nav-link" to={"/user/" + this.state.user.uid}><FontAwesomeIcon icon="user"/> {this.state.user.uid}</Link></li>}
            { this.state.isLogged && <li className="nav-item"><Link className="nav-link" to="/logout"><FontAwesomeIcon icon="sign-out-alt"/>logout</Link></li>}
          </ul>
          
        </div>
      </header>
      <div className="row">
           <div className="col-sm-12">
              { this.state.msg && <div className="alert alert-primary" role="alert">{this.state.msg}<button type="button" className="close" onClick={this.resetMessage}>&times;</button></div>}
           </div>
      </div>

      <Switch>
        <Route exact path='/ns' component={NameSpaces}/>
        <Route exact path='/ns/:nsid' component={NameSpace}/>
        <Route exact path='/ns/:nsid/endpoint/:endpointid' component={EndpointSpace}/>
        <Route exact path='/ns/:nsid/recipe' component={RecipeSpace}/>
        <Route exact path='/ns/:nsid/recipe/:recipeid' component={RecipeSpace}/>
        <Route exact path='/ns/:nsid/app' component={AppsSpace}/>
        <Route exact path='/ns/:nsid/app/:appid' component={AppsSpace}/>
        <Route exact path='/ns/:nsid/edit/endpoint/:endpointid' component={EditEndpoint}/>
        <Route exact path='/ns/:nsid/edit/endpoint' component={EditEndpoint}/>
        <Route exact path='/run' component={Runs}/>


        <Route exact path='/login'
          render={(props) => <Login {...props} onLogin={this.onLogin} onMessage={this.onMessage}/>}
        />
        <Route exact path='/logout'
        render={(props) => <Logout {...props} onLogout={this.onLogout} />}
        />
        <Route exact path='/app/auth/oidc/google/callback'
          render={(props) => <GoogleAuth {...props} onLogin={this.onLogin}/>}/>
      </Switch>
      {this.state.fireRedirect && (<Redirect to={'/'}/>)}
    </div>
  );}
}

export default App;
