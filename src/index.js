require('dotenv').config();

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

const Contact = require('./models/contact');

const errorHandler = (error, req, res, next) => {
    console.error(error.message);

    console.log(JSON.stringify(error));

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'malformatted id' });
    }

    if (error.name === 'ValidationError') {
        return res.status(400).send({ error: error.message });
    }

    next(error);
};

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' });
};

morgan.token('body', (req, res) => JSON.stringify(req.body));

app.use(express.json());
app.use(cors());
app.use(express.static('build'));
app.use(
    morgan(
        ':method :url :status :res[content-length] - :response-time ms :body'
    )
);

app.get('/info', async (req, res, next) => {
    try {
        const contacts = await Contact.find({});
        res.send(
            `<p>Phonebook has info for ${
                contacts.length
            } contacts</p><p>${new Date()}</p>`
        );
    } catch (err) {
        next(err);
    }
});

app.get('/api/contacts', async (req, res, next) => {
    try {
        const contacts = await Contact.find({});
        res.status(200).send(contacts);
    } catch (err) {
        next(err);
    }
});

app.get('/api/contacts/:id', async (req, res, next) => {
    try {
        const contact = await Contact.findById(req.params.id);
        res.status(200).send(contact);
    } catch (err) {
        next(err);
    }
});

app.delete('/api/contacts/:id', async (req, res, next) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.status(200).end();
    } catch (err) {
        next(err);
    }
});

app.post('/api/contacts', async (req, res, next) => {
    try {
        const contact = new Contact({
            name: req.body.name,
            number: req.body.number,
        });

        const newContact = await contact.save();
        res.status(201).send(newContact);
    } catch (err) {
        next(err);
    }
});

app.put('/api/contacts/:id', async (req, res, next) => {
    try {
        const updatedContact = await Contact.updateOne(
            { _id: req.params.id },
            { number: req.body.number }
        );
        res.status(200).send(updatedContact);
    } catch (err) {
        next(err);
    }
});

app.use(errorHandler);
app.use(unknownEndpoint);

const port = process.env.PORT || 5000;

app.listen(port, (error) => {
    if (error) return console.error(error);
    console.log(`Server running on port ${port}`);
});
