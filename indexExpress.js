import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();
app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from this origin
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
  }));
const port = 3000;

app.set('view engine', 'ejs');

mongoose.connect('mongodb+srv://binary2ai:efte2000@cluster0.iiyhufm.mongodb.net/', {
    dbName: 'mongodbexpressNode',
}).then(() => {
    console.log('Mongodb connected');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     }
// }, { timestamps: true });

// const User = mongoose.model('User', userSchema);

// app.get('/', (req, res) => {
//     console.log('this is a GET request');
//     res.render('index.ejs');
// });

// app.post('/formData', async (req, res) => {
//     console.log('form submitted');
//     console.log(req.body);
//     const obj = {
//         name: req.body.name,
//         email: req.body.email,
//     };
//     console.log(obj);
    
//     try {
//         // Check if user with the same name or email already exists
//         const existingUser = await User.findOne({ $or: [{ name: obj.name }, { email: obj.email }] });
//         if (existingUser) {
//             res.status(400).json({ success: false, message: 'Duplicate key error: username or email already exists.' });
//         } else {
//             await User.create(obj);
//             res.json({ success: true });
//         }
//     } catch (error) {
//         console.error('Error while creating user:', error);
//         res.status(500).json({ success: false, message: 'Internal server error.' });
//     }
// });

// app.get('/about', (req, res) => {
//     console.log('this is a about request');
//     res.send('this is a about request');
// });

// app.get('/books', (req, res) => {
//     res.json({ success: 'true', books: [] });
// });
const userSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true 
    },
    password:{
        type:String,
        required:true
    }
},{timestamps:true});

const User=mongoose.model('User',userSchema);
app.get('/',async(req,res)=>{
    const token = req.cookies.user;

    if (!token) {
        return res.render('login.ejs');
    }

    try {
        const decoded = jwt.verify(token, 'eftekher');
        const userId = decoded.id;
        const user = await User.findById(userId);

        if (user) {
            return res.render('logout.ejs',{name: user.name,email: user.email});
        } else {
            res.clearCookie('user');
            return res.render('login.ejs');
        }
    } catch (error) {
        console.error('Error verifying token:', error);
        res.clearCookie('user');
        return res.render('login.ejs');
    }
})

app.get('/register', (req, res)=>{
    res.render('register.ejs',{ message: null })
    
    })
    
    
    app.post('/register', async (req, res) => {
        const hashPassword= await bcrypt.hash(req.body.password,10)
        const obj = {
            name: req.body.name,
            email: req.body.email,
            password: hashPassword
        };
    
        try {
            const existingUser = await User.findOne({ $or: [{ name: obj.name }, { email: obj.email }] });
            if (existingUser) {
                return res.render('register.ejs', { message: 'Account already exists' });
            }
    
            const user = await User.create(obj);
            const token = jwt.sign({ id: user._id }, 'eftekher');
            res.cookie('user', token, {
                expires: new Date(Date.now() + 60 * 1000 * 5),
                httpOnly: true
            });
            res.redirect('/login');
        } catch (error) {
            console.error('Error while creating user:', error);
            res.status(500).json({ success: false, message: 'Internal server error.' });
        }
    });
    
    app.get('/login', (req, res) => {
        res.render('login.ejs', { message: null });
    });
    
    app.post('/login', async (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
    
        try {
            const user = await User.findOne({ email });
    
            if (!user) {
                return res.render('login.ejs', { message: 'User not found. Please register.' });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const token = jwt.sign({ id: user._id }, 'eftekher');
                res.cookie('user', token, {
                    expires: new Date(Date.now() + 60 * 1000 * 5),
                    httpOnly: true
                });
                res.redirect('/');
            } else {
                res.render('login.ejs', { message: 'Invalid password. Please try again.' });
            }
        } catch (error) {
            console.error('Error while logging in:', error);
            res.render('login.ejs', { message: 'An error occurred. Please try again later.' });
        }
    });
       
app.get('/logout', (req, res) => {
    res.cookie('user', '', { expires: new Date(0), httpOnly: true });
    res.redirect('/');
});

app.post('/logout', (req, res) => {
    res.cookie('user', '', { expires: new Date(0), httpOnly: true });
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`listening on ${port}`);
});
