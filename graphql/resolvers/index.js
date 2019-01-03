const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');

const events = async eventIds => {

    try{

        const events = await Event.find({
            _id: {$in: eventIds}
        });
    
        events.map(event => {

            return {
                ...event._doc,
                _id: event.id,
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, event.creator)
            }
        });
        
        return events;
    }catch(err) {

        console.log('Error after get Events by IDs.', err);
        throw err;
    }
}

const user = async userId => {
    
    try{

        const user = await User.findById(userId);

        return {
            ...user._doc,
             _id: user.id,
             createdEvents: events.bind(this, user._doc.createdEvents)
        }
    }catch(err) {
        
        console.log('Error after get User by ID.', err);
        throw err;
    }
}

module.exports = {
    events: async () => {

        try{

            const events = await Event.find()

            return events.map(event => {

                return { 
                    ...event._doc, 
                    _id: event._doc._id.toString(),
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this, event._doc.creator)
                };
            });
        }catch(err) {

            console.log('Error after list Events.', err);
            throw err;
        }
    },
    users: async () => {

        try{
            
            const users = await User.find()

            return users.map(user => {

                return { 
                    ...user._doc, 
                    password: null, 
                    _id: user._doc._id.toString() 
                };
            });
        }catch(err) {

            console.log('Error after list Users.', err);
            throw err;
        }
    },
    createEvent: async args => {

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price, 
            date: new Date(args.eventInput.date),
            creator: '5c2e2f9f0b2f1937f64399fe'
        });

        let createdEvent;

        try{

            const result = await event.save()

            createdEvent = { 
                ...result._doc, 
                _id: event._doc._id.toString(),
                date: new Date(event._doc.date).toISOString(),
                creator: user.bind(this, result._doc.creator)
            };

            const creator = await User.findById('5c2e2f9f0b2f1937f64399fe');
            
            if (!creator) {
                
                throw new Error('User not found.');
            }

            creator.createdEvents.push(event);

            await creator.save();

            return createdEvent;
        }catch(err) {

            console.log('Error after save Event.', err);
            throw err;
        }
    },
    createUser: async args => {

        try{

            const existingUser = await User.findOne({
                email: args.userInput.email
            })

            if (existingUser) {

                throw new Error('User exists already.');
            }

            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

            const user = new User({
                email: args.userInput.email,
                password: hashedPassword
            });

            const result = await user.save();

            return { 
                ...result._doc, 
                password: null, 
                _id: result._id.toString() 
            };
        }catch(err) {

            console.log('Error after save User.', err);
            throw err;
        };
    }
};