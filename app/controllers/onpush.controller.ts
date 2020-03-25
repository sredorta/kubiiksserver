import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { Onpush } from '../models/onpush';
import { AppConfig } from '../utils/config';
import { Helper } from '../classes/Helper';
import { OnpushTranslation } from '../models/onpush_translation';
import { User } from '../models/user';
import { Onpushsession } from '../models/onpushsession';

export class OnpushController {

    /**Gets all alerts of the user */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
            try {
                let result = [];
                let myOnpush = await Onpush.scope("full").findAll();
                for (let onpush of myOnpush) {
                    result.push(onpush.sanitize(res.locals.language));
                }
                res.json(result);
            } catch(error) {
                next(error);
            }
    }
    /**Creates new onpush notification template. Admin or notification required */
    static create = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let myNewNotif = await Onpush.create({name:req.body.name});
            let messagesAll = Helper.translations();
            if (myNewNotif) {
                for (let lang of Middleware.languagesSupported()) {
                    await OnpushTranslation.create({
                        'iso': lang,
                        'onpushId': myNewNotif.id,
                        'description': req.body.description,
                        'title': messagesAll[lang].notificationNewTitle,
                        'body' : messagesAll[lang].notificationNewBody,
                    });                        
                } 
            }

            let result = await Onpush.findByPk(myNewNotif.id);
            if (!result) return next(new HttpException(500, "Result not found", null));
            res.json(result.sanitize(res.locals.language));                
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static createChecks() {
        return [
            body('name').exists().withMessage('exists').isLength({min:5,max:100}),
            body('name').exists().withMessage('exists').custom(CustomValidators.dBMissing(Onpush,'name')),
            body('description').exists().withMessage('exists').isLength({min:5,max:500}),
            Middleware.validate()
        ]
    }

    /**Deletes notification template by id with all translations. Admin or notification required */
    static delete = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let notif = await Onpush.findByPk(req.body.id);
            if (!notif) 
                return next(new HttpException(500, "Email template could not be found", null));
            await notif.destroy();
            res.send({message: "success"}); 
        } catch(error) {
            next(error);
        }
    }
    /**Parameter validation */
    static deleteChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Onpush,'id')),
            Middleware.validate()
        ]
    }  


    /**Update the notification with the language */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            //
            let myNotif = await Onpush.scope("full").findByPk(req.body.notification.id);
            if (!myNotif) throw new Error("Notification not found");
            let myTrans = myNotif.translations.find(obj => obj.iso == res.locals.language);
            if (!myTrans) throw new Error("Translation not found");
            myTrans.title =  req.body.notification.title;
            myTrans.body = req.body.notification.body;
            await myTrans.save();
            myNotif = await Onpush.scope("full").findByPk(req.body.notification.id);
            if (!myNotif) throw new Error("Notification not found");
            res.json(myNotif.sanitize(res.locals.language));

        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        }

    }
    /**Update checks */
    static updateChecks() {
        return [
            body('notification.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Onpush,'id')),
            body('notification.title').exists().withMessage('exists').isLength({min:5,max:100}),
            body('notification.description').exists().withMessage('exists').isLength({min:5,max:500}),
            Middleware.validate()
        ]
    }

    /**Sends notification to the required recipients*/
    static send = async (req: Request, res: Response, next:NextFunction) => {
        //TODO: Get post parameter of template email, additionalHTML
        try {
            if (!req.user) throw new Error("User not found");
            let myUser = await User.scope("full").findByPk(req.user.id);
            if (!myUser) throw new Error("User not found");
            let myNotif = await Onpush.findByPk(req.body.notification.id);
            if (!myNotif) throw new HttpException(500, messages.validationDBMissing('notification'),null); 
            //When self is checked
            //let myNotifTrans = null;
            if (req.body.options == "self") {
                let iso = myUser.language;
                let myNotifTrans = myNotif.translations.find(obj=> obj.iso == iso);
                if (myNotifTrans) {
                    await myUser.notify(myNotifTrans.title,myNotifTrans.body);
                }
            } else if(req.body.options == 'users') {
                let users = await User.scope("full").findAll();
                for (let user of users) {
                    let iso = user.language;
                    let myNotifTrans = myNotif.translations.find(obj=> obj.iso == iso);
                    if (myNotifTrans)
                        await user.notify(myNotifTrans.title,myNotifTrans.body);
                }
            } else if(req.body.options == 'all') {
                let sessions = await Onpushsession.findAll();
                for (let session of sessions) {
                    let iso = session.language;
                    let myNotifTrans = myNotif.translations.find(obj=> obj.iso == iso);
                    if (myNotifTrans)
                        await session.notify(myNotifTrans.title,myNotifTrans.body);
                }
            }

            res.send({message: {show:true, text:messages.notificationSendOk}});  
        } catch (error) {
            next(new HttpException(500, messages.emailSentError,null));

        }
    }
   /**Parameter validation */
   static sendChecks() {
        return [
            body('notification').exists().withMessage('exists'),
            body('notification.id').exists().withMessage('exists').custom(CustomValidators.dBExists(Onpush,'id')),
            body('options').exists().withMessage('exists').isString(),
            Middleware.validate()
        ]
    }    


}