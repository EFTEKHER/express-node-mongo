import express from 'express';
import mongoose from 'mongoose';
import path from 'path';

const app = express();
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true }));
const port = 3000;

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://binary2ai:efte2000@cluster0.iiyhufm.mongodb.net/', {
    dbName: 'mongodbexpressNode',
}).then(() => {
    console.log('Mongodb connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
    console.log('this is a GET request');
    res.render('index.ejs');
});

app.post('/formData', async (req, res) => {
    console.log('form submitted');
    console.log(req.body);
    const obj = {
        name: req.body.name,
        email: req.body.email,
    };
    console.log(obj);
    
    try {
        // Check if user with the same name or email already exists
        const existingUser = await User.findOne({ $or: [{ name: obj.name }, { email: obj.email }] });
        if (existingUser) {
            res.status(400).json({ success: false, message: 'Duplicate key error: username or email already exists.' });
        } else {
            await User.create(obj);
            res.json({ success: true });
        }
    } catch (error) {
        console.error('Error while creating user:', error);
        res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

app.get('/about', (req, res) => {
    console.log('this is a about request');
    res.send('this is a about request');
});

app.get('/books', (req, res) => {
    res.json({ success: 'true', books: [] });
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
