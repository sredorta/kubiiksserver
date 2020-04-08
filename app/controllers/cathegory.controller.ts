import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import { CustomValidators } from '../classes/CustomValidators';
import sequelize from 'sequelize';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/config';
import {messages} from '../middleware/common';
import { Article } from '../models/article';
import { ArticleTranslation } from '../models/article_translation';
import { User } from '../models/user';
import * as converter from 'xml-js';
import fs from 'fs';
import { Setting } from '../models/setting';
import { Cathegory } from '../models/cathegory';
import { userInfo } from 'os';
export class CathegoryController {


    constructor() {}

    /**Gets all cathegories of articles filtered with the role of the user */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            if(!req.user) throw new Error("User not found !");
            let cathegories = await Cathegory.findAll();
            let myUser = await User.scope("details").findByPk(req.user.id);
            let result = [];
            if (!myUser) throw new Error("User not found !"); 
            for (let cathegory of cathegories) {
                if (cathegory.role == "blog" && myUser.hasRole("blog")) result.push(cathegory); 
                if (cathegory.role == "content" && myUser.hasRole("content")) result.push(cathegory); 
                if (cathegory.role == "kubiiks" && myUser.hasRole("kubiiks")) result.push(cathegory); 
            }
            result = result.filter(obj => obj.name != "content");  //Always remove content cathegory
            res.json(result);
        } catch(error) {
            next(error);
        }
    }
}