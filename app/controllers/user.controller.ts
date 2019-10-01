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
            res.json(await User.scope("details").findAll());
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

    /**Update value with translations if required, we expect object with id,default, fr,en... */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let myUser = await User.findByPk(req.body.user.id);
            if (!myUser) throw new Error("User not found with id: " + req.body.user.id);
            if (req.body.firstName)
                myUser.firstName = req.body.user.firstName;
            if (req.body.lastName)
                myUser.lastName = req.body.user.lastName;
            if (req.body.email)
                myUser.email = req.body.user.email;
            if (req.body.phone)
                myUser.phone = req.body.user.phone;            
            if (req.body.mobile)
                myUser.mobile = req.body.user.mobile;    
            if (req.body.user.isEmailValidated)
                myUser.isEmailValidated = req.body.user.isEmailValidated;    
            if (req.body.user.avatar)
                myUser.avatar = req.body.user.avatar;      
            await myUser.save();
            res.json(myUser);

        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        }

    }
    //We expect following format
    //  {lang:<SettingId>, value:<SettingValue>
    /**Update checks */
    static updateChecks() {
        return [
            body('user.id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(User,'id')),
            body('firstName').optional().custom(CustomValidators.nameValidator('firstName')),
            body('lastName').optional().custom(CustomValidators.nameValidator('lastName')),
            body('email').optional().isEmail(),
            body('phone').optional().custom(CustomValidators.phone('phone')),
            body('mobile').optional().custom(CustomValidators.mobile('mobile')),
            body('isEmailValidated').optional().isBoolean(),
            body('avatar').optional().isURL(),
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




}