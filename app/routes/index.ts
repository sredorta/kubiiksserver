//Define all API routes here !!!!
import express from 'express';
import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import {SettingController} from '../controllers/setting.controller';
import {AuthController} from '../controllers/auth.controller';
import {RoleController} from '../controllers/role.controller';
import { ContactController } from '../controllers/contact.controller';
import { ArticleController } from '../controllers/article.controller';

import { messages } from "../middleware/common";
import {Middleware} from '../middleware/common';
import {HttpException} from  '../classes/HttpException';
import https from 'https';
import passport from "passport";
import {join} from 'path';

import jwt from "jsonwebtoken";
import {AppConfig} from '../utils/config';

import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {User} from '../models/user';
import {Helper} from '../classes/Helper';
import { Product } from '../models/product';
import {check, validationResult,body} from 'express-validator/check';
import uploads from '../utils/multer';
import { InitController } from '../controllers/init.controller';
import { EmailController } from '../controllers/email.controller';
import { NotificationController } from '../controllers/notification.controller';
import { AlertController } from '../controllers/alert.controller';
import { StatController } from '../controllers/stat.controller';
import { DiskController } from '../controllers/disk.controller';
import { NewsletterController } from '../controllers/newsletter.controller';
import { PageController } from '../controllers/page.controller';
import { CathegoryController } from '../controllers/cathegory.controller';




export class Routes {    
  public io:any;

  public routes(app:Router): void {
  

    /**Sends the sitemap that is dynamic modified */
    app.route('/sitemap.xml')
    .get((req, res) => {
      console.log("We are sending the sitemap !", process.cwd() + '/app/sitemap.xml');
      res.sendFile(process.cwd() + '/app/sitemap.xml');
    });

    /**Gets api description */
    app.route('/api/description')
        .get((req: Request, res: Response, next: NextFunction) => {   
          User.scope("details").findByPk(1).then(res => {
            if (res)
              console.log(JSON.parse(JSON.stringify(res)));
          });

          res.status(200).json({
                message: messages.description,
                api:AppConfig.api
            });
    });

    /**Returns if connection to server works */
    app.route('/api/connected')
        .get((req:Request, res: Response, next: NextFunction) => {
          res.status(200).json({status:true});
    });

    //ACCESS CONTROL:
    // use Middleware.registered() for actions required access standard or admin
    // use Middleware.registered() + Middleware.hasAdminRights() for actions requiring admin rights


    //NAMING CONVENTIONS ENDPOINTS
    //  /api/<plural>/all        GET     : getAll (returns all records)
    //  /api/<plural>/get/id     POST    : getOneById (returns found record or null)
    //  /api/<plural>/get/field  POST    : getOneByField
    //  /api/<plural>/create     POST    : add  (returns the new record)
    //  /api/<plural>/delete     DELETE  : remove (by Id)

    
    /////////////////////////////////////////////////////////////////
    // ON PUSH NOTIFICATIONS
    ////////////////////////////////////////////////////////////////
    /**Stores onPush notification data to user if accepted */
    app.route('/api/notification/settings/user')
      .post(passport.authenticate('jwt',{session: false}),NotificationController.settingsUserChecks(), NotificationController.settingsUser);
    
    /**Stores onPush notification of session if accepted */
    app.route('/api/notification/settings/session')
      .post(NotificationController.settingsSessionChecks(), NotificationController.settingsSession);



    /////////////////////////////////////////////////////////////////
    // INIT CONTROLLER PART
    ////////////////////////////////////////////////////////////////
    app.route('/api/initial')
      .post(Middleware.getUserFromToken(), InitController.checks(),InitController.get);
 
    /**Gets all pages and articles from pages, this is done on serviceWorker only */  
    app.route('/api/initial/full')
      .get(Middleware.getUserFromToken(), InitController.getFull);

    /////////////////////////////////////////////////////////////////
    // SETTINGS CONTROLLER PART
    //  This table is mapped from the config.json on the server start
    //  FE can only read this table to has access to the server config
    ////////////////////////////////////////////////////////////////

    /**Gets all setting values with current language translated value*/
    app.route('/api/setting/all')
      .get(SettingController.getAll);

    /**Saves value for the setting with translations if required */  
    app.route('/api/setting/update')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasKubiiksRights(),SettingController.updateChecks(),SettingController.update);

    app.route('/api/setting/update-dialog')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasContentRights(),SettingController.updateDialogChecks(),SettingController.updateDialog);
     
    /////////////////////////////////////////////////////////////////
    // PAGE CONTROLLER PART
    // Pages are used for SEO data
    ////////////////////////////////////////////////////////////////      
    app.route('/api/page/update')
    .post(passport.authenticate('jwt',{session: false}),Middleware.hasKubiiksRights(),PageController.updateChecks(),PageController.update);

    app.route('/api/page/all')
    .get(passport.authenticate('jwt',{session: false}),Middleware.hasKubiiksRights(),PageController.getAll);


    /////////////////////////////////////////////////////////////////
    // ARTICLE CATHEGORY CONTROLLER
    // Pages are used for SEO data
    ////////////////////////////////////////////////////////////////      
    app.route('/api/article/cathegory/all')
    .get(passport.authenticate('jwt',{session: false}),CathegoryController.getAll);




    //////////////////////////////////////////////////////////////////
    // Email part
    //////////////////////////////////////////////////////////////////
    /**Gets all email templates */
    app.route('/api/email/all')
      .get(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(),EmailController.getAll);

    /**Returns the html of the email template */  
    app.route('/api/email/update')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(),EmailController.updateChecks(),EmailController.update);

    /**Checks that email service is up and running */
    app.route('/api/email/check')
      .get(EmailController.emailCheck);

    /**Creates a new email template */
    app.route('/api/email/create')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(), EmailController.createChecks(),EmailController.create);  

    /**Deletes an email template */
    app.route('/api/email/delete')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(), EmailController.deleteChecks(),EmailController.delete);  

    /**Sends email to the given recipients */
    app.route('/api/email/send')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(), EmailController.sendChecks(),EmailController.send);      


    /////////////////////////////////////////////////////////////////
    // STATS CONTROLLER PART
    ////////////////////////////////////////////////////////////////
    /**Saves the current stat */
    app.route('/api/stats/save')
      .post(StatController.saveChecks(),StatController.save);      

    /**Return current stats of the given days analysis */
    app.route('/api/stats/analyze')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasStatsRights(),StatController.analyzeChecks(),StatController.analyze);   

    /**Deletes all stats */
    app.route('/api/stats/delete')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasStatsRights(),StatController.deleteChecks(),StatController.delete);   


    /////////////////////////////////////////////////////////////////
    // DISK CONTROLLER PART
    ////////////////////////////////////////////////////////////////   
    /**Returns current disk utilization*/
    app.route('/api/disk/scan')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasAdminRights(),DiskController.scanChecks(),DiskController.scan);   

    /**Removes unused ressources and returns new disk utilization*/
    app.route('/api/disk/optimize')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasAdminRights(),DiskController.optimizeChecks(),DiskController.optimize);   

    /**Gets all videos on the server */  
    app.route('/api/disk/videos/all')
      .get(DiskController.getVideosChecks(),DiskController.getVideos);   

    /**Gets all videos on the server */  
    app.route('/api/disk/images/all')
      .post(DiskController.getImagesChecks(),DiskController.getImages);   

    /**Uploads to avatar folder */ 
    app.route('/api/disk/images/upload/avatar')
      .post(passport.authenticate('jwt',{session: false}),uploads.imagesAvatar.single('file'), DiskController.uploadImageToAvatar);

    /**Uploads to kubiiks folder */ 
    app.route('/api/disk/images/upload/kubiiks')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasKubiiksRights(),uploads.imagesKubiiks.single('file'), DiskController.uploadImageToKubiiks);


    /**Uploads to content folder */ 
    app.route('/api/disk/images/upload/content')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasContentRights(),uploads.imagesContent.single('file'), DiskController.uploadImageToContent);

    /**Uploads image to blog folder */
    app.route('/api/disk/images/upload/blog')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasBlogRights(),uploads.imagesBlog.single('file'), DiskController.uploadImageToBlog);

    /**Uploads image to blog folder */
    app.route('/api/disk/images/upload/email')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasEmailRights(),uploads.imagesEmail.single('file'), DiskController.uploadImageToEmail);

    /**Uploads image to blog folder */
    app.route('/api/disk/images/upload/defaults')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasKubiiksRights(),uploads.imagesDefaults.single('file'), DiskController.uploadImageToDefaults);

    /**Uploads videos to content */
    app.route('/api/disk/videos/upload/content')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasContentRights(),uploads.videosContent.single('file'), DiskController.uploadVideoToContent);
   
    /**Uploads videos to blog */
    app.route('/api/disk/videos/upload/blog')
      .post(passport.authenticate('jwt',{session: false}),Middleware.hasBlogRights(),uploads.videosBlog.single('file'), DiskController.uploadVideoToBlog);


    /////////////////////////////////////////////////////////////////
    // CONTACT CONTROLLER PART
    ////////////////////////////////////////////////////////////////
    /** Send email from contact form*/
    app.route('/api/contact/email')
      .post(ContactController.sendEmailChecks(), ContactController.sendEmail);  



    /////////////////////////////////////////////////////////////////
    // AUTH CONTROLLER PART
    ////////////////////////////////////////////////////////////////

    //Signup
    app.route('/api/auth/signup')
      .post(Middleware.unregistered(),AuthController.signupChecks(),AuthController.signup);

    //Login
    app.route('/api/auth/login')
      .post(Middleware.unregistered(),AuthController.loginChecks(),passport.authenticate('local',{session: false}),AuthController.loginChecks(), AuthController.login);

    app.route('/api/auth/facebook')
      .get(Middleware.unregistered(),passport.authenticate('facebook', {scope:['email'], session:false}));

    app.route('/api/auth/facebook/callback')
    .get(passport.authenticate('facebook', {failureRedirect: '/api/auth/oauth2/callback/fail' }), AuthController.oauth2Success);

    app.route('/api/auth/google')
      .get(Middleware.unregistered(),passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'], session:false}));

    app.route('/api/auth/google/callback')
    .get(passport.authenticate('google', {failureRedirect: '/api/auth/oauth2/callback/fail' }), AuthController.oauth2Success);


    //Fail callback to any oauth2 : We just redirect to the login page
    app.route('/api/auth/oauth2/callback/fail')
      .get(AuthController.oauth2Fail);

    /**Route called after using social passports to check if missing any required field and ask user to fill any required and accept conditions */  
    app.route('/api/auth/oauth2/validate')
      .get(passport.authenticate('jwt',{session: false}),AuthController.oauth2ValidateFields);

    /**Route called after using social passports to save updates. At least terms needs to be checked*/  
    app.route('/api/auth/oauth2/update')
    .post([passport.authenticate('jwt',{session: false}),AuthController.oauth2UpdateFieldsChecks()],AuthController.oauth2UpdateFields); //Validation needs to be performed after auth in order to get access to req.user.id


    /** getAuthUser or get current logged in user data */
    app.route('/api/auth/get')
      .get(passport.authenticate('jwt',{session: false}),AuthController.getAuthUser);


    /** updateAuthUser or update current logged in user data */
    app.route('/api/auth/update')
      .post(passport.authenticate('jwt',{session: false}),AuthController.updateAuthUserChecks(),AuthController.updateAuthUser);

    /** deleteAuthUser: delete current logged in user data */
    app.route('/api/auth/delete')
      .delete(passport.authenticate('jwt',{session: false}),AuthController.deleteAuthUser);



    /**Email validation endpoint by providing id and key */
    app.route('/api/auth/validate-email')
      .post(Middleware.unregistered(), AuthController.emailValidationChecks(),AuthController.emailValidation);

    /** Reset password and send new one by email*/
    app.route('/api/auth/reset-password/email')
       .post(Middleware.unregistered(),AuthController.resetPasswordByEmailChecks(), AuthController.resetPasswordByEmail);  
    
    /** Re-establish password from email*/
    app.route('/api/auth/establish-password')
       .post(Middleware.unregistered(),AuthController.establishPasswordChecks(), AuthController.establishPassword);  
  


    /////////////////////////////////////////////////////////////////
    // USER CONTROLLER PART
    ////////////////////////////////////////////////////////////////

    /**Get all user details. Admin or 'users' required */
    app.route("/api/user/all")
        .get(passport.authenticate('jwt',{session: false}),Middleware.hasUsersRights(),UserController.getAll);

    /** Removes specific user. Admin or 'users' required  */    
    app.route('/api/user/delete')
        .post(passport.authenticate('jwt',{session: false}),Middleware.hasUsersRights(),UserController.deleteChecks(),UserController.delete)           

    /** Updates specific user. Admin or 'users' required */    
    app.route('/api/user/update')
        .post(passport.authenticate('jwt',{session: false}),Middleware.hasUsersRights(),UserController.updateChecks(),UserController.update)           


    /**Get user details by id. Admin or 'users' required */
    app.route('/api/user/get/id')
        .post(passport.authenticate('jwt',{session: false}),Middleware.hasUsersRights(),UserController.getUserByIdChecks(),UserController.getOneById);

    /**Get all available roles. Admin or 'users' required */
    app.route("/api/role/all")
        .get(passport.authenticate('jwt',{session: false}),Middleware.hasUsersRights(),RoleController.getAll);        

    /** Attaches a role to a specific user. Admin required */   
    app.route('/api/role/attach')
        .post(passport.authenticate('jwt',{session: false}),Middleware.hasAdminRights(),RoleController.attachChecks(),RoleController.attach)

    /** Detaches a role from specific user. Admin required */    
    app.route('/api/role/detach')
        .post(passport.authenticate('jwt',{session: false}),Middleware.hasAdminRights(),RoleController.detachChecks(),RoleController.detach)   
        

    /////////////////////////////////////////////////////////////////
    // NEWSLETTER CONTROLLER PART
    ////////////////////////////////////////////////////////////////

    /** Subscribes to the newsletter  */    
    app.route('/api/newsletter/subscribe')
      .post(NewsletterController.subscribeChecks(),NewsletterController.subscribe)           

    /** Unsubscribes from the newsletter */    
    app.route('/api/newsletter/unsubscribe')
      .post(NewsletterController.unsubscribeChecks(),NewsletterController.unsubscribe)           
        


    /////////////////////////////////////////////////////////////////
    // ALERT PART
    ////////////////////////////////////////////////////////////////  
    /**Get all user details. Admin or 'users' required */
    app.route("/api/alert/all")
        .get(passport.authenticate('jwt',{session: false}),AlertController.getAll);
    /** Updates alert of user */    
    app.route('/api/alert/update')
        .post(passport.authenticate('jwt',{session: false}),AlertController.updateChecks(),AlertController.update)           
    /** Removes specific alert.  */    
    app.route('/api/alert/delete')
        .post(passport.authenticate('jwt',{session: false}), AlertController.deleteChecks(),AlertController.delete)           



    /////////////////////////////////////////////////////////////////
    // HANDLE ARTICLES
    //////////////////////////////////////////////////////////////// 

    /**Gets one article by id */
    app.route('/api/article/id')
    .post(ArticleController.getByIdChecks(),ArticleController.getById);

    /**Gets all articles */
    app.route('/api/article/all')
      .get(ArticleController.getAll);
   
    /**Deletes article by id with all the translations, you need to see admin or content or blog to access here*/ 
    app.route('/api/article/delete')
      .post(passport.authenticate('jwt',{session: false}),ArticleController.deleteChecks(), ArticleController.delete);

    /**Creates article in the cathegory with all the translations, you need to see admin or content to access here*/ 
    app.route('/api/article/create')
      .post(passport.authenticate('jwt',{session: false}),ArticleController.createChecks(), ArticleController.create);

    /**Updates content article, you need to see admin or content to access here*/ 
    app.route('/api/article/update')
      .post(passport.authenticate('jwt',{session: false}),ArticleController.updateChecks(), ArticleController.update);

    /**Moves article up*/ 
    app.route('/api/article/order/up')
      .post(passport.authenticate('jwt',{session: false}),ArticleController.moveChecks(), ArticleController.moveUp);


    /**Moves article down*/ 
    app.route('/api/article/order/down')
      .post(passport.authenticate('jwt',{session: false}),ArticleController.moveChecks(), ArticleController.moveDown);



    /////////////////////////////////////////////////////////////////
    // HANDLE NON EXISTING ROUTES
    ////////////////////////////////////////////////////////////////
    //This part is disabled as it interferes with public folder !
    /*app.route('*')
      .get(function(req, res, next){
        next(new HttpException(404, messages.apiRouteNotFound, null));
        });*/
    app.route('*')
      .post(function(req, res, next){
          next(new HttpException(404, messages.apiRouteNotFound, null));
      });       

    }
}