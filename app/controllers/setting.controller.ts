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



    /**Gets all articles for all cathegories, admin or blog rights required */
/*    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let articles = await Article.findAll({order: [sequelize.literal('id DESC')]});
            for (let article of articles) result.push(article.sanitize(res.locals.language,"full"));
            res.json(result);
        } catch(error) {
            next(error);
        }
    }*/

    /**Gets article by id with all translations. Admin or content required (if cathegory not blog) or admin or blog required (if cathegory blog) */
/*    static getByIdFull = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let article = await Article.findByPk(req.body.id);
            if (article) 
                    res.json(article);
        } catch(error) {
            next(error);
        }
    }*/
    /**Parameter validation */
/*    static getByIdFullChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(Article,'id')),
            Middleware.validate()
        ]
    }*/


export class SettingController {

    /**Get all settings with the current language translation if setting has translations*/
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let settings = await Setting.findAll();
            for (let setting of settings) result.push(setting.sanitize(res.locals.language));
            res.json(result);
        } catch(error) {
            next(error);
        }
    }

    /**Get all shared settings with all translations*/
    static getAllFull = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let result = [];
            let settings = await Setting.scope("full").findAll();
            for (let setting of settings) result.push(setting.sanitize(res.locals.language,"full"));
            res.json(result);
        } catch(error) {
            next(error);
        }        
    }

    /**Get one setting with all translations*/
    static getFieldFull = async (req: Request, res: Response, next:NextFunction) => {
        let query :any =  {};
        query['key'] = req.body.key;
        try {
            let setting = await Setting.scope("full").findOne({where:query});
            if (setting) 
                res.json(setting);
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
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
            mySetting = await Setting.scope("full").findByPk(req.body.id);
            if (mySetting) {
                res.json(mySetting);
            } 
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


    /**Update content type setting. Requires 'content' rights */
 /*   static updateContent = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let mySetting = await Setting.scope("full").findByPk(req.body.id);
            if (!mySetting) throw new Error("Setting not found");
            if (mySetting) {
                if (mySetting.type != "content") {
                    throw new Error(messages.authTokenInvalidRole('admin'));
                }
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

    }*/
   /**UpdateContent checks */
/*    static updateContentChecks() {
        let myValidationArray = [];
        myValidationArray.push(body('id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Setting,"id")));
        myValidationArray.push(body('value').exists().withMessage('exists'));
        myValidationArray.push(body('translations').exists().withMessage('exists').isArray());
        myValidationArray.push(body('translations.*.id').isNumeric().custom(CustomValidators.dBExists(SettingTranslation,"id")));
        myValidationArray.push(body('translations.*.value').exists().withMessage('exists'));
        myValidationArray.push(Middleware.validate());
        return myValidationArray;
    }*/

    /**Update blog type setting. Requires 'blog' rights */
/*    static updateBlog = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let mySetting = await Setting.scope("full").findByPk(req.body.id);
            if (!mySetting) throw new Error("Setting not found");
            if (mySetting) {
                if (mySetting.type != "blog") {
                    throw new Error(messages.authTokenInvalidRole('admin'));
                }
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

    }*/
    //We expect following format
    //  {id:<SettingId>, value:<SettingValue>, translations:[{id:<SettingTranslationId>,value:<SettingTranslationValue},...]}
    /**Update checks */
/*    static updateBlogChecks() {
        let myValidationArray = [];
        myValidationArray.push(body('id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Setting,"id")));
        myValidationArray.push(body('value').exists().withMessage('exists'));
        myValidationArray.push(body('translations').exists().withMessage('exists').isArray());
        myValidationArray.push(body('translations.*.id').isNumeric().custom(CustomValidators.dBExists(SettingTranslation,"id")));
        myValidationArray.push(body('translations.*.value').exists().withMessage('exists'));
        myValidationArray.push(Middleware.validate());
        return myValidationArray;
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