import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import Modal from '../components/Modal/Modal';
import './Events.css';

class EventsPage extends Component{

    state = {
        creating: false,
        loading: false,
        events: []
    };

    static contextType = AuthContext;

    constructor(props) {
        super(props);
        this.titleElRef = React.createRef();
        this.priceElRef = React.createRef();
        this.dateElRef = React.createRef();
        this.descriptionElRef = React.createRef();
    }

    componentDidMount() {
        this.fetchEvents();
    }


    startCreateEventHandler = () => {
        this.setState({creating: true})
    }

    modalConfirmHandler = () => {

        this.setState({creating: false});
        this.setState({loading: 'Loading...'});

        const title = this.titleElRef.current.value;
        const price = this.priceElRef.current.value;
        const date = this.dateElRef.current.value;
        const description = this.descriptionElRef.current.value;

        if (title.trim().length === 0 ||
            price <= 0 ||
            date.trim().length === 0 ||
            description.trim().length === 0
        ){
            return;
        }

        const requestBody = {
            query: `
                mutation {
                    createEvent(eventInput: {title: "${title}", price: ${parseFloat(price)}, date: "${date}", description: "${description}"}) {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

        const token = this.context.token

        fetch('http://localhost:8000/graphql', {
            method: 'POST',
            body: JSON.stringify(requestBody),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
       })
       .then(res => {
            if (res.status !== 200 && res.status !== 201){
                throw new Error('Falied!');
            }
            return res.json();
       })
       .then(resData => {
            this.fetchEvents();
       })
       .catch(err => {
           console.log(err);
           this.setState({loading: false});
       })
    }

    modalCancelHandler = () => {
        this.setState({creating: false})
    };

    fetchEvents() {

        this.setState({loading: 'Loading...'});

        const requestBody = {
            query: `
                query {
                    events {
                        _id
                        title
                        description
                        date
                        price
                        creator {
                            _id
                            email
                        }
                    }
                }
            `
        };

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
            const events = resData.data.events;
            this.setState({ events: events });
            this.setState({loading: false});
       })
       .catch(err => {
           console.log(err);
           this.setState({loading: false});
       })
    }

    render () {

        const { loading } = this.state;

        const eventList = this.state.events.map(event => {
            return <li key={event._id} className="events__list-item">{event.title}</li>;
        });

        return (
            <React.Fragment>
                {this.state.creating && (
                    <Modal
                        title="Add Event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                    >
                        <form>
                            <div className="form-control">
                                <label htmlFor="title">Title</label>
                                <input type="text" id="title" ref={this.titleElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="price">Price</label>
                                <input type="number" id="price"  ref={this.priceElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="date">Date</label>
                                <input type="date" id="date"  ref={this.dateElRef}/>
                            </div>
                            <div className="form-control">
                                <label htmlFor="description">Description</label>
                                <textarea type="text" id="description" rows="8" ref={this.descriptionElRef}></textarea>
                            </div>
                        </form>
                    </Modal>
                )}
                {this.context.token && (
                    <div className="events-control">
                    <p>Share your own Events!</p>
                        <button className="btn" onClick={this.startCreateEventHandler}>
                            CreateEvent
                        </button>
                    </div>
                )}
                {loading && (
                    <p className="loading">{loading}</p>
                )}
                <ul className="events__list">{eventList}</ul>
            </React.Fragment>
        );
    }
}

export default EventsPage;