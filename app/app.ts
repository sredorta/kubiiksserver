import express from 'express';
import path from 'path';
import * as bodyParser from 'body-parser';
import passport from "passport";
import { Routes } from "./routes/index";
import {Middleware} from "./middleware/common";
import {Passport} from "./classes/Passport";

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
        //console.log(`Current NODE_ENV is ${process.env.NODE_ENV}`);

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

        //Declare all available passports   
        this.app.use(passport.initialize()); 
        Passport.init();
        Passport.local();
        Passport.jwt();
        Passport.facebook();
        Passport.googleplus();

    }

    //Call here the error Handling middleware
    private initializeErrorHandling() {
        //Error handling controller must be after all routes
        this.app.use(Middleware.errorHandler());
    }
}

export default new App().app;





