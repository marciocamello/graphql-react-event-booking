const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql');
const mongoose = require('mongoose');

const graphQLSchema = require('./graphql/schema/index');
const graphQLResolvers = require('./graphql/resolvers/index');

const app = express();

app.use(bodyParser.json());

app.use('/graphql', graphqlHttp({
    schema: graphQLSchema,
    rootValue: graphQLResolvers,
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