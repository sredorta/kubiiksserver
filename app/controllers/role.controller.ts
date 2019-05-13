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

}