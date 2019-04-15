import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';
import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import {DTOFirstName, DTOLastName,DTOEmail,DTOPassword} from '../routes/dto';




export class AuthController {

    constructor() {}

    public static needCheck(key:string, value:string) : boolean {
        let obj = AppConfig.sharedSettings.find(obj => obj.key == key);
        if (obj)
            if (obj.value == value) 
                return true;
        return false;
    }

    //User signup
    public signup(req: Request, res: Response, next: NextFunction) {

        console.log("Provided email : "+ req.body.email);
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        }).then((result)=> {
            res.json(result);
        })
        .catch(error => {
            console.log("Sedning error !!!!!!!!!!!!!!!!!!!!!!!!!");
            next(new HttpException(400, error.message, error.errors));
        });
    }

    //ADD CHECKS
    public signupChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOPassword)); //Allways include password
        if (AuthController.needCheck("signup_firstName", "include"))
            handlers.push(Middleware.validation(DTOFirstName));

        if (AuthController.needCheck("signup_lastName", "include")) {
            handlers.push(Middleware.validation(DTOLastName));
        }
        if (AuthController.needCheck("signup_email", "include")) {
            handlers.push(Middleware.validation(DTOEmail));
        }
        return handlers;
    }

 

}