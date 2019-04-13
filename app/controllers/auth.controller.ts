import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';


import { IsNumber, IsEmail,IsString } from 'class-validator';
//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
class DTOHasKey {
    @IsString()
    public key!: number;
}

class DTOHasValue {
    @IsString()
    public value!: number;
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
    public addChecks() {
        return Middleware.validation(DTOHasKey);
    }

 

}