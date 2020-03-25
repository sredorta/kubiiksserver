import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/config';
import {messages} from '../middleware/common';
import { Email } from '../models/email';
import { Alert } from '../models/alert';
import { User } from '../models/user';
import { Role } from '../models/role';
import { Helper } from '../classes/Helper';

import {sockets} from '../server';
import { AlertTranslation } from '../models/alert_translation';


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
            let recipients = [];
            recipients.push(req.body.email);
            let messagesAll = Helper.translations();
            //We add element in the alerts table and we send onPush to admins
            //Find all admin users and add alert
            let myUsers = await User.scope("fulldetails").findAll({include: [{model:Role, where: {name: "admin"}}]});
            for (let myUser of myUsers) {
                let myAlert = await Alert.create({userId:myUser.id, type:"email", title:null,  message:req.body.subject + '\n' + req.body.message, isRead:false});
                if (!myAlert) throw Error("Could not create alert");
                for (let iso of Middleware.languagesSupported()) {
                    await AlertTranslation.create({alertId:myAlert.id,iso:iso,title:messagesAll[iso].notificationContactEmail,message:req.body.subject + '\n' + req.body.message})
                }
                //Send push notif to all admins !!!
                await myUser.notify(messagesAll[myUser.language].notificationContactEmail, req.body.subject + '\n' + req.body.message);
            }

            //Now we send and email to thank the contact
            console.log("SENDING EMAIL TO", recipients)
            let result = await Email.send(res.locals.language, 'contact-reply', 'RE:' + req.body.subject, recipients,{});
            res.send({message: {show:true, text:messages.messageSent}});

        } catch(error) {
            console.log(error);
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