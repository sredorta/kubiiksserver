import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';
import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import {DTOFirstName, DTOLastName,DTOEmail,DTOPassword,DTOPhone,DTOMobile} from '../routes/dto';
import { Helper } from '../classes/Helper';




export class AuthController {

    constructor() {}

    //User signup
    public signup(req: Request, res: Response, next: NextFunction) {

        console.log("Provided email : "+ req.body.email);
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone:req.body.phone,
            mobile:req.body.mobile
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
        if (Helper.isValidationCheckRequired("signup_firstName", "include"))
            handlers.push(Middleware.validation(DTOFirstName));
        if (Helper.isValidationCheckRequired("signup_lastName", "include")) 
            handlers.push(Middleware.validation(DTOLastName));
        if (Helper.isValidationCheckRequired("signup_email", "include")) 
            handlers.push(Middleware.validation(DTOEmail));
        if (Helper.isValidationCheckRequired("signup_phone", "include")) 
            handlers.push(Middleware.validation(DTOPhone));
        if (Helper.isValidationCheckRequired("signup_mobile", "include")) 
            handlers.push(Middleware.validation(DTOMobile));
        return handlers;
    }

 

}