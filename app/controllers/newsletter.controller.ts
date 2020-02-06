import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { Newsletter } from '../models/newsletter';




export class NewsletterController {

    /**Gets all available emails of the newsletter */
    static subscribe = async(req: Request, res: Response, next: NextFunction) => {  
        try {
            let news = await Newsletter.findOne({where:{email:req.body.email}});
            if (news) {
                res.send({message: {show:true, text:messages.newsletterSubscribed}});
            } else {
                await Newsletter.create({firstName:req.body.firstName,lastName:req.body.lastName,email:req.body.email,language:res.locals.language});
                res.send({message: {show:true, text:messages.newsletterSubscribed}});
            }
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
    }

    /** Role attach parameter validation */
    static subscribeChecks() {
        return [
            body('email').exists().withMessage('exists').isEmail().isLength({max:128}),
            body('firstName').exists().withMessage('exists').isString().isLength({min:2,max:100}),
            body('lastName').exists().withMessage('exists').isString().isLength({min:2,max:100}),

            Middleware.validate()
        ]
    }    

    /**Gets all available emails of the newsletter */
    static unsubscribe = async(req: Request, res: Response, next: NextFunction) => {  
        try {
            let news = await Newsletter.findOne({where:{email:req.body.email}});
            if (!news) {
                res.status(400).send({message: messages.newsletterMissing});
            } else {
                await news.destroy();
                res.send({message: {show:true, text:messages.newsletterUnsubscribed}});
            }
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
    }
    /** Role attach parameter validation */
    static unsubscribeChecks() {
        return [
            body('email').exists().withMessage('exists').isEmail(),
            Middleware.validate()
        ]
    } 
}