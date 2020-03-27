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
import  webPush from 'web-push';
import { Onpushsession } from '../models/onpushsession';



export class NotificationController {

    constructor() {}

/*    { endpoint:
        'https://fcm.googleapis.com/fcm/send/fOK6nR2vlOI:APA91bGWatgiN_xF68Gmzw9lp08AYESkGs5mufMICSpjo3Sw8yeo-tfuOAddfXRtVwdvOhxorEvPaSGT5rmuqEeLdt_Catnksnz7dzhNVtTuJhQwXKvqh61DYQ8_rZlJTSCLFvTh22Mx',
       expirationTime: null,
       keys:
        { p256dh:
           'BJ1reVZ1K_ftQ0orM5WT7LF4hJR18UxuaqPcClNarRSNJjhNrO3OJxoS40LEwZlSLHOlhXMZ3bh2Q3RL5M9jUms',
          auth: 'V5ppfPw6EsP6t7cxcVpr8A' } }
          */

    /**Gets the onPush notification settings and stores it in the user */
    static settingsUser  = async (req: Request, res: Response, next:NextFunction) => {
        try {
            //Add notification data to user if we are loggedin
            if(req.user) {
                let myUser = await User.scope("full").findByPk(req.user.id);
                if (!myUser) throw new Error("Cannot find auth user !");
                myUser.onPush = JSON.stringify(req.body.onPush);
                await myUser.save();
            }
            res.json(true);
        } catch(error) {
            next(error);
        }
    }
    /** Validation for settingsUser*/
    static settingsUserChecks() {
        return [
            body('onPush.endpoint').exists().withMessage('exists').isURL(),
            body('onPush.keys').exists().withMessage('exists'),
            body('onPush.keys.p256dh').exists().withMessage('exists').isString().isLength({min:80}),
            body('onPush.keys.auth').exists().withMessage('exists').isString().isLength({min:15}),
            Middleware.validate()
        ]
    } 


    /**Gets the onPush notification settings and stores it in the user */
    static settingsSession  = async (req: Request, res: Response, next:NextFunction) => {
            try {
                //Add notification data to notifications table
                let notif = await Onpushsession.findOne({where:{session:req.body.session}});
                if (!notif) {
                    await Onpushsession.create({session:req.body.session, language:res.locals.language, onPush: JSON.stringify(req.body.onPush)})
                } else {
                    //Update language
                    notif.language = res.locals.language;
                    await notif.save();
                }
                res.json(true);
            } catch(error) {
                next(error);
            }
    }
    /** Validation for settingsSession */
    static settingsSessionChecks() {
            return [
                body('session').exists().withMessage('exists').isString().isLength({min:8}),
                body('onPush.endpoint').exists().withMessage('exists').isURL(),
                body('onPush.keys').exists().withMessage('exists'),
                body('onPush.keys.p256dh').exists().withMessage('exists').isString().isLength({min:80}),
                body('onPush.keys.auth').exists().withMessage('exists').isString().isLength({min:15}),
                Middleware.validate()
            ]
    } 

}
