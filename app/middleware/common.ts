import express from 'express';
import {Response,Request,NextFunction} from 'express';
//i18n part
//import { messages as en } from '../i18n/en';
import { messages as en} from '../i18n/en';
import {UniqueConstraintError, ValidationErrorItem} from 'sequelize';
import * as path from 'path';
import * as glob  from 'glob';
import {AppConfig} from '../utils/Config';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import {HttpException} from '../classes/HttpException';
import * as ts from "typescript";
import jwt from "jsonwebtoken";
import {check, validationResult,body} from 'express-validator/check';
import {ValidationException} from '../classes/ValidationException';
import { User } from '../models/user';
import passportJWT from "passport-jwt";

export let messages = en; //Set default language and export messages






export class Middleware {
    //Handle cors for the api
    public static cors() {
        console.log("Cors enabled !!!");
        return function (req:express.Request, res:express.Response, next:express.NextFunction) {
            //Enabling CORS
            //res.header("Access-Control-Allow-Origin", AppConfig.api.host + ":"+ AppConfig.api.fePort);
            res.header("Access-Control-Allow-Origin", "*");

            res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
            next();
        }
    }

    //Set language based on headers and supported languages in req.language
    public static language() {
        console.log("Language enabled !!");
        return function (req:express.Request, res:express.Response, next:express.NextFunction) {
            //Languages supported
            const acceptableLanguages = glob.sync(`${__dirname}/../i18n/*.ts`)
                    .map((file:any) => path.basename(file, '.ts'))
                    .filter((language:string) => language !== 'index');
            let language = (req.acceptsLanguages(acceptableLanguages) || AppConfig.api.defaultLanguage) as string;

            res.locals.language = language;  //Store language in the locals
            if (!req.user)
                req.user = {};
            req.user.language = language;   //This is used afterwards !!!!
            //Override messages so that it uses correct language
            let acc : any = [];
            acc[language] = require(`../i18n/${language}`).messages;
            messages = acc[language];
            next();
        }
    }

    public static languagesSupported() {
        return glob.sync(`${__dirname}/../i18n/*.ts`)
        .map((file:any) => path.basename(file, '.ts'))
        .filter((language:string) => language !== 'index');
    }


    //Handle all errors !
    public static errorHandler() {
        console.log("errorHandler enabled !!!");
        return function errorMiddleware(error: HttpException, request: Request, response: Response, next: NextFunction) {
            console.log("Running errorHandler !");
            console.log("//////////////////////////////////////////////");
            console.log(error.stack);
            console.log("//////////////////////////////////////////////");
            console.log("ERROR TYPE: " + typeof error);

            console.log("Message: " + error.message);



                const status : number = error.status || 500;
                let message = error.message || 'Something went wrong';;
                let send = false;
                if (error.errors) {
                    if (error.errors[0])
                        if (error.errors[0].type == "Validation error") {
                            message = messages.validation(error.errors[0].path);
                            response.status(status).send({
                                    status:status,
                                    message: message
                                    });
                        } else if (error.errors[0].type =="unique violation") {
                            async function _generateError() {
                                const elem = error.errors[0].instance._modelOptions.name.singular;
                                console.log("Found unique violation !!!!!");
                                console.log(elem);
                                //TODO fix this in case it doesn't exist and remove error
                                let code: string = `({
                                    Run: (messages: any, elem:string): string => {
                                        return Promise.resolve(messages.validationUnique(messages[elem])); }
                                    })`;
                                let result = ts.transpile(code);
                                let runnalbe :any = eval(result);
                                message = await runnalbe.Run(messages,elem);
                                response.status(status).send({
                                    status:status,
                                    message: message
                                    });
                            }
                            _generateError();
                        } else {
                            response.status(status).send({
                                status:status,
                                message: message
                            });             
                        } 
                } else {
                    response.status(status).send({
                        status:status,
                        message: message
                    });                  
                }        

        }
    }
    /** Middleware that handles parameter input validation using express-validation*/
    public static validate(): express.RequestHandler {
        console.log("Validate middleWare enabled !");
        return function (req:Request, res:Response, next: NextFunction) {
            try{  
                validationResult(req).throw();
            } catch(error) {
                next(new ValidationException(error));  
            }
            next();
        };
      }

    /**Checks that user has not been already logged in */
    public static unregistered() {
        return async (req:express.Request, res:express.Response, next:express.NextFunction) => {
            console.log("UNREGISTERED CHECK !!!!!!!!!!!!!!!!");
            try {
                let token  =  req.headers['authorization'];
                console.log("Token is : " + token);
                if (token == undefined) {
                    next();
                } else {
                    //Verify if token is valid
                    token = token.slice(7, token.length); //Remove Bearer from token
                    jwt.verify(token, AppConfig.auth.jwtSecret, (err, decoded) => {
                        if (err) next();
                        else throw new HttpException(400, messages.authAlreadyLoggedIn, null);
                        })
                }

            } catch(error) {
                next(error);
            }
        }
    } 


    /** Checks that the registered user is an administrator if not errors */     
    public static admin() {
        return async (req:express.Request, res:express.Response, next:express.NextFunction) => {
            try {
                let myUser = User.build(JSON.parse(JSON.stringify(req.user)), {isNewRecord:false});
                if (myUser) {
                    if (await myUser.hasRole("admin"))
                        next();
                    else
                        next(new HttpException(403, messages.authTokenInvalidAdmin, null));
                } else
                    next(new HttpException(403, messages.authTokenInvalidAdmin, null));
            } catch(error) {
                next(new HttpException(403, messages.authTokenInvalidAdmin, null));
            }
        }
    }

    public static catchFacebookResponse() {
        return function (req:express.Request, res:express.Response, next:express.NextFunction) {
            console.log("CATCHFACEBOOKRESPONSE !!!!!!!!!!!!");
            next();
        }
    }

}
