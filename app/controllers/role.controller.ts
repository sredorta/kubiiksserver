import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';




export class RoleController {

    /**Gets all available roles */
    static getAll = async(req: Request, res: Response, next: NextFunction) => {  
        //We remove the kubiiks role so that is not visible on the frontend
        let myRoles =  await Role.findAll();
        if (myRoles)
            myRoles = myRoles.filter(obj=> obj.name!= "kubiiks")
        res.json(myRoles);
    }

    /**Static attach role to user */
    static attach = async(req: Request, res: Response, next: NextFunction) => {
        try {
            let myUser = await User.findByPk(req.body.userId);
            let myRole = await Role.findByPk(req.body.roleId);
            if (myRole)
                if (myRole.name == "kubiiks") 
                    throw new HttpException(400, messages.authKubiiksRole ,null);
            if (myUser) {
                await myUser.attachRole(req.body.roleId);
            }  
            res.json(await User.scope("withRoles").findByPk(req.body.userId));
        } catch(error) {
            next(error);
        }
    }
    /** Role attach parameter validation */
    static attachChecks() {
        return [
            body('userId').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(User,'id')),
            body('roleId').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Role,'id')),
            Middleware.validate()
        ]
    }    

    /**Static detach role from user */
    static detach = async(req: Request, res: Response, next: NextFunction) => {
        try {
            //Do not allow self removal of admin rights
            if (req.user.id == req.body.userId && req.body.roleId == 1) {
                throw new HttpException(400, messages.validationSelfUser ,null);
            }
            let myRole = await Role.findByPk(req.body.roleId);
            if (myRole)
                if (myRole.name == "kubiiks") 
                    throw new HttpException(400, messages.authKubiiksRole ,null);
            let myUser = await User.findByPk(req.body.userId);
            if (myUser) {
                await myUser.detachRole(req.body.roleId);
            }  
            res.json(await User.scope("withRoles").findByPk(req.body.userId));
        } catch(error) {
            next(error);
        }
    }
    /** Role detach parameter validation */
    static detachChecks() {
        return [
            body('userId').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(User,'id')),
            body('roleId').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Role,'id')),
            Middleware.validate()
        ]
    }    

}