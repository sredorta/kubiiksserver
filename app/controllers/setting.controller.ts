import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {AppConfig} from '../utils/Config';
import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import { User } from '../models/user';




export class SettingController {

    /**Get all shared settings */
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        Setting.findAll().then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    /**Get shared setting by key */
    static getByKey = async (req: Request, res: Response, next:NextFunction) => {
        const key = req.body.key;
        Setting.findOne({
            where: {
                "key": key
            }
        }).then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }   

    /**getByKey parameter checking */
    public static getByKeyChecks() {
        return [
            body('key').exists().withMessage('exists').isString(),
            Middleware.validate()
        ]
    }

    /**Email transporter check */
    public static emailCheck = async (req: Request, res: Response, next:NextFunction) => {
        const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
        let myResult = {
            host: AppConfig.emailSmtp.host,
            port: AppConfig.emailSmtp.port,
            secure: AppConfig.emailSmtp.secure,
            sender: AppConfig.emailSmtp.sender,
            verification: ""
        }
        transporter.verify(function(error, success) {
            if (error) 
                 myResult.verification = "error";
            else 
                myResult.verification = "success";
            res.send(myResult);
         });
    }



}