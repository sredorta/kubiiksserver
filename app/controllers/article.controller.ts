import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import { CustomValidators } from '../classes/CustomValidators';

import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import { Article } from '../models/article';
import { ArticleTranslation } from '../models/article_translation';



export class ArticleController {

    constructor() {}

    /**Gets all articles for all cathegories, admin or blog rights required */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let articles = await Article.findAll();
            for (let article of articles) result.push(article.sanitize(res.locals.language,"full"));
            res.json(result);
        } catch(error) {
            next(error);
        }
    }

    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static getContentByIdFull = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let article = await Article.findByPk(req.body.id);
            if (article)
                if (article.cathegory=="blog") {
                    next( new HttpException(400, "Content loading cannot ask for blog article", null))
                } else {
                    res.json(article);
                }
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static getContentByIdFullChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            Middleware.validate()
        ]
    }

    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static getBlogByIdFull = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let article = await Article.findByPk(req.body.id);
            if (article)
                if (article.cathegory!="blog") {
                    next( new HttpException(400, "Blog loading cannot ask for content article", null))
                } else {
                    res.json(article);
                }
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static getBlogByIdFullChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            Middleware.validate()
        ]
    }


    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static updateContent = async (req: Request, res: Response, next:NextFunction) => {
        try {
            console.log(req.body);
            let result = [];
            let article = await Article.findByPk(req.body.article.id);
            //TODO::Update here image if required
            if (article)
                if (article.cathegory=="blog") {
                    next( new HttpException(400, "Content loading cannot ask for blog article", null))
                } else {
                    for (let translation of article.translations) {
                        let data : ArticleTranslation = req.body.article.translations.find( (obj:ArticleTranslation) => obj.iso ==  translation.iso);
                        if (data) {
                            if (data.content)
                                translation.content = data.content;
                            if (data.title)
                                translation.title = data.title;
                            if (data.description)
                                translation.description = data.description;                                
                            translation.save();
                        }
                    }
                    article.translations = req.body.article.translations;
                    //let result = await article.save();
                    res.json(await Article.findByPk(req.body.article.id));
                }
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static updateContentChecks() {
        return [
            body('article').exists().withMessage('exists'),
            body('article.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            body('article.translations').exists().withMessage('exists'),
            //TODO: Add here all required checks !!!

            Middleware.validate()
        ]
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