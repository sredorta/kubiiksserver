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
export class CathegoryController {


    constructor() {}

    /**Gets all cathegories of articles filtered with the role of the user */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            
            let cathegories = await Cathegory.findAll();
            let myUser = await User.scope("details").findByPk(req.user.id);
            let result = [];
            if (!myUser) throw new Error("User not found !"); 
            //Filter cathegories depending on role of user
            if (myUser.hasRole("kubiiks")) {
                 result = cathegories;
            } else if (myUser.hasRole("admin")) {
                result = cathegories.filter(obj => obj.role != "kubiiks");
            } else {
                if (myUser.hasRole("blog")) {
                    for (let cathegory of cathegories) {
                        if (cathegory.role == "blog") result.push(cathegory); 
                    }
                }
                if (myUser.hasRole("content")) {
                    for (let cathegory of cathegories) {
                        if (cathegory.role == "content") result.push(cathegory); 
                    }
                }
            }
            res.json(result);
        } catch(error) {
            next(error);
        }
    }
}