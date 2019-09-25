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


    /**Update value with translations if required, we expect object with id,default, fr,en... */
    static update = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let mySetting = await Setting.scope("full").findByPk(req.body.setting.id);
            if (!mySetting) throw new Error("Setting not found");
            if (!mySetting.hasTranslations()) {
                mySetting.value = req.body.setting.value;
                await mySetting.save();
            } else {
                let myTrans = mySetting.translations.find(obj => obj.iso == res.locals.language);
                if (!myTrans) {
                    myTrans = await SettingTranslation.create({settingId:mySetting.id, iso:res.locals.language, value:""});  
                    //throw new Error("Translation not found for lang : " + res.locals.language);
                }
                myTrans.value =  req.body.setting.value;
                await myTrans.save();
                mySetting = await Setting.scope("full").findByPk(req.body.setting.id);
                if (!mySetting) throw new Error("Setting not found");
            }
            res.json(mySetting.sanitize(res.locals.language));

        } catch(error) {
            next(new HttpException(500, error.message, error.errors));    
        }

    }
    //We expect following format
    //  {lang:<SettingId>, value:<SettingValue>
    /**Update checks */
    static updateChecks() {
        return [
            body('setting.id').exists().withMessage('exists').isNumeric().custom(CustomValidators.dBExists(Setting,'id')),
            body('setting.key').exists().withMessage('exists'),
            body('setting.value').exists().withMessage('exists'),
            Middleware.validate()
        ]
    }


}