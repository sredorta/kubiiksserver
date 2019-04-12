import express from 'express';
import {Router} from 'express';
import { Routes } from "./routes/index";
import {Middleware} from "./middleware/common";

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
    }

    //Call herea all common to all routes middlewares
    private initializeMiddlewares() {
      this.app.use(Middleware.cors());     //Enable cors
      this.app.use(Middleware.language()); //Parses headers and determines language
    }

    //Call here the error Handling middleware
    private initializeErrorHandling() {
        //Error handling controller must be after all routes
        this.app.use(Middleware.errorHandler());
    }
}

export default new App().app;





