import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';

import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {AppConfig} from '../utils/Config';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { User } from '../models/user';
import { SettingTranslation } from '../models/setting_translation';
import pug from 'pug';
import path from 'path';
import { Article } from '../models/article';
import htmlToText from 'html-to-text';
import InlineCss from 'inline-css';
import { IsPhoneNumber } from 'class-validator';
import { Email } from '../models/email';
import { EmailTranslation } from '../models/email_translation';

export class EmailController {
    /**Email transporter check */
    public static emailCheck = async (req: Request, res: Response, next:NextFunction) => {
        const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
        let myResult = {
            host: AppConfig.emailSmtp.host,
            port: AppConfig.emailSmtp.port,
            secure: AppConfig.emailSmtp.secure,
            sender: AppConfig.emailSmtp.sender,
            verification: ""
        }
        transporter.verify(function(error, success) {
            if (error) 
                 myResult.verification = "error";
            else 
                myResult.verification = "success";
            res.send(myResult);
         });
    }

    /**Gets all email templates */
    public static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            res.json(await Email.findAll());
        } catch(error) {
            next(error);
        }
    }

    /**Returns the html of the current email in all languages for previewing*/
    public static preview = async (req: Request, res: Response, next:NextFunction) => {
        try {
            //Build an email model without saving so that we can use for preview
            let result :any = {};
            let myEmail = Email.build(req.body.email, {
                isNewRecord: false,
                include: [EmailTranslation]
             });
            if (!myEmail) throw new HttpException(500, messages.validationDBMissing('email'),null);           
            for (let lang of Middleware.languagesSupported()) {
                result[lang] = await myEmail.getHtml(lang); 
            }
            res.json(result);
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static previewChecks() {
        return [
            body('email.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Email,'id')),
            Middleware.validate()
        ]
    }    

    /**Updates email template */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            console.log(req.body.email);
            let myEmail = Email.build(req.body.email, {
                isNewRecord: false,
                include: [EmailTranslation]
             });
             if (!myEmail) throw new HttpException(500, messages.validationDBMissing('email'),null);           
            myEmail = await myEmail.save();

            res.json(myEmail);
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static updateChecks() {
        return [
            body('email').exists().withMessage('exists'),
            body('email.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Email,'id')),
            body('email.translations').exists().withMessage('exists'),
            //TODO: Add here all required checks !!!

            Middleware.validate()
        ]
    }    

    /**Sends email */
    static send = async (req: Request, res: Response, next:NextFunction) => {
        //TODO: Get post parameter of template email, additionalHTML
        try {
            let myUser = await User.findByPk(req.user.id);
            if (!myUser) return next(new HttpException(500, messages.validationDBMissing('user'),null));
            let myEmail = Email.build(req.body.email, {
                isNewRecord: false,
                include: [EmailTranslation]
             });
            if (!myEmail) return next(new HttpException(500, messages.emailSentError,null));

            let html = await myEmail.getHtml(res.locals.language, '<p> -- TEST EMAIL -- </p>');
            console.log(html);
            if (!html)  return next(new HttpException(500, messages.emailSentError,null));
            const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
            let myEmailT = {
                            from: AppConfig.emailSmtp.sender,
                            to: myUser.email,
                            subject: "TEST EMAIL",
                            text: htmlToText.fromString(html),
                            html: html
            }
            console.log("text:");
            console.log(htmlToText.fromString(html));
            await transporter.sendMail(myEmailT);
            res.send({message: {show:true, text:messages.emailSentOk(myUser.email)}});  
        } catch (error) {
            next(new HttpException(500, messages.emailSentError,null));

        }
    }
   /**Parameter validation */
   static sendChecks() {
    return [
        body('email').exists().withMessage('exists'),
        body('email.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Email,'id')),
        body('email.translations').exists().withMessage('exists'),
        //TODO: Add here all required checks !!!

        Middleware.validate()
    ]
    }    

/*    static emailShow = async (req: Request, res: Response, next:NextFunction) => {
        //Generate email html
        try {
            let myEmail = await Email.findOne({where:{name:"validate-email"}});
            if (!myEmail) return next(new HttpException(500, messages.emailSentError,null));
            let html = await myEmail.getHtml(res.locals.language, '<p>Validate your email by clicking to the following <a href="/test">link</a></p>');
            console.log(html);
            res.send(html);
        } catch (error) {
            next(new HttpException(500, messages.emailSentError,null));

        }
    }*/
}