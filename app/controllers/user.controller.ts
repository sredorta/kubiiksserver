import express from 'express'; //= require('express');
import {User} from '../models/user';

export class UserController {
    public addNewUser (req: express.Request, res: express.Response, next: express.NextFunction) {                
        //TODO switch to await/async
        User.create({
            firstName: "sergi",
            email: "test@test.com",
            preferredName: 'WithAccounts',
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            //next(new HttpException(error.name, error.message, error.errors));
            //new HttpException(200, 'Error test !!!!')
        });
    }
}