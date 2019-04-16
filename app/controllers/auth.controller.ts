import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';

import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import {DTOFirstName, DTOLastName,DTOEmail,DTOPassword,DTOPhone,DTOMobile, DTOId} from '../routes/dto';
import { Helper } from '../classes/Helper';

import jwt from "jsonwebtoken";
import pug from 'pug';
import path from 'path';
import {Validator} from "class-validator";

//Data models
import {User} from '../models/user';
import {Account} from '../models/account';



export class AuthController {

    constructor() {}

    private static _createUser(account: Account, req: Request, res: Response, next:NextFunction) {
        console.log("We are here in test !!!");
    }

    //User signup
    static signup = async (req: Request, res: Response, next:NextFunction) => {
        let myUser : User;
        let myAccount : Account;
        console.log("Provided email : "+ req.body.email);
        let method = Helper.getSharedSetting("signup_validation_method")
        try {
            myUser = await User.create({
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone:req.body.phone,
                mobile:req.body.mobile,
                emailValidationKey: Helper.generateRandomString(30),
                mobileValidationKey: Helper.generateRandomNumber(4)
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
                        { userId: myUser.id, accountId: myAccount.id, accountLevel: myAccount.level }, //Payload !
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

    //Validate Email when clicking to email link
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
        if (result) {
            myUser = await User.findOne({
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
    }



}