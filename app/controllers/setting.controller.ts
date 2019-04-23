import {Request, Response, NextFunction} from 'express'; 
import {Setting} from '../models/setting';
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import {messages} from '../middleware/common';
import nodemailer from 'nodemailer';
import {AppConfig} from '../utils/Config';


import { IsString, IsNotEmpty } from 'class-validator';
//DEFINE HERE ALL LOCAL DTO CLASSES FOR PARAMETER CHECKING
class DTOKey {
    @IsNotEmpty({
        message:function() {
            return messages.validationEmpty("key");
        }
    })
    @IsString({
        message: function() {
            return messages.validation("key");
        }
    })
    public key!: string;
}


export class SettingController {

    ///////////////////////////////////////////////////////////////////////////
    //Get all settings from the table 
    ///////////////////////////////////////////////////////////////////////////
    static getAll = async (req: Request, res: Response, next:NextFunction) => {
        Setting.findAll().then((result)=> {
            res.json(result);
        }).catch( (error) => {
            next(new HttpException(500, error.message, error.errors));
        });
    }

    ///////////////////////////////////////////////////////////////////////////
    //Get user by key
    ///////////////////////////////////////////////////////////////////////////
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

    //Get user by ID CHECKS
    public static getByKeyChecks() {
        return Middleware.validation(DTOKey);
    }

    ///////////////////////////////////////////////////////////////////////////
    //Get email settings and make a transporter check
    ///////////////////////////////////////////////////////////////////////////
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