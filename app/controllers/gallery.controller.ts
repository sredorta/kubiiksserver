import {Request, Response, NextFunction, RequestHandler} from 'express'; 
import {HttpException} from '../classes/HttpException';
import { Middleware } from '../middleware/common';
import nodemailer from 'nodemailer';
import {body} from 'express-validator/check';

import {AppConfig} from '../utils/Config';
import {messages} from '../middleware/common';
import uploads from '../utils/multer';
import Jimp from 'jimp';
import fs from 'fs';


export class GalleryController {

    /**Resizes image to 1024 max for angular editor uploads */
    static resizeImage(file:Express.Multer.File) {
        let myPromise : Promise<boolean>;
        let myObj = this;
        myPromise =  new Promise<boolean>((resolve,reject) => {
          async function _getData() {
            try {
                let image = await Jimp.read(file.path);
                if (image.getWidth()>1024 || image.getHeight()>1024) {
                    if (image.getWidth()>=image.getHeight()) {
                        image.resize(1024,Jimp.AUTO).write(file.path + "_resized");
                    } else {
                        image.resize(Jimp.AUTO,1024).write(file.path + "_resized");
                    }
                    fs.unlinkSync(file.path);
                    fs.renameSync(file.path + "_resized", file.path);
                    resolve(true);
                } else {
                    resolve(true);
                }
                console.log("WIDTH:",image.getWidth());
                console.log("HEIGHT:", image.getHeight());
               resolve(true);
            } catch(error) {
               reject(false);
            }
          }
          _getData();
        });
        return myPromise;
    }


    constructor() {}

    /**Uploads image to content folder and returns imageUrl for angular-editor*/
    static uploadImageToContent = async (req: Request, res: Response, next:NextFunction) => {
        await GalleryController.resizeImage(req.file);
        res.send({imageUrl: "https://localhost:3000/public/images/content/" + req.file.filename});  
    }

    /**Uploads image to blog folder and returns imageUrl for angular-editor*/
    static uploadImageToBlog = async (req: Request, res: Response, next:NextFunction) => {
        await GalleryController.resizeImage(req.file);
        res.send({imageUrl: "https://localhost:3000/public/images/blog/" + req.file.filename});  
    }


    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToEmail = async (req: Request, res: Response, next:NextFunction) => {
        await GalleryController.resizeImage(req.file);
        res.send({imageUrl: "https://localhost:3000/public/images/email/" + req.file.filename});  
    }    

    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToDefaults = async (req: Request, res: Response, next:NextFunction) => {
        await GalleryController.resizeImage(req.file);
        res.send({imageUrl: "https://localhost:3000/public/images/defaults/" + req.file.filename});  
    }    

    /**Uploads video to content folder*/
    static uploadVideoToContent = async (req: Request, res: Response, next:NextFunction) => {
        console.log("UPLOADING VIDEO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        res.send({videoUrl: "https://localhost:3000/public/videos/content/" + req.file.filename});  
    } 

}        