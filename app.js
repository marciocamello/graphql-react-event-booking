const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema} = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = [];

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type User {
            _id: ID!,
            email: String!
            password: String
        }

        input EventInput { 
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }

        type RootQuery {
            events: [Event!]!
            users: [User!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
    rootValue: {
        events: () => {
            return Event.find()
                .then(events => {

                    return events.map(event => {

                        return { ...event._doc, _id: event._doc._id.toString() };
                    });
                })
                .catch(err => {

                    console.log('Error after list Events.', err);
                    throw err;
                });
        },
        users: () => {
            return User.find()
                .then(users => {

                    return users.map(user => {

                        return { ...user._doc, password: null, _id: user._doc._id.toString() };
                    });
                })
                .catch(err => {

                    console.log('Error after list Users.', err);
                    throw err;
                });
        },
        createEvent: args => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, 
                date: new Date(args.eventInput.date),
                creator: '5c2e2f9f0b2f1937f64399fe'
            });

            let createdEvent;

            return event.save()
                .then(result => {

                    createdEvent = { ...result._doc, _id: event._doc._id.toString() };
                    return User.findById('5c2e2f9f0b2f1937f64399fe');
                })
                .then(user => {

                    if (!user) {
                        
                        throw new Error('User not found.');
                    }

                    user.createdEvents.push(event);

                    return user.save();
                })
                .then(() => {

                    return createdEvent;
                })
                .catch(err => {

                    console.log('Error after save Event.', err);
                    throw err;
                });
        },
        createUser: args => {

            return User.findOne({
                email: args.userInput.email
            })
            .then(user => {

                if (user) {

                    throw new Error('User exists already.');
                }

                return bcrypt.hash(args.userInput.password, 12);
            })
            .then(hashedPassword => {

                const user = new User({
                    email: args.userInput.email,
                    password: hashedPassword
                });

                return user.save();;
            })
            .then(result => {

                return { ...result._doc, password: null, _id: result._id.toString() };
            })
            .catch(err => {

                console.log('Error after save User.', err);
                throw err;
            });
        }
    },
    graphiql: true
}));

mongoose
    .connect(
        `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@macbr1-vcas5.mongodb.net/${process.env.MONGO_DB}?retryWrites=true`
    )
    .then(() => {

        console.log('Server connected on port 3000');
        app.listen(3000);
    })
    .catch( err => {

        console.log('Mongo Connection Error', err);
    });