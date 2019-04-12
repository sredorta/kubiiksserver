import express from 'express'; //= require('express');
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import {User} from './models/user';
import {Account} from './models/account';
import errorMiddleware from './middleware/error.middleware';
import HttpException from './classes/HttpException';
//import { messages as en, messages } from './i18n/en';

import {Middleware,messages} from './middleware/common';

declare global {
    namespace Express {
        interface Request {
        language?: string
        }
    }
}

// Create a new express application instance
const env = process.env.NODE_ENV || 'development';
const configdb = require(__dirname + '/config/configdb.json')[env];
const config = require(__dirname + '/config/config.json');

const app: express.Application = express();
const routes = express.Router();
const sequelize = new Sequelize(configdb.database, configdb.username, configdb.password, configdb.options);;


//Table definitions
//Create table if it doesn't exists
Account.init(Account.definition(sequelize).params,Account.definition(sequelize).table);

User.init(User.definition(sequelize).params,User.definition(sequelize).table);
User.hasMany(Account, {foreignKey: 'userId', as: 'accounts'});



//force:true forces to recreate all the models before making the sync
sequelize.sync({force:true}).then(function() {

    //CORS Middleware
/*app.use(function (req, res, next) {
    //Enabling CORS
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
    next();
   });*/

//Common middlewares   
app.use(Middleware.cors());     //Enable cors
app.use(Middleware.language()); //Parses headers and determines language


   //app.use('/', routes);
/*router.get('/', function (req, res) {
  res.send('Hello World!');
});
app.use('/api/users', router);*/

app.get('/api/users/test' , function(req,res,next) {
    console.log("Response in language : " + req.language);
    User.create({
        firstName: "sergi",
        email: "test@test.com",
        preferredName: 'WithAccounts',
    }).then((result)=> {
        res.send(result);
    }).catch( (error) => {
        console.log("We got error !!!");
        next(new HttpException(error.name, error.message, error.errors));
        //new HttpException(200, 'Error test !!!!')
    });
});

app.get('/', function(req,res) {
    let result = {
        description: messages.description,
        version: config.api.version,
        languages : Middleware.languagesSupported().toString()
    }
    res.json(result);
});


app.get('/api/data', function(req,res) {
    res.json({data: "You are the best !!!!!!!"});
  });
app.get('/api/data2', function(req,res) {
    res.send({data: "HTTP !!!You are the best HTTP !!!"});
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
});