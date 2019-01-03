const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const { buildSchema} = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');

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

        input EventInput { 
            title: String!
            description: String!
            price: Float!
            date: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
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
                    console.log('Error after list Events', err);
                    throw err;
                });
        },
        createEvent: (args) => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price, 
                date: new Date(args.eventInput.date)
            });

            return event.save()
                .then(result => {
                    return { ...result._doc, _id: event._doc._id.toString() };
                })
                .catch(err => {
                    console.log('Error after save Event', err);
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