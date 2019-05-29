import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import { Article } from '../models/article';



export class ArticleController {

    constructor() {}

    /**Gets all articles for all cathegories, admin or blog rights required */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let articles = await Article.findAll();
            for (let article of articles) result.push(article.sanitize(res.locals.language,"summary"));
            res.json(result);
        } catch(error) {
            next(error);
        }
       
    }


    static getByCathegory = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let articles = await Article.findAll({where: {cathegory: req.body.cathegory}});
            for (let article of articles) result.push(article.sanitize(res.locals.language, "summary"));
            res.json(result);
        } catch(error) {
            next(error);
        }
       
    }
    /**Parameter validation */
    static getByCathegoryChecks() {
        return [
            body('cathegory').exists().withMessage('exists').isLength({min:2}).withMessage("minlength"),
            Middleware.validate()
        ]
    }
}        