import {Request, Response, NextFunction} from 'express'; //= require('express');
import {HttpException} from '../classes/HttpException';
import {messages} from '../middleware/common';
import { Middleware } from '../middleware/common';
import { Helper } from '../classes/Helper';
import { Role } from '../models/role';
import { User } from '../models/user';

import {body} from 'express-validator/check';
import { CustomValidators } from '../classes/CustomValidators';
import fs from 'fs';
import path from 'path';
import sequelize from 'sequelize';
import {Sequelize} from 'sequelize-typescript';

import app from '../app';
import { AppConfig } from '../utils/Config';

/**Enumerator with all stats events*/
export enum DiskType {
    IMAGES = "images",
    //APP_START = "app_start",
}

export class FileItem {
    filename:string = "";
    basename:string = "";
    extension:string = "";
    size:number = 0;
    constructor() {}
}

export class Disk {
    /**Contains array of FileItem objects form the current directory */
    files : FileItem[] = [];
    dir:string;

    constructor(dir:string) {
        this.dir=dir;
    };

    /**Gets a list of all files recursivelly from a directory */
    getFileList(dir:string) {
        let fileList : string[] = [];
        const walkSync = (dir:string, filelist :string[] = []) => {
            fs.readdirSync(dir).forEach(file => {
                filelist = fs.statSync(path.join(dir, file)).isDirectory()
                ? walkSync(path.join(dir, file), filelist)
                : filelist.concat(path.join(dir, file));
          
            });
          return filelist;
        }
        return walkSync(dir,fileList);
    }

    /**Returns file information of a file */
    getFileData(file:string) {
        let myPromise : Promise<FileItem>;
        let myObj = this;
        let myFile = new FileItem();
        myPromise =  new Promise<FileItem>((resolve,reject) => {
          async function _getData() {
            try {
                    fs.stat(file,function(err,stats) {
                        let tmp = new FileItem();
                        tmp.filename = file;
                        tmp.size = stats["size"];
                        tmp.basename = path.basename(tmp.filename);
                        tmp.extension = path.extname(tmp.filename);
                        resolve(tmp);
                    });
                //resolve(true);
            } catch(error) {
               reject("Email header generation error");
            }
          }
          _getData();
        });
        return myPromise;
    }

    /**Initializes the Disk element with a directory*/
    init() {
        let myPromise : Promise<boolean>;
        let myObj = this;
        myPromise =  new Promise<boolean>((resolve,reject) => {
          async function _getData() {
            try {
                for (let file of myObj.getFileList(myObj.dir)) {
                    myObj.files.push(await myObj.getFileData(file));
                }
                resolve(true);
            } catch(error) {
               reject("Email header generation error");
            }
          }
          _getData();
        });
        return myPromise;

    }


    /**Gets total size of all loaded files */
    getTotalSize() {
        let total : number = 0;
        for (let item of this.files) {
            total = total + item.size;
        }
        return total;
    }

    /**Gets from all tables all records any link to images */


}


export class DiskController {


    /**Gets all available roles */
    static scan = async(req: Request, res: Response, next: NextFunction) => {  
        //We remove the kubiiks role so that is not visible on the frontend
        let dir = process.cwd() + '\\app\\public';
        switch (req.body.type) {
            case DiskType.IMAGES:
                dir = dir + '\\images';
                break;
            default:
                //Do nothing
        }
        //Now find all images create a list
        let myDisk = new Disk(dir);
        await myDisk.init();
        console.log(myDisk.files);
        console.log("Total size : ", myDisk.getTotalSize());
        
        let sequelize = new Sequelize({database: AppConfig.db.database,
            dialect: 'mariadb',
            username: AppConfig.db.username,
            password: AppConfig.db.password});
        sequelize.query('show tables').then(function(rows) {
            console.log(JSON.stringify(rows));
        });

        res.json("Current dir is : " + dir);
    }

    /** Role attach parameter validation */
    static scanChecks() {
        return [
            body('type').exists().withMessage('exists'),
            Middleware.validate()
        ]
    }    


}