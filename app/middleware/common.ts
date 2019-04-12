import express from 'express'; //= require('express');
//i18n part
//import { messages as en } from '../i18n/en';
import { messages as en} from '../i18n/en';

import * as path from 'path';
import * as glob  from 'glob';

export var messages = en; //Set default language and export messages

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
            var language = (req.acceptsLanguages(acceptableLanguages) || 'en') as string;
            req.language = language; //TODO REMOVE AS NOT NEEDED !!!
            //Override messages so that it uses correct language
            var acc : any = [];
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

}
