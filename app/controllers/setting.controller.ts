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

    /**Email testing for now */
    static emailSend = async (req: Request, res: Response, next:NextFunction) => {
        //Generate email html
        try {
            let myHeader = await Article.getEmailPart("header", res.locals.language);
            let myFooter = await Article.getEmailPart("footer", res.locals.language);
            let myUser = await User.scope("withRoles").findByPk(req.user.id);
            if (!myUser) return next(new HttpException(500, messages.validationDBMissing('user'),null))
            const link = AppConfig.api.host + ":"+ AppConfig.api.port + "/test";
            let html = pug.renderFile(path.join(__dirname, "../emails/validation."+ res.locals.language + ".pug"), {title:AppConfig.api.appName,header: myHeader,footer:myFooter,validationLink: link});
            //CSS must be put inline for better support of all browsers
            html =  await InlineCss(html, {extraCss:"",applyStyleTags:true,applyLinkTags:true,removeStyleTags:true,removeLinkTags:true,url:"filePath"});
            const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
            let myEmail = {
                            from: AppConfig.emailSmtp.sender,
                            to: myUser.email,
                            subject: messages.authEmailValidateSubject(AppConfig.api.appName),
                            text: htmlToText.fromString(html),
                            html: html
            }
            console.log(html);
            console.log("text:");
            console.log(htmlToText.fromString(html));
            await transporter.sendMail(myEmail);
            res.send({message: {show:true, text:messages.authEmailValidate(myUser.email)}});  

        } catch (error) {
            next(new HttpException(500, messages.authEmailSentError,null));

        }
    }
    static emailShow = async (req: Request, res: Response, next:NextFunction) => {
        //Generate email html
        res.locals.language = "fr";
        try {
            //Typically this will come from an article content but in some cases might have been hard coded, like reset password,validation link...

            let content = "<h1>Test of content</h1><p>Try to go to this <a href='test'>nice link</a>";

            let myArticle = await Article.findOne({where:{key:"email-header"}});
            if (!myArticle) return next(new HttpException(500, messages.authEmailSentError,null));
            let header = myArticle.sanitize(res.locals.language,"full");
            header.image = myArticle.getImage();
            header.backgroundImage = myArticle.getBackgroundImage();

            //Get phone from settings
            let tmp = await Setting.findOne({where:{key:"companyPhone"}});
            if (!tmp) return next(new HttpException(500, messages.authEmailSentError,null));
            let phone = tmp.value;
            //Get address from settings
            tmp = await Setting.findOne({where:{key:"companyAddress"}});
            if (!tmp) return next(new HttpException(500, messages.authEmailSentError,null));
            let address = tmp.value.split(";");
            //Get site address
            tmp = await Setting.findOne({where:{key:"url"}});
            if (!tmp) return next(new HttpException(500, messages.authEmailSentError,null));
            let url = tmp.value;

            let icons :any = {};
            let links: any = {};
            icons["phone"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/phone.png";
            icons["address"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/address.png";
            icons["facebook"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/facebook.png";
            icons["instagram"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/instagram.png";
            icons["twitter"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/twitter.png";
            icons["linkedin"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/linkedin.png";
            icons["youtube"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/youtube.png";
            icons["google"] = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/google.png";
            links["facebook"] = await Setting.findOne({where:{key:"linkFacebook"}});
            links["instagram"] = await Setting.findOne({where:{key:"linkInstagram"}});
            links["twitter"] = await Setting.findOne({where:{key:"linkTwitter"}});
            links["linkedin"] = await Setting.findOne({where:{key:"linkLinkedin"}});
            links["youtube"] = await Setting.findOne({where:{key:"linkYoutube"}});
            links["google"] = await Setting.findOne({where:{key:"linkGoogleplus"}});
            let myValue : string = "";
            let socialLinks : any = {};
            Object.keys(links).forEach(key => {
                if (links[key].value)
                    myValue = links[key].value;
                    if (myValue != "") {
                        socialLinks[key] = links[key].value;
                    }
            })
            
            const link = AppConfig.api.host + ":"+ AppConfig.api.port + "/test";
            let html = pug.renderFile(path.join(__dirname, "../emails/validation."+ res.locals.language + ".pug"), 
                {title:AppConfig.api.appName,
                siteUrl:url,
                header: header,
                siteAccess: messages.emailSiteAccess,
                phone:phone,
                address:address,
                icons:icons,
                socialLinks:socialLinks,
                content:content,
            });
            //CSS must be put inline for better support of all browsers
            html =  await InlineCss(html, {extraCss:"",applyStyleTags:true,applyLinkTags:true,removeStyleTags:false,removeLinkTags:true,url:"filePath"});
            console.log(html);
            res.send(html);
        } catch (error) {
            next(new HttpException(500, messages.authEmailSentError,null));

        }
    }
}