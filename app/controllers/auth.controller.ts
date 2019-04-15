import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {User} from '../models/user';
import {Account} from '../models/account';
import AppConfig from '../config/config.json';
import {messages} from '../middleware/common';

import {DTOFirstName, DTOLastName,DTOEmail,DTOPassword,DTOPhone,DTOMobile} from '../routes/dto';
import { Helper } from '../classes/Helper';

import jwt from "jsonwebtoken";




export class AuthController {

    constructor() {}

    private static _createUser(account: Account, req: Request, res: Response, next:NextFunction) {
        console.log("We are here in test !!!");
    }

    //User signup
    //public signup(req: Request, res: Response, next: NextFunction) {
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
                emailValidationKey: Helper.generateRandomString(30)
            });
            myAccount = await myUser.createAccount({
                password: Account.hashPassword(req.body.password)
            });
            //If we are the first user, then we need to create an additional account as admin with same password
            if (myUser.id ==1) {
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

                }

            }

        } catch(error) {
            console.log("Sedning error !!!!!!!!!!!!!!!!!!!!!!!!!");
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

 

}