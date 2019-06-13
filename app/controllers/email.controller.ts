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
             console.log(req.body.email);
             for (let trans of myEmail.translations) {
                 await trans.save();
             }
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
    /**Creates email template based on reference. Admin or content required */
    static create = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let myReferenceEmail = await Email.findOne({where:{name:"reference"}});
            if (!myReferenceEmail) 
                return next(new HttpException(500, "Reference email not found", null));
            //Update the name
            let myRef =  JSON.parse(JSON.stringify(myReferenceEmail));
            delete myRef.id;
            delete myRef.createdAt;
            delete myRef.updatedAt;
            myRef.isProtected = false;
            myRef.name = req.body.data.name;
            let myNewEmail = await Email.create(myRef);
            for (let trans of myReferenceEmail.translations) {
                let myTrans = JSON.parse(JSON.stringify(trans));
                delete myTrans.id;
                myTrans.emailId = myNewEmail.id;
                myTrans.description = req.body.data.description[trans.iso];
                await EmailTranslation.create(myTrans)
            }
            res.json(await Email.findByPk(myNewEmail.id));                
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static createChecks() {
        return [
            body('data').exists().withMessage('exists'),
            body('data.name').exists().withMessage('exists').isLength({min:5}),
            body('data.name').exists().withMessage('exists').custom(CustomValidators.dBMissing(Email,'name')),
            body('data.description').exists().withMessage('exists'),
            body('data.description.*').isLength({min:5,max:200}),
            Middleware.validate()
        ]
    }

    /**Deletes email template by id with all translations. Admin or content required */
    static delete = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let email = await Email.findByPk(req.body.id);
            if (!email) 
                return next(new HttpException(500, "Email template could not be found", null));
            if (email.isProtected == true)
                return next(new HttpException(400, messages.emailDeleteProtected, null));
            await email.destroy();
            res.send({message: "success"}); 
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static deleteChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Email,'id')),
            Middleware.validate()
        ]
    }    


}