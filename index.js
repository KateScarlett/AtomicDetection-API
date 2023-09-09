import {log} from "console";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";
import 'dotenv/config';
import handleRegister from "./controllers/register.js";
import handleSignIn from "./controllers/signin.js";
import handleImage from "./controllers/image.js";
import handleApiCall from "./controllers/clarifai.js";

const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DATABASE_HOST,
        port: process.env.DATABASE_PORT,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME
    }
});

// On server load list users
db.select('name').from('users').then(data => {
    log(data);
});

const app = express();
const options = {
    origin: '*',
}
app.use(cors(options));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.get('/', (req, res) => {
    db.select('*').from('users')
        .then(users => {
            res.send(users);
        })
        .catch(err => res.status(400).json('Unable to retrieve users'))
    ;
});

// Advanced passing of req,res
app.post('/signin', handleSignIn(db,bcrypt));
app.post('/register', (req, res) => {
    handleRegister(req,res,db,bcrypt);
});
app.get('/profile/:id', (req,res,next) => {
    handleImage(req,res,next,db);
});
app.put('/image', (req,res) => {
    handleImage(req,res,db);
});

app.post('/api', (req,res) => {
    handleApiCall(req,res);
});

app.listen(3000, () => {
    log('App is running on port 3000');
})