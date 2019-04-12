import express from 'express';
import {Response,Request,NextFunction} from 'express';
//i18n part
//import { messages as en } from '../i18n/en';
import { messages as en} from '../i18n/en';

import * as path from 'path';
import * as glob  from 'glob';
import { config } from 'bluebird';
import AppConfig from '../config/config.json';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import {HttpException} from '../classes/HttpException';

export let messages = en; //Set default language and export messages

/*
export const cors = () => {
    console.log("CORS ENABLED !");
    return function (req:express.Request, res:express.Response, next:express.NextFunction) {
        //Enabling CORS
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization");
        next();
    }
};

export const language = () => {
    console.log("LANGUAGE ENABLED !!");
    return function (req:express.Request, res:express.Response, next:express.NextFunction) {
        //Languages supported
        const acceptableLanguages = glob.sync(`${__dirname}/../i18n/*.ts`)
                .map((file:any) => path.basename(file, '.ts'))
                .filter((language:string) => language !== 'index');
        var language = (req.acceptsLanguages(acceptableLanguages) || 'en') as string;
        req.language = language;
        next();
    }    
}
*/


export class Middleware {
    //Handle cors for the api
    public static cors() {
        console.log("Cors enabled !!!");
        return function (req:express.Request, res:express.Response, next:express.NextFunction) {
            //Enabling CORS
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
            console.log("Answering with language : " + language);
            //req.language = language; //TODO REMOVE AS NOT NEEDED !!!
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
            let text = "Error unknown";
            const name = error.name;
            const status : number = error.status || 500;
            let message = error.message || 'Something went wrong';
            const errors = error.errors;
            response.status(status)
              .send({
                status:status,
                message: error.type
              })
              /*            
            response.status(status)
              .send({
                status,
                message,
              })*/
          }
    }



    public static validation<T>(type: any): express.RequestHandler {
        console.log("Validation middleWare enabled !");
        return function validationMiddleware(req:Request, res:Response, next: NextFunction) {
          console.log("Running validation middleware");  
          validate(plainToClass(type, req.body))
            .then((errors: ValidationError[]) => {
              if (errors.length > 0) {
                const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
                console.log("We got here !!!!!");
                next(new HttpException(400,"validation", message,errors));
              } else {
                next();
              }
            });
        };
      }
/*
      public static validationMiddleware<T>(type: any): express.RequestHandler {
        return (req, res, next) => {
          console.log("Running validation middleware");  
          validate(plainToClass(type, req.body))
            .then((errors: ValidationError[]) => {
              if (errors.length > 0) {
                const message = errors.map((error: ValidationError) => Object.values(error.constraints)).join(', ');
                console.log("We got here !!!!!");
                next(new HttpException("validation", message,errors));
              } else {
                next();
              }
            });
        };
      }
*/



}
