import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import { Helper } from '../classes/Helper';

import jwt from "jsonwebtoken";
import pug from 'pug';
import path from 'path';
import {Validator} from "class-validator";
//Data models
import {User} from '../models/user';
import { Email } from '../models/email';

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
        if (req.body.terms!= true)
            return next( new HttpException(500, messages.validationTerms,null))

        let myUser : User;
        let method = Helper.getSharedSetting("validation_method");
        try {
            myUser = await User.scope("full").create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                language: req.user.language,
                passport: "local",
                terms:req.body.terms,
                emailValidationKey: Helper.generateRandomString(30),
                mobileValidationKey: Helper.generateRandomNumber(4),
                password: User.hashPassword(req.body.password)
            });

            //Attach admin role if required
            if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
                await myUser.attachRole("admin"); 
            }
            //Attach kubiiks role on first user
            if (myUser.id ==1)
                await myUser.attachRole("kubiiks"); 


            //Depending on the validation method we need to authenticate or not
            switch (method) {
                case "no_validation": {
                    const token = myUser.createToken("short");
                    res.send({token: token, user:myUser});  
                    break;
                }
                //Validation with email is the default
                default: {
                    const link = AppConfig.api.host + ":"+ AppConfig.api.fePort + "/login/validate-email?id=" + myUser.id + "&key="+myUser.emailValidationKey;
                    let html = messages.emailValidationLink(link);

                    let recipients = [];
                    recipients.push(myUser.email);
                    let result = await Email.send(res.locals.language, 'validate-email', messages.authEmailValidateSubject(AppConfig.api.appName), recipients,html);
                    if (!result) res.send({message: {show:true, text:messages.emailSentError}});
                    else
                        res.send({message: {show:true, text:messages.authEmailValidate(myUser.email)}});  
                }
            }
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
                body('terms').exists().withMessage('exists').custom(CustomValidators.checked()),
                body('dummy').custom(CustomValidators.dBuserNotPresent(User)),
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
            let myUser = await User.scope("withRoles").findByPk(req.user.id);
            if (!myUser) return next( new HttpException(400, messages.validationNotFound(messages.User), null));
            let token : string = "";
            if (!req.body.keepconnected)
                token = myUser.createToken("short");
            else
                token = myUser.createToken("long");
            res.json({token: token, user:myUser});   
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
            const payload : IJwtPayload = {id: req.user.id};
      
            //We just need to create a token and provide it
            const token = jwt.sign( payload, AppConfig.auth.jwtSecret, { expiresIn: AppConfig.auth.accessShort });
            res.redirect(AppConfig.api.host+":"+AppConfig.api.fePort+"/login/validate/"+token);      
    }

    //When any of the oauth2 gets a fail then redirect to /login/fail
    //Angular should do nothing
    static oauth2Fail =  (req:Request, res:Response,next:NextFunction) => {
        res.redirect(AppConfig.api.host+":"+AppConfig.api.fePort+"/login");
    };

    /**Gets current user stored fields in the system */
    static oauth2ValidateFields =  async (req:Request, res:Response,next:NextFunction) => {
        try {
            let myUser = User.build(JSON.parse(JSON.stringify(req.user)), {isNewRecord:false});
            //If terms are not validated we need to show signup completion form, if not we can move directly to loggedIn area
            if (myUser.terms == false) {
                res.json({complete:false, user:myUser});
            } else {
                //Return user with roles as token is already available (equivalent to getAuthUser)
                let myUserFull = await User.scope("withRoles").findByPk(myUser.id);
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
            let result = await User.scope("withRoles").findByPk(req.user.id);
            res.json(result);
        }
    }
    /**Parameter validation */
    static oauth2UpdateFieldsChecks() {
        return [
            body('firstName').custom(CustomValidators.nameValidator('firstName')),
            body('lastName').custom(CustomValidators.nameValidator('lastName')),
            body('email').exists().withMessage('exists').isEmail(),
            body('phone').custom(CustomValidators.phone('phone')),
            body('mobile').custom(CustomValidators.mobile('mobile')),
            body('terms').exists().withMessage('exists').custom(CustomValidators.checked()),
            body('dummy').custom(CustomValidators.dBuserNotPresentExceptMe(User)),
            Middleware.validate()
        ]
    }    
 


    /**Get current loggedIn user */
    static getAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //Sending back user
        try {
            let myUser = await User.scope("withRoles").findByPk(req.user.id);
            res.json(myUser);
        } catch(error) {
            next(new HttpException(500, error.message, error.errors));
        }        
    }

    /**Updates curred loggedIn user */
    static updateAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //Sending back user
        try {
            let myUser = await User.scope("fullWithRoles").findByPk(req.user.id);
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
            if (req.body.passwordOld) {
                if (!myUser.checkPassword(req.body.passwordOld))
                    next (new HttpException(400, messages.authInvalidCredentials, null)); 
                else     
                    myUser.password = User.hashPassword(req.body.password);   
            }
            myUser = await myUser.save();  
            myUser = await User.scope("withRoles").findByPk(req.user.id);  
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
    //Validate Email when clicking to email link
    ///////////////////////////////////////////////////////////////////////////

    //TODO: Regenerate key each time so that we cannot have somebody trying endpoint indefinitely
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
                const payload : IJwtPayload = {id: req.body.id};
                let accessTime = AppConfig.auth.accessShort;
                const token = jwt.sign( payload, AppConfig.auth.jwtSecret, { expiresIn: accessTime });
                //TODO: GENERATE TOKEN AND SEND AUTH AND TOKEN :Get auth user and send
                myUser = await User.scope("withRoles").findByPk(req.body.id);
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
    // resetPasswordEmail:  Resets the password by sending new one by email
    ///////////////////////////////////////////////////////////////////////////
    static resetPasswordByEmail = async (req: Request, res: Response, next:NextFunction) => {
        let query :any =  {};
        query["email"] = req.body.email;
        try {
            let myUser = await User.scope("full").findOne({where:{email:req.body.email}});
            if (!myUser) return next( new HttpException(400, messages.validationNotFound(messages.User),null));
            const password = Helper.generatePassword();
            myUser.password = User.hashPassword(password);
            await myUser.save();
            //Send the email
            let html = messages.emailResetPassword(password);
            let recipients = [];
            recipients.push(myUser.email);
            let result = await Email.send(res.locals.language, 'reset-password', messages.emailResetPasswordSubject(AppConfig.api.appName), recipients,html);
            if (!result) res.send({message: {show:true, text:messages.emailSentError}});
            else
                res.send({message: {show:true, text:messages.authEmailResetPassword(myUser.email)}});      
        
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
    // resetPasswordEmail:  Resets the password by sending new one by phone
    ///////////////////////////////////////////////////////////////////////////
    static resetPasswordByMobile = async (req: Request, res: Response, next:NextFunction) => {
        next( new HttpException(400, messages.featureNotAvailable('password reset mobile'), null))
    }  
    /**Parameter validation */
    static resetPasswordByMobileChecks() {
        return [
            body('mobile').exists().withMessage('exists').custom(CustomValidators.mobile('mobile')),
            Middleware.validate()
        ]
    }       



}