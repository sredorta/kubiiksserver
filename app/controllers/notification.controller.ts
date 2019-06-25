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
import { Setting } from '../models/setting';
import  webPush from 'web-push';



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

    /**Gets all data required for app initialization in one shot */
    static get = async (req: Request, res: Response, next:NextFunction) => {
        try {
            const subscription = req.body.notification;
            console.log(`Subscription received`);
            console.log(subscription);
            res.status(200).json(subscription);
            //Test of sending back notif
            const payload = JSON.stringify({
                notification: {
                  title: 'Test de notification',
                  body: 'Ça cest un test de notifications through Angular with this article!',
                  icon: 'https://www.shareicon.net/data/256x256/2015/10/02/110808_blog_512x512.png',
                  vibrate: [100, 50, 100],
                  action:"test",
                  data: {
                    url: 'https://medium.com/@arjenbrandenburgh/angulars-pwa-swpush-and-swupdate-15a7e5c154ac'
                  }
                }
              });
            webPush.sendNotification(subscription,payload);

        } catch(error) {
            next(error);
        }
    }
    /** Role attach parameter validation */
    static getChecks() {
        return [
            body('notification').exists().withMessage('exists'),
            body('notification.endpoint').exists().withMessage('exists').isURL().contains('https://fcm.googleapis.com/fcm/send'),
            body('notification.expirationTime').exists().withMessage('exists'),
            body('notification.keys').exists().withMessage('exists'),
            body('notification.keys.p256dh').exists().withMessage('exists').isLength({min:80}),
            body('notification.keys.auth').exists().withMessage('exists').isLength({min:15}),
            Middleware.validate()
        ]
    }    

}
