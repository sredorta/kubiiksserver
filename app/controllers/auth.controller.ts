import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';

import {AppConfig} from '../utils/config';
import {messages} from '../middleware/common';
import { Helper } from '../classes/Helper';

import jwt from "jsonwebtoken";
import pug from 'pug';
import path from 'path';
import {Validator} from "class-validator";
//Data models
import {User} from '../models/user';
import { Email } from '../models/email';
import { Newsletter } from '../models/newsletter';
import { ExtractJwt } from 'passport-jwt';

/**Payload interface */
export interface IJwtPayload {
    /**Contains user ID */
    id:number
}

export class AuthController {

    constructor() {}

    ///////////////////////////////////////////////////////////////////////////
    //User signup
    ///////////////////////////////////////////////////////////////////////////
    /**Sign up user using local passport */
    static signup = async (req: Request, res: Response, next:NextFunction) => {
        //Check that we got the terms accepted
        let myUser : User;
        try {
            myUser = await User.scope("full").create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                language: req.user.language,
                passport: "local",
                terms:req.body.terms,
                emailValidationKey: Helper.generateRandomString(30),
                password: User.hashPassword(req.body.password)
            });
            //If newsletter is check add email to the newsletter
            if (req.body.newsletter == true) Newsletter.subscribe(req.body.firstName,req.body.lastName,req.body.email,req.user.language);

            //Attach admin role if required
            if (myUser.id ==1) {
                await myUser.attachRole("admin"); 
                await myUser.attachRole("kubiiks"); 
            }
            let myUserTmp = await User.scope("fulldetails").findByPk(myUser.id);
            if (myUserTmp) myUser = myUserTmp;
            //Depending on the validation method we need to authenticate or not
            const link = AppConfig.api.kiiwebExtHost + "/"+req.user.language+"/auth/validate-email?id=" + myUser.id + "&key="+myUser.emailValidationKey;
            let html = messages.emailValidationLink(link);
            let recipients = [];
            recipients.push(myUser.email);
            let result = await Email.send(res.locals.language, 'validate-email', messages.authEmailValidateSubject(AppConfig.api.appName), recipients,html);
            if (!result) 
                res.send({message: {show:true, text:messages.emailSentError}});
            else
                res.send({message: {show:true, text:messages.authEmailValidate(myUser.email)}});  

        } catch(error) {
            next(new HttpException(400, error.message, error.errors));
        }
    }

    /**Parameter validation */
    static signupChecks() {
            return [
                body('firstName').custom(CustomValidators.nameValidator('firstName')),
                body('lastName').custom(CustomValidators.nameValidator('lastName')),
                body('email').exists().withMessage('exists').isEmail(),
                body('password').exists().withMessage('exists').custom(CustomValidators.password()),
                body('terms').exists().withMessage('exists').isBoolean().custom(CustomValidators.checked()),
                body('newsletter').exists().withMessage('exists').isBoolean(),
                body('dummy').custom(CustomValidators.dBuserNotPresent(User)),
                Middleware.validate()
            ]
    }    

    ///////////////////////////////////////////////////////////////////////////
    //Validate Email when clicking to email link
    ///////////////////////////////////////////////////////////////////////////
    /**Validates email account by providing id and key */
    static emailValidation = async (req: Request, res: Response, next:NextFunction) => {
        try {
            let myUser = await User.scope("full").findByPk(req.body.id);
            if (!myUser) throw new Error("User not found !");
            //Check that key matches
            if (myUser.emailValidationKey != req.body.key) 
                res.status(400).send({message: messages.authEmailValidateError});
            else {
                //Generate new key
                myUser.isEmailValidated = true;
                myUser.emailValidationKey = Helper.generateRandomString(30);
                await myUser.save();
                //Generate a token
                let myUserTmp = await User.scope("details").findByPk(myUser.id);
                if (myUserTmp) myUser = myUserTmp;
                let token = myUser.createToken("short");
                myUser = await User.scope("details").findByPk(req.body.id);
                if (myUser) myUser=myUser.sanitize(res.locals.language);
                res.send({user:myUser,token:token,message: {show:true, text:messages.authEmailValidateSuccess}});
            }
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
    }
    /**Parameter validation */
    static emailValidationChecks() {
        return [
            body('id').exists().withMessage('exists').custom(CustomValidators.dBExists(User,'id')),
            body('key').exists().withMessage('exists').isLength({min:30,max:30}).isAlphanumeric(),
            Middleware.validate()
        ]
    }   


    ///////////////////////////////////////////////////////////////////////////
    // login
    ///////////////////////////////////////////////////////////////////////////
    /**Login using local passport */
    static login = async (req:Request, res:Response,next:NextFunction) => {
        //Thanks to passports we have the user in req.user if we get here credentials are valid
        try {
            let myUser = await User.scope("details").findByPk(req.user.id);
            if (!myUser) return next( new HttpException(400, messages.authInvalidCredentials, null));
            let token : string = "";
            if (!req.body.keepconnected)
                token = myUser.createToken("short");
            else
                token = myUser.createToken("long");
            res.json({token: token, user:myUser.sanitize(res.locals.language)});   
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }              
    }
    /**Parameter validation */
    static loginChecks() {
            return [
                body('username').exists().withMessage({type:'exists',field:'email'}).isEmail(),
                body('password').exists().withMessage('exists').custom(CustomValidators.password()),
                body('keepconnected').exists().withMessage('exists').isBoolean(),
                Middleware.validate()
            ]            
    }        


    ///////////////////////////////////////////////////////////////////////////
    // OAUTH2
    ///////////////////////////////////////////////////////////////////////////
    //When any of the oauth2 gets a success then redirect to /login/success and provide the token we have generated
    //Angular should recover the token from the page and redirect to home afterwards if all fields are ok, if not ask user to enter fields
    static oauth2Success =  (req:Request, res:Response,next:NextFunction) => {      
        //We just need to create a token and provide it
        User.scope("details").findByPk(req.user.id).then(user => {
            if (user) {
                let token = user.createToken('short');
                res.redirect(AppConfig.api.kiiwebExtHost+"/"+res.locals.language+"/auth/login/validate/"+token);      
            }
        });    
    }

    //When any of the oauth2 gets a fail then redirect to /login/fail
    //Angular should do nothing
    static oauth2Fail =  (req:Request, res:Response,next:NextFunction) => {
        res.redirect(AppConfig.api.kiiwebExtHost +"/"+res.locals.language+ "/login");
    };

    /** Checks if user has terms validated so that we can redirect him to accept or refuse */
    static oauth2ValidateFields =  async (req:Request, res:Response,next:NextFunction) => {
        try {
            let myUser = User.build(JSON.parse(JSON.stringify(req.user)), {isNewRecord:false});
            
            //If terms are not validated we need to show signup completion form, if not we can move directly to loggedIn area
            if (myUser.terms == false) {
                res.json({complete:false, user:myUser.sanitize(res.locals.language)});
            } else {
                //Return user with roles as token is already available (equivalent to getAuthUser)
                let myUserFull = await User.scope("details").findByPk(myUser.id);
                //Update isEmailValidated
                if (myUserFull) {
                    myUserFull.isEmailValidated = true;
                    await myUserFull.save();
                }
                if (myUserFull)
                    myUserFull = myUserFull.sanitize(res.locals.language);
                res.json({complete:true, user:myUserFull});
            }
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }    
    }


    /**Updates the current user with the given parameters */
    static oauth2UpdateFields = async (req:Request, res:Response,next:NextFunction) => {
        //Check that we got the terms accepted
        let myUser = await User.findByPk(req.user.id);
        if (!myUser) {
            next( new HttpException(400, messages.validationNotFound(messages.User), null))
        } else {
            await myUser.update(req.body);
            //Add the newsletter if checked
            if (myUser)
                if (req.body.newsletter)
                    if (req.body.newsletter == true) {
                        await Newsletter.subscribe(myUser.firstName,myUser.lastName,myUser.email,myUser.language);
                    }            
            let result = await User.scope("details").findByPk(req.user.id);
            if (result) result = result.sanitize(res.locals.language)
            res.json(result);
        }
    }
    /**Parameter validation */
    static oauth2UpdateFieldsChecks() {
        return [
            body('firstName').custom(CustomValidators.nameValidator('firstName')),
            body('lastName').custom(CustomValidators.nameValidator('lastName')),
            body('email').exists().withMessage('exists').isEmail(),
            //body('phone').custom(CustomValidators.phone('phone')),
            //body('mobile').custom(CustomValidators.mobile('mobile')),
            body('terms').exists().withMessage('exists').custom(CustomValidators.checked()),
            body('newsletter').exists().isBoolean(),   
            body('dummy').custom(CustomValidators.dBuserNotPresentExceptMe(User)),
            Middleware.validate()
        ]
    }    
 


    /**Get current loggedIn user */
    static getAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //Sending back user
        try {
            let myUser = await User.scope("details").findByPk(req.user.id);
            if (myUser)
                res.json(myUser.sanitize(res.locals.language));
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }        
    }

    /**Updates curred loggedIn user */
    static updateAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //Sending back user
        try {
            let myUser = await User.scope("fulldetails").findByPk(req.user.id);
            if (!myUser) throw new Error("User not found !"); 
            if (req.body.firstName)
                myUser.firstName = req.body.firstName;
            if (req.body.lastName)
                myUser.lastName = req.body.lastName;
            if (req.body.email)
                myUser.email = req.body.email;
            if (req.body.phone)
                myUser.phone = req.body.phone;            
            if (req.body.mobile)
                myUser.mobile = req.body.mobile;    
            if (req.body.avatar) {
                if (req.body.avatar == "none") myUser.avatar = null;
                else myUser.avatar = req.body.avatar;  
            }  
            if (req.body.language)
                myUser.language = req.body.language;                          
            if (req.body.passwordOld) {
                if (!myUser.checkPassword(req.body.passwordOld))
                    next (new HttpException(400, messages.authInvalidCredentials, null)); 
                else     
                    myUser.password = User.hashPassword(req.body.password);   
            }
            myUser = await myUser.save();  
            myUser = await User.scope("details").findByPk(req.user.id);  
            if (myUser) myUser = myUser.sanitize(res.locals.language);
            res.json(myUser);
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }
    }    
    /**Parameter validation */
    static updateAuthUserChecks() {
        return [
            body('firstName').optional().custom(CustomValidators.nameValidator('firstName')),
            body('lastName').optional().custom(CustomValidators.nameValidator('lastName')),
            body('email').optional().isEmail(),
            body('phone').optional().custom(CustomValidators.phone('phone')),
            body('mobile').optional().custom(CustomValidators.mobile('mobile')),
            body('password').optional().custom(CustomValidators.passwordUpdate()),
            body('password').optional().custom(CustomValidators.passwordUpdate()),
            body('avatar').optional().isString(),         
            body('dummy').custom(CustomValidators.dBuserNotPresentExceptMe(User)),
            Middleware.validate()
        ]
    }        
    /**Deletes current loggedIn user */
    static deleteAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //Sending back user
        try {
            let myUser = await User.findByPk(req.user.id);
            if (!myUser) throw new Error("User not found !"); 
            myUser.destroy(); 
            res.sendStatus(204);
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
        try {
            let myUser = await User.scope("full").findOne({where:{email:req.body.email}});
            if (!myUser) {
                let html = messages.emailResetPasswordNoUser;
                let recipients = [];
                recipients.push(req.body.email);
                let result = await Email.send(res.locals.language, 'reset-password', messages.emailResetPasswordSubject(AppConfig.api.appName), recipients,html);
                if (!result) res.send({message: {show:true, text:messages.emailSentError}});
                else
                    res.send({message: {show:true, text:messages.authEmailResetPassword(req.body.email)}});      
            } else {
                const password = Helper.generatePassword();
                myUser.password = User.hashPassword(password);
                myUser.passwordResetKey = Helper.generateRandomString(50);
                await myUser.save();
                //Send the email
                const link = AppConfig.api.kiiwebExtHost + "/"+req.user.language+"/auth/establish-password?id=" + myUser.id + "&key="+myUser.passwordResetKey;
                let html = messages.emailResetPassword(link);
                let recipients = [];
                recipients.push(myUser.email);
                let result = await Email.send(res.locals.language, 'reset-password', messages.emailResetPasswordSubject(AppConfig.api.appName), recipients,html);
                if (!result) res.send({message: {show:true, text:messages.emailSentError}});
                else
                    res.send({message: {show:true, text:messages.authEmailResetPassword(myUser.email)}});      
            }
        } catch(error) {
            next(new HttpException(500, messages.emailSentError,null));
        };
    }
    /**Parameter validation */
    static resetPasswordByEmailChecks() {
            return [
                body('email').exists().withMessage('exists').isEmail(),
                Middleware.validate()
            ]
    }    
   
    ///////////////////////////////////////////////////////////////////////////
    // establishPassword:  Re-establishes password after reset
    ///////////////////////////////////////////////////////////////////////////
    static establishPassword = async (req: Request, res: Response, next:NextFunction) => {
        let query :any =  {};
        query["email"] = req.body.email;
        try {
            let myUser = await User.scope("fulldetails").findOne({where:{id:req.body.id}});
            //Check user exists
            if (!myUser) return next( new HttpException(400, messages.authEstablisPasswordError,null));
            //Check that the key is ok
            if (myUser.passwordResetKey != req.body.key) {
                myUser.passwordResetKey=''; //Reset key as is only one-time enabled
                await myUser.save();
                return next( new HttpException(400,  messages.authEstablisPasswordError,null));
            }
            myUser.password = User.hashPassword(req.body.password);
            myUser.passwordResetKey = '';
            await myUser.save();
            myUser = await User.scope("details").findByPk(req.body.id);  
            if (!myUser) return next( new HttpException(400,  messages.authEstablisPasswordError,null));
            let token : string = "";
            token = myUser.createToken("short");
            res.json({token: token, user:myUser.sanitize(res.locals.language)});   
        } catch(error) {
            console.log(error);
            next(new HttpException(500, messages.authEstablisPasswordError,null));
        };
    }
    /**Parameter validation */
    static establishPasswordChecks() {
            return [
                body('id').exists().withMessage('exists').isNumeric(),
                body('key').exists().withMessage('exists').isString().isLength({min:30}),
                body('password').exists().withMessage('exists').custom(CustomValidators.password()),
                Middleware.validate()
            ]
    }    




}