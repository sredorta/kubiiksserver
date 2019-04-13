import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';


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




export class SettingController {
    //Add a specific setting
    public add(req: Request, res: Response, next: NextFunction) {
        Setting.create({
            key: req.body.key,
            value: req.body.value
        }).then((result)=> {
            res.json(result);
        }).catch((error)=> {
            next(new HttpException(500, "sequelize", error.message, error.errors));
        });
    }
    //ADD CHECKS
    public addChecks() {
        return Middleware.validation(DTOHasKey);
    }

 
    public getAll(req: Request, res: Response, next: NextFunction) {
        Setting.findAll().then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, "sequelize", error.message, error.errors));
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
            next(new HttpException(500, "sequelize", error.message, error.errors));
        });
    }   
    //Get user by ID CHECKS
    public getByKeyChecks() {
        return Middleware.validation(DTOHasKey);
    }



}