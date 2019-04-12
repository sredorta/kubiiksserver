import express from 'express';
import {Router} from 'express';
import { Routes } from "./routes/index";
class App {

    public app: express.Application;
    public routePrv: Routes = new Routes();
    constructor() {
        this.app = express();
        this.config();    
        this.routePrv.routes(this.app);
    }

    private config(): void {
    }
}

export default new App().app;





