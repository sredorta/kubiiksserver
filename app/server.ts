import app from "./app";
import {Middleware} from './middleware/common';
import { Sequelize } from 'sequelize';
import {User} from './models/user';
import {Account} from './models/account';
import AppConfig from './config/config.json';


const PORT = 3000;
const sequelize = new Sequelize(AppConfig.db.database, AppConfig.db.username, AppConfig.db.password, <any>AppConfig.db.options);

//Common middlewares   
//app.use(Middleware.cors());     //Enable cors
//app.use(Middleware.language()); //Parses headers and determines language

Account.init(Account.definition(sequelize).params,Account.definition(sequelize).table);
User.init(User.definition(sequelize).params,User.definition(sequelize).table);
User.hasMany(Account, {foreignKey: 'userId', as: 'accounts'});

async function startServer() {    
    await sequelize.sync({force:true});
    //Start server listenning
    app.listen(PORT, () => {
        console.log('Express server listening on port ' + PORT);
    });
}
startServer();





/*
import express from 'express';
import 'reflect-metadata'; //TODO remove
import { Sequelize, Model, DataTypes, BuildOptions } from 'sequelize';
import {User} from './models/user';
import {Account} from './models/account';
import errorMiddleware from './middleware/error.middleware';
import HttpException from './classes/HttpException';
import {Middleware,messages} from './middleware/common';
import * as masterRouter from './routes/index';
import {WelcomeController} from './controllers/index';

import AppConfig from './config/config.json';

declare global {
    namespace Express {
        interface Request {
        language?: string
        }
    }
}


// Create a new express application instance
const env = process.env.NODE_ENV || 'development';

const app: express.Application = express();
const router = express.Router();
const sequelize = new Sequelize(AppConfig.db.database, AppConfig.db.username, AppConfig.db.password, <any>AppConfig.db.options);








//Table definitions
//Create table if it doesn't exists
Account.init(Account.definition(sequelize).params,Account.definition(sequelize).table);

User.init(User.definition(sequelize).params,User.definition(sequelize).table);
User.hasMany(Account, {foreignKey: 'userId', as: 'accounts'});



//force:true forces to recreate all the models before making the sync
sequelize.sync({force:true}).then(function() {

//Common middlewares   
app.use(Middleware.cors());     //Enable cors
app.use(Middleware.language()); //Parses headers and determines language

app.use('/welcome', WelcomeController);

app.use("/",)
app.use('/api', masterRouter);


/*
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
app.use("/", router);
router.get('/', function(req,res) {
    let result = {
        description: messages.description,
        version: AppConfig.api.version,
        languages : Middleware.languagesSupported().toString()
    }
    res.json(result);
});


app.get('/api/data', function(req,res) {
    res.json({data: "You are the best !!!!!!!"});
  });
app.get('/api/data2', function(req,res) {
    res.send({data: "HTTP !!!You are the best HTTP !!!"});
})*/
/*
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});
});*/