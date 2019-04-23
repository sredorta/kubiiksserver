//Define all API routes here !!!!
import express from 'express';
import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import {SettingController} from '../controllers/setting.controller';
import {AuthController} from '../controllers/auth.controller';
import { messages } from "../middleware/common";
import {Middleware} from '../middleware/common';
import * as passportConfig from "../passports/local";
import passport from "passport";
import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {User} from '../models/user';
import {Account} from '../models/account';
import {Helper} from '../classes/Helper';

export class Routes {    
  //Call all controllers required here  


  public routes(app:Router): void {          


    app.route('/')
        .get((req: Request, res: Response, next: NextFunction) => {            
            res.status(200).send({
                message: messages.description
            });
    });

    //ACCESS CONTROL:
    // use Middleware.registered() for actions required access standard or admin
    // use Middleware.registered() + Middleware.admin() for actions requiring admin rights


    //NAMING CONVENTIONS ENDPOINTS
    //  /api/<plural>/all        GET     : getAll (returns all records)
    //  /api/<plural>/get/id     POST    : getOneById (returns found record or null)
    //  /api/<plural>/get/field  POST    : getOneByField
    //  /api/<plural>/create     POST    : add  (returns the new record)
    //  /api/<plural>/delete     DELETE  : remove (by Id)

 
    /////////////////////////////////////////////////////////////////
    // SETTINGS CONTROLLER PART
    //  This table is mapped from the config.json on the server start
    //  FE can only read this table to has access to the server config
    ////////////////////////////////////////////////////////////////
    app.route('/api/settings/all')
      .get(SettingController.getAll);
    app.route('/api/settings/get/key')
      .post(SettingController.getByKeyChecks(),SettingController.getByKey);

    app.route('/api/settings/email')
      .get(SettingController.emailCheck);

    /////////////////////////////////////////////////////////////////
    // AUTH CONTROLLER PART
    ////////////////////////////////////////////////////////////////

    //Signup
    app.route('/api/auth/signup')
      .post(AuthController.signupChecks(),AuthController.signup);




      
    //Login
    app.route('/api/auth/login')
      .post([passport.authenticate('local',{session: false}),AuthController.loginChecks()], AuthController.login);
    //app.route('/api/auth/login')
      //.post(AuthController.loginChecks(),AuthController.login);      
      //.get(passportConfig.isAuthenticated,AuthController.login);

   // app.post('/api/auth/login', passport.authenticate('local',{session: false}), AuthController.login);  
/*    app.route('/api/auth/login')
      .post( AuthController.login);*/
/*      passport.authenticate('local', {session:false}, (err, user,info) => {
        console.log("We are here in authenticate !!!!");
        console.log("User is: " + user.email);
    }),*/


    //getAuthUser
    app.route('/api/auth/get')
      .get(Middleware.registered(),AuthController.getAuthUser);

    //Email validation endpoint
    app.route('/api/auth/validate-email')
      .get(AuthController.emailValidation);

    //Reset password and send new one by email
    app.route('/api/auth/reset-password/email')
       .post(AuthController.resetPasswordByEmailChecks(), AuthController.resetPasswordByEmail);  

    //Reset password and send new one by mobile
    app.route('/api/auth/reset-password/mobile')
       .post(AuthController.resetPasswordByMobileChecks(), AuthController.resetPasswordByMobile);  


    //Debug only to be removed
    app.route("/api/test")
      .get(UserController.tmp);
    
    /////////////////////////////////////////////////////////////////
    // USER CONTROLLER PART
    ////////////////////////////////////////////////////////////////
        
        const router = Router();

        //Get all users
        //TODO remove the checkJwt
        app.route("/api/users/all")
          .get(UserController.getAll);
        //.get(Middleware.registered(),UserController.getAll);

        //Get user by ID
        app.route('/api/users/get/id')
        .post([passport.authenticate('jwt',{session: false}),UserController.getUserByIdChecks()],UserController.getOneById);

        //Create new user
        app.route('/api/usercreate')
        .get(UserController.create);







        



    }
}