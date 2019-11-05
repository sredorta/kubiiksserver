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
import { Setting } from '../models/setting';
import { Page } from '../models/page';



export class InitController {

    constructor() {}

    /**Gets all data required for app initialization in one shot */
    static get = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result : any = {};
            let settings = await Setting.findAll();
            let pages = await Page.findAll();
            let myUser = null;
            if (settings) 
                result["settings"] = [];
            for (let setting of settings) {
                    result["settings"].push(setting.sanitize(res.locals.language))
            }
            let articles = await Article.findAll({order: [sequelize.literal('id DESC')]});
            result["articles"] = [];
            for (let article of articles) 
                result["articles"].push(article.sanitize(res.locals.language));
            result["pages"] = [];
            for (let page of pages) 
             result["pages"].push(page.sanitize(res.locals.language));

            if (req.user)    
                 myUser = await User.scope("details").findByPk(req.user.id);
                 if (myUser)
                    result["user"] = myUser.sanitize(res.locals.language);
            else    
                result["user"] = null;    
            res.json(result);
        } catch(error) {
            next(error);
        }
    }
}
