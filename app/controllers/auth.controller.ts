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
        console.log("REQ USER:");
        console.log(req.user.language);
        try {
            myUser = await User.scope("full").create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone:req.body.phone,
                mobile:req.body.mobile,
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

            //Depending on the validation method we need to authenticate or not
            switch (method) {
                //Login to the admin account if exists or to the standard if admin does not exist
                case "no_validation": {
                    const token = myUser.createToken("short");  
                    console.log("GENERATED TOKEN : " + token);  
                    res.send({token: token});  
                    break;
                }
                //Requires mobile phone validation
                case "mobile": {
                    next( new HttpException(500, messages.featureNotAvailable("validation_method : mobile"),null))
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
                        res.send({message: {show:true, text:messages.authEmailValidate(myUser.email)}});  
                     }).catch(error => {
                        next(new HttpException(500, messages.authEmailSentError,null));
                     })
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
                body('phone').custom(CustomValidators.phone('phone')),
                body('mobile').custom(CustomValidators.mobile('mobile')),
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
    static login =  (req:Request, res:Response,next:NextFunction) => {
        //Thanks to passports we have the user in req.user if we get here credentials are valid
            console.log("LOGIN ROUTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
            //console.log(req.user);
            const payload : IJwtPayload = {id: req.user.id};
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
    /**Parameter validation */
    static loginChecks() {
        if (Helper.isSharedSettingMatch("login_mobile", "include")) 
            return [
                body('username').custom(CustomValidators.mobile('mobile')),
                body('password').exists().withMessage('exists').custom(CustomValidators.password()),
                body('keepconnected').exists().withMessage('exists').isBoolean(),
                Middleware.validate()
            ]
        else
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
    static oauth2ValidateFields =  (req:Request, res:Response,next:NextFunction) => {
        let myUser = User.build(JSON.parse(JSON.stringify(req.user)), {isNewRecord:false});
        //If terms are not validated we need to show signup completion form, if not we can move directly to loggedIn area
        if (myUser.terms == false) {
            res.json({complete:false, user:myUser});
        } else {
            //Return user with roles as token is already available (equivalent to getAuthUser)
            console.log(myUser);
            res.json({complete:true, user:myUser});
        }
    }


    /**Updates the current user with the given parameters */
    static oauth2UpdateFields = async (req:Request, res:Response,next:NextFunction) => {
        console.log("oauth2UpdateFields !!!!");
        console.log(req.body);
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
 


    ///////////////////////////////////////////////////////////////////////////
    // getAuthUser
    ///////////////////////////////////////////////////////////////////////////
    static getAuthUser = async (req: Request, res: Response, next:NextFunction) => {
        //TODO SWITCH TO PASSPORT !!!!
        //Sending back user
        let myUser = await User.scope("withRoles").findByPk(req.user.id);
        res.json(myUser);
        /*console.log(res.locals.jwtPayload);
        User.findOne({where: {id: res.locals.jwtPayload.userId}}).then(myUser => {
            if (!myUser)
                next( new HttpException(400, messages.authTokenInvalid,null));
            else {
                res.json(myUser);
            }
        });*/
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
                myUser = await User.scope("full").findOne({
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
        

        User.scope("withRoles").findOne({where: query}).then(myUser => {
            if (!myUser)
                next( new HttpException(400, messages.validationNotFound(messages.User),null));
            else {
                //We got here, so reset the password and send email with new password
                const password = Helper.generatePassword();
                myUser.password = User.hashPassword(password);
                myUser.save();
                console.log("New password : " + password);
                //Send email with new password
                const html = pug.renderFile(path.join(__dirname, "../emails/resetpassword."+ res.locals.language + ".pug"), {password: password});
                const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
                let myEmail = {
                        from: AppConfig.emailSmtp.sender,
                        to: myUser.email,
                        subject: messages.authEmailResetPasswordSubject(AppConfig.api.appName),
                        text: 'Voila un bon email',
                        html: html
                    }
                console.log(html);

                transporter.sendMail(myEmail).then(result => {
                        res.send({message: {show:true,text:messages.authEmailResetPassword(myUser.email)}});  
                }).catch(error => {
                        next(new HttpException(500, messages.authEmailSentError,null));
                });          
            }
        });
    }
    /**Parameter validation */
    static resetPasswordByEmailChecks() {
            return [
                body('email').exists().withMessage('exists').isEmail(),
                Middleware.validate()
            ]
    }    
    ///////////////////////////////////////////////////////////////////////////
    // resetPasswordEmail:  Resets the password by sending new one by email
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