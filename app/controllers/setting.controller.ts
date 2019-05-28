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




export class SettingController {

    /**Get all shared settings with the current language translation*/
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        /*try {
          res.json(await Setting.findAll());
        } catch (error) {
            next(new HttpException(500, error.message, error.errors));
        }*/
        Setting.findAll().then((settings)=> {
            let result : any[] = [];
            for (let setting of settings) {
                result.push(setting.sanitize(res.locals.language))
            }   
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    /**Get all shared settings with all translations*/
    static getAllFull = async (req: Request, res: Response, next:NextFunction) => {
        Setting.scope("full").findAll().then((settings)=> {
            let result : any[] = [];
            for (let setting of settings) {
                result.push(setting.sanitize(res.locals.language,"full"))
            }          
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    /**Get one setting with all translations*/
    static getFieldFull = async (req: Request, res: Response, next:NextFunction) => {
        let query :any =  {};
        query['key'] = req.body.key;
        Setting.scope("full").findOne({where:query}).then((setting)=> {
            if (setting)
                setting.sanitize(res.locals.language,"full");        
            res.json(setting);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }
    /**Get one full field checks */
    static getFieldFullChecks() {
        let myValidationArray = [];
        myValidationArray.push(body('key').exists().withMessage('exists').custom(CustomValidators.dBExists(Setting,"key")));
        myValidationArray.push(Middleware.validate());
        return myValidationArray;
    }


    /**Update value with translations if required, we expect object with id,default, fr,en... */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let mySetting = await Setting.scope("full").findByPk(req.body.id);
            if (!mySetting) throw new Error("Setting not found");
            if (mySetting) {
                mySetting.value = req.body.value;
                mySetting = await mySetting.save();
            }
            //Update now the Translations if any
            for (let trans of req.body.translations) {
                let myTrans = await mySetting.translations.find(obj => obj.id == trans.id);
                if (!myTrans) throw new Error("Translation not found");
                myTrans.value = trans.value;
                await myTrans.save();
            }
            //Return result with message so that we can show in the ui saved action
            res.json({setting:mySetting.sanitize(res.locals.language,"full"), message: {show:true, text:messages.saved}}); 
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        }

    }
    //We expect following format
    //  {id:<SettingId>, value:<SettingValue>, translations:[{id:<SettingTranslationId>,value:<SettingTranslationValue},...]}
    /**Update checks */
    static updateChecks() {
        let myValidationArray = [];
        myValidationArray.push(body('id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Setting,"id")));
        myValidationArray.push(body('value').exists().withMessage('exists'));
        myValidationArray.push(body('translations').exists().withMessage('exists').isArray());
        myValidationArray.push(body('translations.*.id').isNumeric().custom(CustomValidators.dBExists(SettingTranslation,"id")));
        myValidationArray.push(body('translations.*.value').exists().withMessage('exists'));
        myValidationArray.push(Middleware.validate());
        return myValidationArray;
    }

    /**Get setting by key */
/*    static getByKey = async (req: Request, res: Response, next:NextFunction) => {
        const key = req.body.key;
        Setting.findOne({
            where: {
                "key": key
            }
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }   */

    /**getByKey parameter checking */
/*    public static getByKeyChecks() {
        return [
            body('key').exists().withMessage('exists').isString(),
            Middleware.validate()
        ]
    }*/

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



}