//Define all API routes here !!!!
import express from 'express';
import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import {SettingController} from '../controllers/setting.controller';
import { messages } from "../middleware/common";

export class Routes {    
  //Call all controllers required here  
  public userController : UserController = new UserController();   
  public settingController : SettingController = new SettingController();


  public routes(app:Router): void {          

      
    app.route('/')
        .get((req: Request, res: Response, next: NextFunction) => {            
            res.status(200).send({
                message: messages.description
            });
    });

/*
    // Create a new Note
    app.post('/notes', notes.create);

    // Retrieve all Notes
    app.get('/notes', notes.findAll);

    // Retrieve a single Note with noteId
    app.get('/notes/:noteId', notes.findOne);

    // Update a Note with noteId
    app.put('/notes/:noteId', notes.update);

    // Delete a Note with noteId
    app.delete('/notes/:noteId', notes.delete);
*/

    //NAMING CONVENTIONS ENDPOINTS
    //  /api/<plural>/all        GET     : getAll (returns all records)
    //  /api/<plural>/get/id     POST    : getOneById (returns found record or null)
    //  /api/<plural>/get/field  POST    : getOneByField
    //  /api/<plural>/create     POST    : add  (returns the new record)
    //  /api/<plural>/delete     DELETE  : remove (by Id)


    /////////////////////////////////////////////////////////////////
    // SETTINGS CONTROLLER PART
    ////////////////////////////////////////////////////////////////
      app.route('/api/settings/all')
      .get(this.settingController.getAll);
      app.route('/api/settings/get/key')
      .post(this.settingController.getByKeyChecks(),this.settingController.getByKey);
      app.route('/api/settings/create')
      .post(this.settingController.addChecks(),this.settingController.add);
    
    /////////////////////////////////////////////////////////////////
    // USER CONTROLLER PART
    ////////////////////////////////////////////////////////////////
        

        //Get all users
        app.route('/api/users')
        .get(this.userController.getUsers);

        //Get user by ID
        app.route('/api/users')
        .post(this.userController.getUserByIdChecks(),this.userController.getUserById);


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