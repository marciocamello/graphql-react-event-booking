import React, { Component } from 'react';
import AuthContext from '../context/auth-context';

import Modal from '../components/Modal/Modal';
import EventList from '../components/Events/EventList/EventList';
import Spinner from '../components/Spinner/Spinner';
import './Events.css';

class EventsPage extends Component{

    state = {
        creating: false,
        isLoading: false,
        events: [],
        selectedEvent: null
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
            this.setState(prevState => {
                const updatedEvents = [...prevState.events];
                updatedEvents.push({
                    _id: resData.data.createEvent._id,
                    title: resData.data.createEvent.title,
                    description: resData.data.createEvent.description,
                    date: resData.data.createEvent.date,
                    price: resData.data.createEvent.price,
                    creator: {
                        _id: this.context.userId
                    }
                });
                return {events: updatedEvents};
            });
       })
       .catch(err => {
           console.log(err);
       })
    }

    modalCancelHandler = () => {
        this.setState({creating: false, selectedEvent: null})
    };

    fetchEvents() {

        this.setState({ isLoading: true});

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
            this.setState({ events: events, isLoading: false });
       })
       .catch(err => {
           console.log(err);
           this.setState({ isLoading: false});
       })
    }

    showDetailHandler = eventId => {
        this.setState(prevState => {
            const selectedEvent =  prevState.events.find(e => e._id === eventId);
            return { selectedEvent: selectedEvent };
        })
    }

    bookEventHandler = () => {};

    render () {
        return (
            <React.Fragment>
                {this.state.creating && (
                    <Modal
                        title="Add Event"
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.modalConfirmHandler}
                        confirmText="Confirm"
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
                {this.state.selectedEvent && (
                    <Modal
                        title={this.state.selectedEvent.title}
                        canCancel
                        canConfirm
                        onCancel={this.modalCancelHandler}
                        onConfirm={this.bookEventHandler}
                        confirmText="Book"
                    >
                        <h1>{this.state.selectedEvent.title}</h1>
                        <h2>{parseFloat(this.state.selectedEvent.price)
                                .toLocaleString(navigator.language,{style:'currency',currency:'USD'})
                            } - {new Date(this.state.selectedEvent.date).toLocaleDateString(navigator.language)}</h2>
                        <p>{this.state.selectedEvent.description}</p>
                    </Modal>
                )}
                {this.state.isLoading
                    ? <Spinner />
                    : <EventList
                        events={this.state.events}
                        authUserId={this.context.userId}
                        onViewDetail={this.showDetailHandler}
                    />
                }
            </React.Fragment>
        );
    }
}

export default EventsPage;