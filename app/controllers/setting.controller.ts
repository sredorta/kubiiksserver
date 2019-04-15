import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {messages} from '../middleware/common';


import { IsNumber, IsEmail,IsString } from 'class-validator';
//DEFINE HERE ALL DTO CLASSES FOR PARAMETER VALIDATION
class DTOKey {
    @IsString({
        message: function() {
            return messages.validation("key");
        }
    })
    public key!: string;
}

/*class DTOValue {
    @IsString({
        message: function() {
            return messages.validation("value");
        }
    })
    public value!: string;
}*/


export class SettingController {

    //Get all settings from the table 
    public getAll(req: Request, res: Response, next: NextFunction) {
        Setting.findAll().then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    //Get user by key
    public getByKey(req: Request, res: Response, next: NextFunction) {
        const key = req.body.key;
        Setting.findOne({
            where: {
                "key": key
            }
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }   
    //Get user by ID CHECKS
    public getByKeyChecks() {
        return Middleware.validation(DTOKey);
    }



}