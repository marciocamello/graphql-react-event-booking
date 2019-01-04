const Event = require('../../models/event');
const Booking = require('../../models/booking');
const {transformBooking, transformEvent } = require('./merge');

module.exports = {
    bookings: async (args, req) => {

        if (!req.isAuth) {

            throw new Error('Unauthenticaded');
        }

        try{

            const bookings = await Booking.find();

            return bookings.map(booking => {

                return transformBooking(booking);
            });

        } catch (err) {

            console.log('Error after list Bookings', err);
            throw err;
        }
    },
    bookEvent: async (args, req) => {

        if (!req.isAuth) {

            throw new Error('Unauthenticaded');
        }

        try{

            const fetchedEvent = await Event.findOne({
                _id: args.eventId
            });

            const booking = await Booking({
                user: req.userId,
                event: fetchedEvent
            });

            const result = await booking.save();

            return transformBooking(result);

        } catch (err) {

            console.log('Error after create Booking', err);
            throw err;
        }
    },
    cancelBooking: async (args, req) => {

        if (!req.isAuth) {

            throw new Error('Unauthenticaded');
        }

        try{

            const booking = await Booking.findById(args.bookingId)
                .populate('event');

            const event = transformEvent(booking.event);
            
            await Booking.deleteOne({
                _id: args.bookingId
            });

            return event;

        } catch (err) {

            console.log('Error after cancel Booking', err);
            throw err;
        }
    }
};
