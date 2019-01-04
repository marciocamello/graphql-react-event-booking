const Event = require('../../models/event');

const { transformEvent } = require('./merge');

module.exports = {
    events: async () => {

        try{

            const events = await Event.find()

            return events.map(event => {

                return transformEvent(event);
            });
        }catch(err) {

            console.log('Error after list Events.', err);
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

            createdEvent = transformEvent(result);

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
    }
};
