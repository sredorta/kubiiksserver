import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';
import AppConfig from '../config/config.json';

import { IsNumber, IsEmail,IsString, MinLength, MaxLength } from 'class-validator';
//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
class DTOHasFirstName {
    @IsString()
    @MinLength(2)
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
    @IsEmail()
    public email!: string;
}

class DTOHasPassword {
    @IsString()
    @MinLength(8)
    @MaxLength(50)
    public password!: string;
}


export class AuthController {

    //User signup
    public signup(req: Request, res: Response, next: NextFunction) {
        User.create({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            next(new HttpException(400, "sequelize", error.message, error.errors));
        });
    }

    //ADD CHECKS
    public signupChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOHasPassword)); //Allways include password
        let obj = AppConfig.settings.find(obj => obj.key == "firstName");
        if (obj)
            if (obj.value == "include") {
                console.log("INCLUDING FIRST NAME !!!!");    
                handlers.push(Middleware.validation(DTOHasFirstName));
            }
        //TODO remove user from config.json and update here below !!!    
        if (AppConfig.user.lastName == "include") {
            handlers.push(Middleware.validation(DTOHasLastName));
        }
        if (AppConfig.user.email == "include") {
            handlers.push(Middleware.validation(DTOHasEmail));
        }
        return handlers;
    }

 

}