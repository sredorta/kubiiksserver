import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';

import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import {DTOFirstName, DTOLastName,DTOEmail,DTOPassword,DTOPhone,DTOMobile, DTOId, DTOAccess, DTOKeepConnected} from '../routes/dto';
import { Helper } from '../classes/Helper';

import jwt from "jsonwebtoken";
import pug from 'pug';
import path from 'path';
import {Validator} from "class-validator";

//Data models
import {User} from '../models/user';
import {Account} from '../models/account';
import { createPublicKey } from 'crypto';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";

interface IJwtPayload {
    userId:string

}

export class AuthController {

    constructor() {}



    ///////////////////////////////////////////////////////////////////////////
    //User signup
    ///////////////////////////////////////////////////////////////////////////
    static signup = async (req: Request, res: Response, next:NextFunction) => {
        let myUser : User;
        let myAccount : Account;
        let method = Helper.getSharedSetting("signup_validation_method")
        try {
            myUser = await User.scope("all").create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone:req.body.phone,
                mobile:req.body.mobile,
                emailValidationKey: Helper.generateRandomString(30),
                mobileValidationKey: Helper.generateRandomNumber(4),
                password: Account.hashPassword(req.body.password)
            });
            myAccount = await myUser.createAccount({
                password: Account.hashPassword(req.body.password)
            });
            //If we are the first user, then we need to create an additional account as admin with same password
            //If we are in demo mode each new user has an admin account
            if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
                myAccount = await myUser.createAccount({
                    access: "admin",
                    password: Account.hashPassword(req.body.password)
                });
            }
            //Depending on the signup_validation method we need to authenticate or not
            switch (method) {
                //Login to the admin account if exists or to the standard if admin does not exist
                case "no_validation": {
                    //Generate short period token and send it to user
                    const token = jwt.sign(
                        { userId: myUser.id, accountId: myAccount.id, access: myAccount.access }, //Payload !
                        AppConfig.auth.jwtSecret,
                        { expiresIn: AppConfig.auth.accessShort }
                      );
                    console.log("GENERATED TOKEN : " + token);  
                    res.send({token: token});  
                    break;
                }
                //Requires mobile phone validation
                case "mobile": {
                    next( new HttpException(500, messages.featureNotAvailable("signup_validation_method : mobile"),null))
                    break;
                }
                //Validation with email is the default
                default: {
                    //Generate email html
                    const link = AppConfig.api.host + ":"+ AppConfig.api.port + "/api/auth/validate-email?id=" + myUser.id + "&key="+myUser.emailValidationKey;
                    const html = pug.renderFile(path.join(__dirname, "../emails/validation."+ res.locals.language + ".pug"), {validationLink: link});
                    const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
                     let myEmail = {
                        from: AppConfig.emailSmtp.sender,
                        to: myUser.email,
                        subject: messages.authEmailValidateSubject(AppConfig.api.appName),
                        text: 'Voila un bon email',
                        html: html
                     }
                     console.log(html);

                     transporter.sendMail(myEmail).then(result => {
                        res.send({done: "Email sent"});  
                     }).catch(error => {
                        next(new HttpException(500, messages.authEmailSentError,null));
                     })
                }
            }
        } catch(error) {
            next(new HttpException(400, error.message, error.errors));
        }
    }

    //ADD CHECKS
    public static signupChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOPassword)); //Allways include password
        if (Helper.isSharedSettingMatch("signup_firstName", "include"))
            handlers.push(Middleware.validation(DTOFirstName));
        if (Helper.isSharedSettingMatch("signup_lastName", "include")) 
            handlers.push(Middleware.validation(DTOLastName));
        if (Helper.isSharedSettingMatch("signup_email", "include")) 
            handlers.push(Middleware.validation(DTOEmail));
        if (Helper.isSharedSettingMatch("signup_phone", "include")) 
            handlers.push(Middleware.validation(DTOPhone));
        if (Helper.isSharedSettingMatch("signup_mobile", "include")) 
            handlers.push(Middleware.validation(DTOMobile));
        return handlers;
    }

    ///////////////////////////////////////////////////////////////////////////
    // login
    ///////////////////////////////////////////////////////////////////////////
    //Debug with passports
    static login =  (req:Request, res:Response,next:NextFunction) => {
        //Thanks to passports we have the user in req.user if we get here credentials are valid
            console.log("LOGIN ROUTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            //console.log(req.user);
            const payload : IJwtPayload = {userId: req.user.id};
            let accessTime : string;    
            if (!req.body.keepconnected)
                accessTime = AppConfig.auth.accessShort;
            else
                accessTime = AppConfig.auth.accessLong;
            //We just need to create a token and provide it
            const token = jwt.sign( payload, AppConfig.auth.jwtSecret, { expiresIn: accessTime });
            console.log("GENERATED TOKEN : " + token);  
            res.json({token: token});              
    }
    //ADD CHECKS
    public static loginChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOPassword)); //Allways include password
        handlers.push(Middleware.validation(DTOKeepConnected));

/*        if (Helper.isSharedSettingMatch("login_email", "include")) 
            handlers.push(Middleware.validation(DTOEmail));

        if (Helper.isSharedSettingMatch("login_mobile", "include")) 
            handlers.push(Middleware.validation(DTOMobile));*/

        return handlers;
    }    

 /*       console.log("body parsing", req.body);
        //Create an user
        let myUser : User | null;
        let myAccount : Account;
        let method = Helper.getSharedSetting("signup_validation_method")
            //Remove all users
            User.scope("all").create({
                firstName: "Sergi",
                lastName: "Redorta",
                email: "test@test.com",
                phone: "0423133212",
                mobile: "0623133212",
                emailValidationKey: Helper.generateRandomString(30),
                mobileValidationKey: Helper.generateRandomNumber(4),
                password: Account.hashPassword("Hello1234")
            }).then(user => {
                console.log("user is:")
                console.log(user);
           });*/
    
/*    static login = async (req: Request, res: Response, next:NextFunction) => {
        console.log("We are here in the signIn !!!");
        let query :any =  {};
        if (Helper.isSharedSettingMatch("login_email", "include"))
            query["email"] = req.body.email;
        if (Helper.isSharedSettingMatch("login_mobile", "include"))
            query["mobile"] = req.body.mobile;
        let accessTime : string;    
        if (req.body.keepconnected)
            accessTime = AppConfig.auth.accessShort;
        else
            accessTime = AppConfig.auth.accessLong;

        //TODO find with email or with mobile or with both !!!! using query !!!!

        //Get user with accounts
        User.findOne({ 
            include:[{model: Account.scope("all")}],
            where: query }).then(user => {
            if (!user) 
                next( new HttpException(400, messages.authInvalidCredentials,null));
            else if(!user.accounts) {
                next( new HttpException(500, messages.validationNotFound(messages.account),null));
            }    
            else {
                 //More than one account and access not provided !
                if(!req.body.access && user.accounts.length>1) {
                    res.json({access: Helper.pluck(user.accounts,"access")});
                } else {
                    //One account in the db or access provided as param
                    let myAccount : Account | undefined = user.accounts[0];
                    if (req.body.access) {
                        myAccount = user.accounts.find(obj => obj.access == req.body.access);
                    }    
                    if (!myAccount)
                        next( new HttpException(400, messages.validationNotFound(messages.account),null));
                    else {
                        if (!myAccount.checkPassword(req.body.password)) {
                            next( new HttpException(400, messages.authInvalidCredentials,null));
                        } else {
                            //We got here so we can create a new token and provide it !
                            const token = jwt.sign(
                                { userId: user.id, accountId: myAccount.id, access: myAccount.access }, //Payload !
                                AppConfig.auth.jwtSecret,
                                { expiresIn: accessTime }
                            );
                            console.log("GENERATED TOKEN : " + token);  
                            res.send({token: token});  
                        }
                    }
                }  
            }         
        }).catch(error => {
            next(new HttpException(500, error.message, error.errors));    
        });
    }    
    //ADD CHECKS
    public static loginChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOPassword)); //Allways include password
        handlers.push(Middleware.validation(DTOAccess));
        handlers.push(Middleware.validation(DTOKeepConnected));

        if (Helper.isSharedSettingMatch("login_email", "include")) 
            handlers.push(Middleware.validation(DTOEmail));

        if (Helper.isSharedSettingMatch("login_mobile", "include")) 
            handlers.push(Middleware.validation(DTOMobile));

        return handlers;
    }    
*/
    ///////////////////////////////////////////////////////////////////////////
    // getAuthUser
    ///////////////////////////////////////////////////////////////////////////
    static getAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        console.log(res.locals.jwtPayload);
        User.findOne({where: {id: res.locals.jwtPayload.userId}}).then(myUser => {
            if (!myUser)
                next( new HttpException(400, messages.authTokenInvalid,null));
            else {
                res.json(myUser);
            }
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    //Validate Email when clicking to email link
    ///////////////////////////////////////////////////////////////////////////
    static emailValidation = async (req: Request, res: Response, next:NextFunction) => {
        const validator = new Validator();
        console.log("emailValidation !!!");
        console.log(req.query);
        //We do parameters checking here as we got parameters from the query
        let result : boolean = true;
        let myUser : User | null;

        if (!req.query.id) result = false;
        if (result)
            if (!validator.isNumberString(req.query.id)) result = false;
        if (!req.query.key) result = false;
        if (result)
            if (req.query.key.length!=30) result = false;
        //Check that we have a matching user with the given id and key
        try {
            if (result) {
                myUser = await User.scope("all").findOne({
                    where: {
                        id: req.query.id,
                        emailValidationKey: req.query.key 
                    }
                });
                if (!myUser) result=false;
                else {
                    myUser.isEmailValidated = true;
                    myUser.emailValidationKey = Helper.generateRandomString(30);
                    await myUser.save();
                }
            }
            //Render now the result view page and return it
            const html = pug.renderFile(path.join(__dirname, "../views/validation."+res.locals.language+ ".pug"), {result: result});
            res.send(html);
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
    }

    ///////////////////////////////////////////////////////////////////////////
    // resetPasswordEmail:  Resets the password by sending new one by email
    ///////////////////////////////////////////////////////////////////////////
    static resetPasswordByEmail = async (req: Request, res: Response, next:NextFunction) => {
        let query :any =  {};
        query["email"] = req.body.email;
 
        User.findOne({where: query,include:[{model: Account.scope("all")}]}).then(user => {
            if (!user)
                next( new HttpException(400, messages.validationNotFound(messages.user),null));
            else if(!user.accounts) {
                    next( new HttpException(500, messages.validationNotFound(messages.account),null));
            } else {
                 //More than one account and access not provided !
                 if(!req.body.access && user.accounts.length>1) {
                    res.json({access: Helper.pluck(user.accounts,"access")});
                } else {
                    //One account in the db or access provided as param
                    let myAccount : Account | undefined = user.accounts[0];
                    if (req.body.access) {
                        myAccount = user.accounts.find(obj => obj.access == req.body.access);
                    }    
                    if (!myAccount)
                        next( new HttpException(400, messages.validationNotFound(messages.account),null));
                    else {
                        //We got here, so reset the password and send email with new password
                        const password = Helper.generatePassword();
                        myAccount.password = Account.hashPassword(password);
                        myAccount.save();
                        console.log("New password : " + password);
                        //Send email with new password
                        const html = pug.renderFile(path.join(__dirname, "../emails/resetpassword."+ res.locals.language + ".pug"), {password: password, access: myAccount.access});
                        const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
                        let myEmail = {
                                from: AppConfig.emailSmtp.sender,
                                to: user.email,
                                subject: messages.authResetPasswordSubject(AppConfig.api.appName),
                                text: 'Voila un bon email',
                                html: html
                            }
                        console.log(html);

                        transporter.sendMail(myEmail).then(result => {
                                res.send({done: "Email sent"});  
                        }).catch(error => {
                                next(new HttpException(500, messages.authEmailSentError,null));
                        });          
                    }
                }
            }
        });
    }
    //ADD CHECKS
    public static resetPasswordByEmailChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOAccess));
        handlers.push(Middleware.validation(DTOEmail));
        return handlers;
    }    
    ///////////////////////////////////////////////////////////////////////////
    // resetPasswordEmail:  Resets the password by sending new one by email
    ///////////////////////////////////////////////////////////////////////////
    static resetPasswordByMobile = async (req: Request, res: Response, next:NextFunction) => {
        next( new HttpException(400, messages.featureNotAvailable('password reset mobile'), null))
    }
    //ADD CHECKS
    public static resetPasswordByMobileChecks() {
        let handlers : RequestHandler[] = [];
        handlers.push(Middleware.validation(DTOAccess));
        handlers.push(Middleware.validation(DTOMobile));
        return handlers;
    }    
}