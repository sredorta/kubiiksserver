import {Request, Response, NextFunction} from 'express'; //= require('express');
import { Middleware } from '../middleware/common';
import { User } from '../models/user';

import fs from 'fs';
import path from 'path';
import {body} from 'express-validator/check';

import { Setting } from '../models/setting';
import {Op} from "sequelize";
import { ArticleTranslation } from '../models/article_translation';
import { Email } from '../models/email';
import { Article } from '../models/article';
import { AppConfig } from '../utils/Config';
import passport from "passport";
import { EmailTranslation } from '../models/email_translation';


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
    date:number =0;
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
    getFileListLink() {
        let result : string[] = [];
        for (let file of this.files) {
            let link = file.filename;
            link = link.replace(/^.*\\public\\/,AppConfig.api.host + ":" + AppConfig.api.port + '/public/');
            link = link.replace(/\\/g,'/')
            result.push(link);
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
                        tmp.date = Math.floor(stats.birthtimeMs);
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
                /**Order by creation date */
                myObj.files.sort((a,b) => {return (a.date>b.date)?1:-1});
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
                found = await EmailTranslation.findOne({where:{content:{[Op.like]:'%'+file.basename+'%'}}});
                if (found) resolve(true);
                found = await EmailTranslation.findOne({where:{header:{[Op.like]:'%'+file.basename+'%'}}});
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

    /**Ressources images files size */
    imagesSize : number = 0;

    /**Ressources  videos files size */
    videosSize : number = 0;

    /**removable total file size */
    removableSize : number = 0;

    /**Disk chart */
    disk : any[] = [];

    /**Images chart */
    videos : any[] = [];
    /**Removable images Size */
    removableVideosSize : number = 0;

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
                result.systemSize = myDisk.getTotalSize();
        
        
                //IMAGES
                dir = process.cwd() + '\\app\\public\\images\\defaults';
                myDisk = new Disk(dir);
                await myDisk.init();
                result.images.push(['defaults', myDisk.getInUseSize() ]);

                //Defaults is not considered as we add it in the system
                dir = process.cwd() + '\\app\\public\\images\\content';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);  
                }
                result.imagesSize = result.imagesSize + myDisk.getTotalSize();
                result.removableImagesSize = result.removableImagesSize + myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.images.push(['content', myDisk.getTotalSize() ]);

                dir = process.cwd() + '\\app\\public\\images\\blog';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);  
                }
                result.imagesSize = result.imagesSize + myDisk.getTotalSize();
                result.removableImagesSize = result.removableImagesSize + myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.images.push(['blog', myDisk.getTotalSize() ]);

                dir = process.cwd() + '\\app\\public\\images\\email';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);  
                }
                result.imagesSize = result.imagesSize + myDisk.getTotalSize();
                result.removableImagesSize = result.removableImagesSize + myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.images.push(['email', myDisk.getTotalSize() ]);


                dir = process.cwd() + '\\app\\public\\images\\products';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);  
                }
                result.imagesSize = result.imagesSize + myDisk.getTotalSize();
                result.removableImagesSize = result.removableImagesSize + myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.images.push(['products', myDisk.getTotalSize() ]);


                //VIDEOS
                console.log("PROCESSING VIDEOS !!!!!!!!!!!!!!");

                dir = process.cwd() + '\\app\\public\\videos\\blog';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    console.log(file);
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);
                }
                result.videosSize = result.videosSize + myDisk.getTotalSize();
                result.removableVideosSize = result.removableVideosSize+myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.videos.push(['blog', myDisk.getTotalSize() ]);
 
                dir = process.cwd() + '\\app\\public\\videos\\content';
                //Now find all images create a list
                myDisk = new Disk(dir);
                await myDisk.init();
                //Find if file is used
                for (let file of myDisk.files) {
                    console.log(file);
                    file.inUse = await Disk.fileInUse(file);
                    if (!file.inUse)
                        result.filesToRemove.push(file.filename);
                }
                result.videosSize = result.videosSize + myDisk.getTotalSize();
                result.removableVideosSize = result.removableVideosSize+myDisk.getNotInUseSize();
                result.removableSize = result.removableSize+myDisk.getNotInUseSize();
                result.videos.push(['content', myDisk.getTotalSize() ]); 
                
                //Update totals
                result.systemSize = result.totalSize - result.videosSize - result.imagesSize;

                //DOCUMENTS
        
                //Return the data
                result.disk.push(['used', result.totalSize - result.removableSize]);
                result.disk.push(['not used', result.removableSize]);




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
        try {
            await myDisk.init();
            res.send(myDisk.getFileListLink());
        } catch(error) {
            console.log(error);
            res.send([]);
        }    
    }

    /** Role attach parameter validation */
    static getVideosChecks() {
        return [
            Middleware.validate()
        ]
    }  

    /**Gets all available images */
    static getImages = async(req: Request, res: Response, next: NextFunction) => { 
        let dir = process.cwd() + '\\app\\public\\images\\' + req.body.disk;
        let myDisk = new Disk(dir);
        try {
            await myDisk.init();
            res.send(myDisk.getFileListLink());
        } catch(error) {
            console.log(error);
            res.send([]);
        }
    }

    /** Role attach parameter validation */
    static getImagesChecks() {
        return [
            body('disk').exists().withMessage('exists').isString(),
            Middleware.validate()
        ]
    }  

    /**Uploads image to content folder and returns imageUrl for angular-editor*/
    static uploadImageToContent = async (req: Request, res: Response, next:NextFunction) => {
        res.send({imageUrl: "https://localhost:3000/public/images/content/" + req.file.filename});  
    }

    /**Uploads image to blog folder and returns imageUrl for angular-editor*/
    static uploadImageToBlog = async (req: Request, res: Response, next:NextFunction) => {
        res.send({imageUrl: "https://localhost:3000/public/images/blog/" + req.file.filename});  
    }


    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToEmail = async (req: Request, res: Response, next:NextFunction) => {
        res.send({imageUrl: "https://localhost:3000/public/images/email/" + req.file.filename});  
    }    

    /**Uploads image to email folder and returns imageUrl for angular-editor*/
    static uploadImageToDefaults = async (req: Request, res: Response, next:NextFunction) => {
        res.send({imageUrl: "https://localhost:3000/public/images/defaults/" + req.file.filename});  
    }    

    /**Uploads video to the content folder*/
    static uploadVideoToContent = async (req: Request, res: Response, next:NextFunction) => {
        res.send({videoUrl: "https://localhost:3000/public/videos/content/" + req.file.filename});  
    } 
    /**Uploads video to the blog folder*/
    static uploadVideoToBlog = async (req: Request, res: Response, next:NextFunction) => {
        res.send({videoUrl: "https://localhost:3000/public/videos/blog/" + req.file.filename});  
    }     
}