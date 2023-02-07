const mongoose = require('mongoose');

mongoose.set('strictQuery', false);
mongoose
    .connect(process.env.DATABASE_URI)
    .then(() => console.log('Connected to database.'))
    .catch((error) => console.error(error));

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
    },

    number: {
        type: String,
        minlength: 8,
        validate: {
            validator: (value) => /\d{2,3}-\d{6}/.test(value),
            message: (props) => `${props.value} is not a valid phone number!`,
        },
    },
});

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    },
});

module.exports = mongoose.model('Contact', contactSchema);
