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
        res.send({imageUrl: "https://localhost:3000/public/images/content/" + req.file.filename});  
    }

    /**Uploads image to blog folder and returns imageUrl for angular-editor*/
    static uploadImageToBlog = async (req: Request, res: Response, next:NextFunction) => {
        res.send({imageUrl: "https://localhost:3000/public/images/content/" + req.file.filename});  
    }

    static test = async (req: Request, res: Response, next:NextFunction) => {
 //       setTimeout(() => {
           res.send({imageUrl: "https://localhost:3000/public/test.jpg"});  
 //       },20000);
    }
    /**Parameter validation */
    static testChecks() {
        return [
            body('email').exists().withMessage('exists').isEmail(),
            body('subject').exists().withMessage('exists').isString().isLength({min:5}).withMessage("minlength"),
            body('message').exists().withMessage('exists').isString().isLength({min:5}).withMessage("minlength"),
            Middleware.validate()
        ]
    }
}        