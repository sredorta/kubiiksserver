import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import { Email } from '../models/email';



export class ContactController {

    constructor() {}

    static sendEmail = async (req: Request, res: Response, next:NextFunction) => {
        try {
            const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
            let myEmail = {
                from: AppConfig.emailSmtp.sender,
                replyTo: req.body.email,
                to: AppConfig.emailSmtp.sender,
                subject: req.body.subject,
                text: req.body.message,
                html: req.body.message
            }
                         
            await transporter.sendMail(myEmail);
            res.send({message: {show:true, text:messages.messageSent}});
            let recipients = [];
            recipients.push(req.body.email);

            //Now we send and email to thank the contact
            let result = await Email.send(res.locals.language, 'contact-reply', 'RE:' + req.body.subject, recipients, req.body.message);
            console.log("RESULT IS EMAIL.SEND !!!!!!!!!!!!!!!!!!!!!!!!!!!");
            console.log(result);
        } catch(error) {
            next(new HttpException(500, messages.emailSentError,null));
        }        
        //TODO: PUSH NOTIFICATION TO ADMIN USERS !!!!
       
    }
    /**Parameter validation */
    static sendEmailChecks() {
        return [
            body('email').exists().withMessage('exists').isEmail(),
            body('subject').exists().withMessage('exists').isString().isLength({min:5}).withMessage("minlength"),
            body('message').exists().withMessage('exists').isString().isLength({min:5}).withMessage("minlength"),
            Middleware.validate()
        ]
    }
}        