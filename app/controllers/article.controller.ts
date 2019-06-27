import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import { CustomValidators } from '../classes/CustomValidators';
import sequelize from 'sequelize';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import { Article } from '../models/article';
import { ArticleTranslation } from '../models/article_translation';
import { User } from '../models/user';



export class ArticleController {

    constructor() {}

    /**Gets all articles for all cathegories, admin or blog rights required */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let articles = await Article.findAll({order: [sequelize.literal('id DESC')]});
            for (let article of articles) result.push(article.sanitize(res.locals.language));
            res.json(result);
        } catch(error) {
            next(error);
        }
    }







    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static getByIdFull = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let article = await Article.findByPk(req.body.id);
            if (article) 
                    res.json(article);
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static getByIdFullChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            Middleware.validate()
        ]
    }


    /**Deletes article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static delete = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let article = await Article.findByPk(req.body.id);
            let myUser = await User.scope("withRoles").findByPk(req.user.id);            
            if (article && myUser) {
                if (article.cathegory=="content") {
                    return next(new HttpException(403, messages.articleContentNotDelete, null));
                }
                if (article.cathegory=="blog" && !(myUser.hasRole("blog") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('blog'), null));
                }
                if (!(article.cathegory=="blog") && !(myUser.hasRole("content") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('content'), null));
                }
                await article.destroy();
                res.send({message: {show:true,text:messages.articleDelete}}); 
            }
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static deleteChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            Middleware.validate()
        ]
    }    

    /**Creates article content on the given cathegory. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static create = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let myUser = await User.scope("withRoles").findByPk(req.user.id);            
            if (myUser) {
                if (req.body.cathegory=="content") {
                    return next(new HttpException(403, messages.articleContentNotCreate, null));
                }
                if (req.body.cathegory=="blog" && !(myUser.hasRole("blog") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('blog'), null));
                }
                if (!(req.body.cathegory=="blog") && !(myUser.hasRole("content") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('content'), null));
                }
                let myArticle = await Article.create({
                    cathegory: req.body.cathegory
                });
                if (myArticle) {
                    for (let lang of Middleware.languagesSupported()) {
                        await ArticleTranslation.create({
                            'iso': lang,
                            'articleId': myArticle.id,
                            'title': messages.articleNewTitle,
                            'description': messages.articleNewDescription,
                            'content': messages.articleNewContent
                        });
                    } 
                }
                res.json(await Article.findByPk(myArticle.id));                
            }
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static createChecks() {
        return [
            body('cathegory').exists().withMessage('exists').not().isEmpty(),
            Middleware.validate()
        ]
    }

    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let article = await Article.findByPk(req.body.article.id);
            if (!article) return new Error("Could not find article with id : " + req.body.article.id);
            let trans = article.translations.find(obj => obj.iso == res.locals.language);
            if (!trans) return new Error("Could not find article translation with iso : " + res.locals.language);
            let myUser = await User.scope("withRoles").findByPk(req.user.id);   
            if (!myUser) return new Error("Could not find current user !");    
            //Protection rights     
                if (article.cathegory=="blog" && !(myUser.hasRole("blog") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('blog'), null));
                }
                if (!(article.cathegory=="blog") && !(myUser.hasRole("content") || myUser.hasRole("admin"))) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('content'), null));
                }
                if (article.cathegory=="content" && !myUser.hasRole("kubiiks")) {
                    return next(new HttpException(403, messages.authTokenInvalidRole('kubiiks'), null));
                }
            //update part    
                article.public = req.body.article.public;
                article.backgroundImage = req.body.article.backgroundImage;
                article.image = req.body.article.image;
                await article.save();
                trans.title = req.body.article.title;
                trans.description = req.body.article.description;
                trans.content = req.body.article.content;
                await trans.save();
                article = await Article.findByPk(req.body.article.id);
                if (!article) return new Error("Unexpected error !");
                res.json(article.sanitize(res.locals.language));

        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static updateChecks() {
        return [
            body('article').exists().withMessage('exists'),
            body('article.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            body('article.content').exists().withMessage('exists'),
            body('article.title').exists().withMessage('exists'),
            body('article.description').exists().withMessage('exists'),
            body('article.image').exists().withMessage('exists'),
            body('article.backgroundImage').exists().withMessage('exists'),
            body('article.public').exists().withMessage('exists').isBoolean(),

            //TODO: Add here all required checks !!!

            Middleware.validate()
        ]
    }

}        