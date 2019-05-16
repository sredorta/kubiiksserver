import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';




export class UserController {


    /**Gets all user with their roles */
    static getAll = async(req: Request, res: Response, next: NextFunction) => {
        try {
            res.json(await User.scope("withRoles").findAll());
        } catch(error) {
            next(error);
        }        
    }

    /**Remove user by id */
    static delete = async(req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user.id == req.body.id) {
                throw new HttpException(400, messages.validationSelfUser ,null);
            }
            let myUser =  await User.findByPk(req.body.id);
            if (myUser) {
                await myUser.destroy(); 
            }
            res.status(204).json("deleted");
        } catch(error) {
            next(error);
        }
    }

    /**removeChecks parameter validation */
    static deleteChecks() {
        return [
            body('id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(User,'id')),
            Middleware.validate()
        ]
    }      







    ///////////////////////////////////////////////////////////////////////////
    //Get user by ID
    ///////////////////////////////////////////////////////////////////////////
    static getOneById = async (req: Request, res: Response, next: NextFunction) => {
        const id = req.body.id;
         //Do not include password and others
        User.findByPk(id)
        .then(result => {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }   
    //Get user by ID CHECKS
    public static getUserByIdChecks() {
        return [
            body('id').exists().isUUID("all"),
            Middleware.validate()
        ]        
        //return Middleware.validation(GetUserByIdDTO);
    }




    /////////////////////////////////////////////////////////////////////////////////////
    //TESTING PARAMS

    static test = async (req: Request, res: Response, next: NextFunction) => {
        console.log(JSON.parse(JSON.stringify("Hello")));
        console.log(JSON.parse(JSON.stringify({"test":"test","hello":"world"})));

        res.json("SUCCESS !!!");
    }
    /**Parameter validation */
    static testchecks() {
        return [
            body('firstName').custom(CustomValidators.nameValidator('firstName')),
            body('lastName').custom(CustomValidators.nameValidator('lastName')),
            body('email').exists().withMessage('exists').isEmail(),
            body('phone').custom(CustomValidators.phone('phone')),
            body('mobile').custom(CustomValidators.mobile('mobile')),
            body('password').exists().withMessage('exists').custom(CustomValidators.password()),
            body('terms').exists().withMessage('exists').custom(CustomValidators.checked()),
            body('terms').custom(CustomValidators.dBuserNotPresent(User)),
            Middleware.validate()
        ]
    }    
    static conditional() {

    }

}