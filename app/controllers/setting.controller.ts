import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
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
        console.log("Language currently being asked is: " + res.locals.language);
        console.log("Language currently being asked is: " + req.user.language);

        Setting.findAll().then((settings)=> {
            let result : any[] = [];
            let myValue : string = "";
            let mySettingTranslation : SettingTranslation | undefined;
            //Here we translate if required and always provide translated version
            for (let setting of settings) {
               myValue = setting.value; 
               if (setting.translations.length>0) {
                   mySettingTranslation = setting.translations.find(obj => obj.iso == res.locals.language);
                   if (mySettingTranslation) {
                        myValue = mySettingTranslation.value;
                   } else
                        myValue = setting.value;
               }
               result.push({id:setting.id,key:setting.key,type:setting.type,value:myValue})
            }            
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    /**Get setting by key */
    static getByKey = async (req: Request, res: Response, next:NextFunction) => {
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
    }   

    /**getByKey parameter checking */
    public static getByKeyChecks() {
        return [
            body('key').exists().withMessage('exists').isString(),
            Middleware.validate()
        ]
    }

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