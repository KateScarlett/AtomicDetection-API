import {log} from "console";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";
import knex from "knex";
import 'dotenv/config';

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

const saltRounds = 10;
const salt = bcrypt.genSaltSync(saltRounds);

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

app.post('/signin', (req, res) => {
    db.select('email', 'hash').from('login')
        .where('email', '=', req.body.email)
        .then(data => {
            const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
            if (isValid) {
                db.select('*').from('users')
                    .where('email', '=', req.body.email)
                    .then(user => {
                        res.json(user[0]);
                    })
                    .catch(err => res.status(400).json('Unable to get user'))
            } else {
                res.status(400).json('Wrong credentials');
            }
        }).catch(err => res.status(400).json('Wrong Credentials'));
})

app.post('/register', (req, res) => {
    const {email, name, password} = req.body;

    const hash = bcrypt.hashSync(password, salt);
    db.transaction(trx => {
        trx.insert({
            hash: hash,
            email: email
        })
            .into('login')
            .returning('email')
            .then(loginEmail => {
                trx('users')
                    .returning('*')
                    .insert({
                        email: loginEmail[0].email,
                        name: name,
                        joined: new Date()
                    }).then(user => {
                    res.json(user[0]);
                })
            })
            .then(trx.commit)
            .catch(trx.rollback)
    })
        .catch(err => res.status(400).json('Unable to register'))
});

app.get('/profile/:id', (req, res, next) => {
    const {id} = req.params;
    db.select('*')
        .from('users')
        .where({id})
        .then(user => {
            if (user.length) {
                res.json(user[0]);
            } else {
                res.status(400).json('Unable to retrieve profile');
            }
        }).catch(err => res.status(400).json('error Unable to retrieve profile'));
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    db('users').where({id})
        .increment('entries', 1)
        .returning('entries')
        .then(entries => {
            res.json(entries[0].entries);
        })
        .catch(err => res.status(400).json('Unable to get entries'));
});

app.listen(3000, () => {
    log('App is running on port 3000');
})