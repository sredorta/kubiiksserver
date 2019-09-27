import {Request, Response, NextFunction} from 'express'; //= require('express');
import { Middleware } from '../middleware/common';
import { User } from '../models/user';

import fs from 'fs';
import path from 'path';

import { Setting } from '../models/setting';
import {Op} from "sequelize";
import { ArticleTranslation } from '../models/article_translation';
import { Email } from '../models/email';
import { Article } from '../models/article';
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
    inUse:boolean = true;
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

    /**Gets a list of all the files recursivelly and returns the corresponding link */
    getFileListLink(dir:string) {
        let result : string[] = [];
        for (let file of this.getFileList(dir)) {
            file = file.replace(/^.*\\public\\/,AppConfig.api.host + ":" + AppConfig.api.port + '/public/');
            file = file.replace(/\\/g,'/')
            result.push(file);
        }
        return result;
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
            } catch(error) {
               reject(new FileItem());
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
               reject(true);
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

    /**Gets total size of files in use*/
    getInUseSize() {
            let total : number = 0;
            for (let item of this.files.filter(obj=> obj.inUse == true)) {
                total = total + item.size;
            }
            return total;
    }
    /**Gets total size of files not in use*/
    getNotInUseSize() {
        let total : number = 0;
        for (let item of this.files.filter(obj=> obj.inUse == false)) {
            total = total + item.size;
        }
        return total;
    }

    /**Gets if file is in use */
    static fileInUse(file:FileItem) {
        let myPromise : Promise<boolean>;
        let myObj = this;
        myPromise =  new Promise<boolean>((resolve,reject) => {
          async function _getData() {
            let found = null;  
            try {
                //Default images are always in use
                if (file.filename.includes('\\defaults\\')) {
                    resolve(true);
                } 

                //Find in users avatars
                found = await User.findOne({where:{avatar:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                //Find in settings
                found = await Setting.findOne({where:{value:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);

                //Find in articles
                found = await Article.findOne({where:{image:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                found = await Article.findOne({where:{backgroundImage:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                found = await ArticleTranslation.findOne({where:{content:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);

                //Find in emails
                found = await Email.findOne({where:{logo:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                found = await Email.findOne({where:{backgroundHeader:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                found = await Email.findOne({where:{backgroundContent:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                resolve(false);
            } catch(error) {
               reject(true);
            }
          }
          _getData();
        });
        return myPromise;
    }
}

/**Class to provide the result to the web */
class DiskResult {
    /**Disk total size */
    totalSize : number = 0;

    /**System files size */
    systemSize : number = 0;

    /**Ressources files size */
    ressourcesSize : number = 0;

    /**removable total file size */
    removableSize : number = 0;

    /**Disk chart */
    disk : any[] = [];


    /**Images chart */
    images : any[] = [];
    /**Removable images Size */
    removableImagesSize : number = 0;

    /**List of all files to remove found */
    filesToRemove : string[] = [];

    constructor() {};

}


export class DiskController {


    /**Gets disk utilization result */
    private static getResult() {
        let myPromise : Promise<DiskResult>;
        let myObj = this;
        myPromise =  new Promise<DiskResult>((resolve,reject) => {
          async function _getData() {
            let result = new DiskResult();
            try {
                //Get all disk size
                let dir = process.cwd() + '\\app';
                let myDisk = new Disk(dir);
                await myDisk.init();
                result.totalSize = myDisk.getTotalSize(); 
        
                //Get disk size of ressources
                dir = process.cwd() + '\\app\\public\\images';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                result.systemSize = result.totalSize - myDisk.getTotalSize();
                result.ressourcesSize = myDisk.getTotalSize();
        
        
                //IMAGES
                dir = process.cwd() + '\\app\\public\\images';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);
                }
                //VIDEOS
        
                //DOCUMENTS
        
                //Return the data
                result.disk.push(['system', result.systemSize]);
                result.disk.push(['ressources', result.ressourcesSize]);
                result.images.push(['images', myDisk.getInUseSize(), myDisk.getNotInUseSize() ]);
                result.removableImagesSize = myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+result.removableImagesSize;
                resolve(result);
            } catch(error) {
               reject(new DiskResult());
            }
          }
          _getData();
        });
        return myPromise;

    }    

    /**Gets all available roles */
    static scan = async(req: Request, res: Response, next: NextFunction) => {  
        let result = await DiskController.getResult();
        console.log(result.filesToRemove);
        result.filesToRemove = [];
        res.json(result);
    }

    /** Role attach parameter validation */
    static scanChecks() {
        return [
            Middleware.validate()
        ]
    }    


    /**Gets all available roles */
    static optimize = async(req: Request, res: Response, next: NextFunction) => {  
        console.log("RUNNING OPTIMIZE !!!!!!!!!!!!!!!!!");
        //Get current list of files to delete
        let result = await DiskController.getResult();
        for (let file of result.filesToRemove) {
            console.log("REMOVE",file);
            try {
                fs.unlinkSync(file);
            } catch (error) {
                console.log(error)
            }
        }
        result = await DiskController.getResult();
        result.filesToRemove = [];
        console.log(result);
        res.json(result);
        res.json(new DiskResult());
    }
    static optimizeChecks() {
        return [
            Middleware.validate()
        ]
    }  

    /**Gets all available videos */
    static getVideos = async(req: Request, res: Response, next: NextFunction) => { 
        let dir = process.cwd() + '\\app\\public\\videos';
        let myDisk = new Disk(dir);
        res.send(myDisk.getFileListLink(dir));
    }

    /** Role attach parameter validation */
    static getVideosChecks() {
        return [
            Middleware.validate()
        ]
    }  

}