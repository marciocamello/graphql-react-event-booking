import React, { Component } from 'react';

import './Auth.css';
import AuthContext from '../context/auth-context';
import Spinner from '../components/Spinner/Spinner';

class AuthPage extends Component{

    state = {
        isLogin: true
    }

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.emailEl = React.createRef();
        this.passwordEl = React.createRef();
    }

    switchModeHandler = () => {
        this.setState(prevState => {
            return {isLogin: !prevState.isLogin}
        })
    }

    submitHandler = event => {

        event.preventDefault();

        this.setState({ isLoading: true});

        const email = this.emailEl.current.value;
        const password = this.passwordEl.current.value;

        if (email.trim().length === 0 || password.trim().length === 0) {
            return;
        }

        let requestBody = {
            query: `
                query {
                    login(email: "${email}", password: "${password}") {
                        userId
                        token
                        tokenExpiration
                    }
                }
            `
        }

        if (!this.state.isLogin) {

            requestBody = {
                query: `
                    mutation {
                        createUser(userInput: {email: "${email}", password: "${password}"}) {
                            _id
                            email
                        }
                    }
                `
            };
        }

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json'
            }
       })
       .then(res => {
            if (res.status !== 200 && res.status !== 201){
                throw new Error('Falied!');
            }
            return res.json();
       })
       .then(resData => {
            if (resData.data.login.token) {
                localStorage.setItem('token', resData.data.login.token);
                localStorage.setItem('userId', resData.data.login.userId);
                localStorage.setItem('tokenExpiration', resData.data.login.tokenExpiration);
                this.context.login(
                    resData.data.login.token,
                    resData.data.login.userId,
                    resData.data.login.tokenExpiration
                );
                this.setState({ isLoading: false});
            }
       })
       .catch(err => {
           console.log(err);
           this.setState({ isLoading: false});
       })
    };

    render () {
        const { isLoading } = this.state;
        return (
            <form className="auth-form" onSubmit={this.submitHandler}>
                {isLoading ? <Spinner /> : ''}
                <div className="form-control">
                    <label htmlor="email">E-mail</label>
                    <input type="email" id="email" ref={this.emailEl} disabled={isLoading}/>
                </div>
                <div className="form-control">
                    <label htmlor="password">Password</label>
                    <input type="password" id="password" ref={this.passwordEl} disabled={isLoading}/>
                </div>
                <div className="form-actions">
                    <button type="submit" disabled={isLoading}>Submit</button>
                    <button type="button" onClick={this.switchModeHandler} disabled={isLoading}>Switch to {this.state.isLogin ? 'Signup' : 'Login'}</button>
                </div>
            </form>
        );
    }
}

export default AuthPage;