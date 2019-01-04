const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../../models/user');

module.exports = {
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
    },
    login: async ({ email, password }) => {
        
        try{

            const user = await User.findOne({email: email});

            if (!user) {

                throw new Error('User does not exist');
            }

            const isEqual = await bcrypt.compare(password, user.password);

            if (!isEqual) {

                throw new Error('Password is incorrect');
            }

            const token = jwt.sign({
                userId: user.id,
                email: user.email
            }, process.env.JWT_SECRET, {
                expiresIn: '1h'
            });

            return {
                userId: user.id,
                token: token,
                tokenExpiration: 1
            };
        }catch(err) {

            console.log('Error after login User.', err);
            throw err;
        };
    }
};