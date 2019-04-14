import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';
import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import { IsNumber, IsEmail,IsString, MinLength, MaxLength } from 'class-validator';
import {IsPassword} from '../classes/ParameterValidationDecorators';

//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
class DTOHasFirstName {
    @IsString()
    @MinLength(2, {
        message: function (){
            return messages.validationMinLength(messages.firstName,"2")
        }
    })
    @MaxLength(50)
    public firstName!: number;
}

class DTOHasLastName {
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    public lastName!: number;
}

class DTOHasEmail {
    //@IsUnique(User)
    @IsEmail()
    public email!: string;
}

class DTOHasPassword {
    @IsPassword()
    public password!: string;
}


export class AuthController {

    constructor() {
        console.log("Just created AuthController");
        console.log(messages.description);
    }
    private _needCheck(key:string, value:string) : boolean {
        let obj = AppConfig.sharedSettings.find(obj => obj.key == key);
        if (obj)
            if (obj.value == value) 
                return true;
        return false;
    }

    //User signup
    public signup(req: Request, res: Response, next: NextFunction) {
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        }).then((result)=> {
            res.json(result);
        }).error(error => {
            console.log(error);
        })
        .catch( (error) => {
            console.log("We got error !!!");
            next(new HttpException(400, "sequelize", error.message, error.errors));
        });
    }

    //ADD CHECKS
    public signupChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOHasPassword)); //Allways include password
        if (this._needCheck("signup_firstName", "include"))
            handlers.push(Middleware.validation(DTOHasFirstName));

        if (this._needCheck("signup_lastName", "include")) {
            handlers.push(Middleware.validation(DTOHasLastName));
        }
        if (this._needCheck("signup_email", "include")) {
            handlers.push(Middleware.validation(DTOHasEmail));
        }

        return handlers;
    }

 

}