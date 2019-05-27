import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';



export class ContactController {

    constructor() {}

    static sendEmail = async (req: Request, res: Response, next:NextFunction) => {
        const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
        let myEmail = {
            from: AppConfig.emailSmtp.sender,
            replyTo: req.body.email,
            to: AppConfig.emailSmtp.sender,
            subject: req.body.subject,
            text: req.body.message,
            html: req.body.message
        }
                     
        transporter.sendMail(myEmail).then(result => {
            res.send({message: {show:true, text:messages.messageSent}});  
        }).catch(error => {
            console.log(error);
            next(new HttpException(500, messages.authEmailSentError,null));
        });
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