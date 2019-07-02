import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import uploads from '../utils/multer';


export class GalleryController {

    constructor() {}

    /**Uploads image to content folder and returns imageUrl for angular-editor*/
    static uploadImageToContent = async (req: Request, res: Response, next:NextFunction) => {
        console.log("WE ARE HERE !!!!!!!!");
        console.log(req.file.filename);
        res.send({imageUrl: "https://localhost:3000/public/images/content/" + req.file.filename});  
    }

    /**Uploads image to blog folder and returns imageUrl for angular-editor*/
    static uploadImageToBlog = async (req: Request, res: Response, next:NextFunction) => {
        console.log("We are in blog upload !!");
        console.log(req.body);
        res.send({imageUrl: "https://localhost:3000/public/images/blog/" + req.file.filename});  
    }


    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToEmail = async (req: Request, res: Response, next:NextFunction) => {
        console.log("We are in email upload !!");
        console.log(req.body);
        res.send({imageUrl: "https://localhost:3000/public/images/email/" + req.file.filename});  
    }    

    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToDefaults = async (req: Request, res: Response, next:NextFunction) => {
            console.log("We are in defaults upload !!");
            console.log(req.body);
            res.send({imageUrl: "https://localhost:3000/public/images/defaults/" + req.file.filename});  
    }    

}        