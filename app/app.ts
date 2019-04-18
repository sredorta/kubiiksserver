import express from 'express';
import path from 'path';
import * as bodyParser from 'body-parser';
import passport from "passport";
import { Routes } from "./routes/index";
import {Middleware} from "./middleware/common";



import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {User} from './models/user';
import {Account} from './models/account';



class App {

    public app: express.Application;
    public routePrv: Routes = new Routes();
    constructor() {
        this.app = express();
        this.config();    
        this.initializeMiddlewares();
        this.routePrv.routes(this.app);
        this.initializeErrorHandling();
    }

    private config(): void {
        //Setup views setting
        this.app.set("view engine", "pug"); 
        this.app.set("views", path.join(__dirname, "views"));
        //Use passports
        //Extracts the token from the request !!!!
        this.app.use(passport.initialize());

        
    }

    //Call herea all common to all routes middlewares
    private initializeMiddlewares() {
        // support application/json type post data
        this.app.use(bodyParser.json());
        // support application/x-www-form-urlencoded post data
        //this.app.use(bodyParser.urlencoded({extended: false}));

        //this.app.use(express.json());        //Use JSON post parameters format 
        this.app.use(Middleware.cors());     //Enable cors
        this.app.use(Middleware.language()); //Parses headers and determines language
        this.app.use(passport.initialize());
        

        //PASSPORT PART !!!!!!
        passport.serializeUser(function(user, done) {
            done(null, user);
        });
        
        passport.deserializeUser(function(obj, done) {
            done(null, obj);
        });

        console.log("Before passport.use");
        passport.use('local',new passportLocal.Strategy({
            usernameField: 'username',
            passwordField: 'password',
        }, 
        function (email, password, done)  {
          console.log("LOCAL STRATEGY !!!!");
          let user = User.build({email:"test"});
          return done(null, user, {message: 'Incorrect email or password.'});
        }));

        console.log("After passport.use");

    }

    //Call here the error Handling middleware
    private initializeErrorHandling() {
        //Error handling controller must be after all routes
        this.app.use(Middleware.errorHandler());
    }
}

export default new App().app;





