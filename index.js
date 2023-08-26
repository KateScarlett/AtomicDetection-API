import { log } from "console";
import express from "express";
import bcrypt from "bcrypt";
import cors from "cors";

const database = {
    users: [
        {
            id: '1',
            name: 'Kate',
            email: 'ztm@kate.nl',
            password: 'kate',
            entries: 0,
            joined: new Date(),
            hash: ""
        },
        {
            id: '2',
            name: 'Luna',
            email: 'ztm@luna.nl',
            password: 'luna_password',
            entries: 0,
            joined: new Date(),
            hash: ""
        }
    ]
}
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
    res.send(database.users);
});

app.post('/signin', (req,res) => {

    const {email , password, hash } = req.body;

    bcrypt.compare("jessica_password", "$2b$10$81.zhepi4yOciDPRYLqcRekCkRA09S770WeTmqKXYhHFPOoYuqI.C", function(err, result) {
        log(result);
    })

    if (email=== database.users[0].email && password === database.users[0].password){
        res.json("success");
    }else{
        res.status(400).json('User/password not valid!')
    }
})

app.post('/register', (req,res) => {
    const {email, name, password} = req.body;

    const hash = bcrypt.hashSync(password, salt);

    database.users.push({
        id: 3,
        name: email,
        email: name,
        password: password,
        entries: 0,
        joined: new Date(),
        hash: hash
    });
    res.json(database.users[database.users.length-1]);
});

app.get('/profile/:id', (req,res,next) => {
   const {id} = req.params;
   let found = false;
   database.users.forEach(user => {
       if(user.id === id){
           found = true;
           return res.json(user);
       }
   });

   if(!found){
       res.status(404).json('User not found');
   }
});

app.put('/image', (req, res) => {
    const {id} = req.body;
    let found = false;
    database.users.forEach(user => {
        if(user.id === id){
            found = true;
            user.entries++;
            return res.json(user.entries);
        }
    });

    if(!found){
        res.status(404).json('User not found');
    }
});

app.listen(3000, () => {
    log('App is running on port 3000');
})


//
// bcrypt.compare(someOtherPlaintextPassword, hash, function(err, result) {
//     // result == false
// });
