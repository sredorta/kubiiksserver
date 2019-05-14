import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';




export class RoleController {

    /**Gets all available roles */
    static getAll = async(req: Request, res: Response, next: NextFunction) => {
        res.json(await Role.findAll());
    }

    /**Static attach role to user */
    static attach = async(req: Request, res: Response, next: NextFunction) => {
        let myUser = await User.findByPk(req.body.userId);
        if (myUser) {
            await myUser.attachRole(req.body.roleId);
        }  
        res.json(await User.scope("withRoles").findByPk(req.body.userId));
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
        let myUser = await User.findByPk(req.body.userId);
        if (myUser) {
            await myUser.detachRole(req.body.roleId);
        }  
        res.json(await User.scope("withRoles").findByPk(req.body.userId));
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