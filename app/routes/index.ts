//Define all API routes here !!!!

import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import { messages } from "../middleware/common";
import {Middleware} from "../middleware/common";


export class Routes {    
    public userController : UserController = new UserController();   

    public routes(app:Router): void {          

      //Common middlewares   
      app.use(Middleware.cors());     //Enable cors
      app.use(Middleware.language()); //Parses headers and determines language

      app.route('/')
        .get((req: Request, res: Response, next: NextFunction) => {            
            res.status(200).send({
                message: messages.description
            });
        });
        
        app.route('/user')
        .get(this.userController.addNewUser);

        
        // Contact 
        app.route('/contact') 
        // GET endpoint 
        .get((req: Request, res: Response) => {
        // Get all contacts            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        })        
        // POST endpoint
        .post((req: Request, res: Response) => {   
        // Create new contact         
            res.status(200).send({
                message: 'POST request successfulll!!!!'
            });
        })

        // Contact detail
        app.route('/contact/:contactId')
        // get specific contact
        .get((req: Request, res: Response) => {
        // Get a single contact detail            
            res.status(200).send({
                message: 'GET request successfulll!!!!'
            });
        })
        .put((req: Request, res: Response) => {
        // Update a contact           
            res.status(200).send({
                message: 'PUT request successfulll!!!!'
            });
        })
        .delete((req: Request, res: Response) => {       
        // Delete a contact     
            res.status(200).send({
                message: 'DELETE request successfulll!!!!'
            });
        })


    }
}