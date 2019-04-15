//Define all API routes here !!!!
import express from 'express';
import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import {SettingController} from '../controllers/setting.controller';
import {AuthController} from '../controllers/auth.controller';
import { messages } from "../middleware/common";
import {Middleware} from '../middleware/common';


export class Routes {    
  //Call all controllers required here  
  public userController : UserController = new UserController();   
  public settingController : SettingController = new SettingController();
  public authController : AuthController = new AuthController();


  public routes(app:Router): void {          

      
    app.route('/')
        .get((req: Request, res: Response, next: NextFunction) => {            
            res.status(200).send({
                message: messages.description
            });
    });


    //NAMING CONVENTIONS ENDPOINTS
    //  /api/<plural>/all        GET     : getAll (returns all records)
    //  /api/<plural>/get/id     POST    : getOneById (returns found record or null)
    //  /api/<plural>/get/field  POST    : getOneByField
    //  /api/<plural>/create     POST    : add  (returns the new record)
    //  /api/<plural>/delete     DELETE  : remove (by Id)


    /////////////////////////////////////////////////////////////////
    // SETTINGS CONTROLLER PART
    //  This table is mapped from the config.json on the server start
    //  FE can only read this table to has access to the server config
    ////////////////////////////////////////////////////////////////
      app.route('/api/settings/all')
      .get(this.settingController.getAll);
      app.route('/api/settings/get/key')
      .post(this.settingController.getByKeyChecks(),this.settingController.getByKey);
    /////////////////////////////////////////////////////////////////
    // USER CONTROLLER PART
    ////////////////////////////////////////////////////////////////
        
        const router = Router();

        //Get all users
        //app.route('/api/users')
        //.get([Middleware.checkJwt],);
        app.route("/api/users/all")
        .get(Middleware.checkJwt(),UserController.getAll);

        //Get user by ID
        app.route('/api/users/get/id')
        .post(this.userController.getUserByIdChecks(),UserController.getOneById);


        app.route('/api/auth/signup')
        .post(AuthController.signupChecks(),AuthController.signup);



        //Create new user
        app.route('/api/usercreate')
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