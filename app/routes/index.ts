//Define all API routes here !!!!
import express from 'express';
import {Request, Response, NextFunction, Router} from "express";
import {UserController} from '../controllers/user.controller';
import {SettingController} from '../controllers/setting.controller';
import {AuthController} from '../controllers/auth.controller';
import { messages } from "../middleware/common";
import {Middleware} from '../middleware/common';
import {HttpException} from  '../classes/HttpException';
import https from 'https';
import passport from "passport";
import jwt from "jsonwebtoken";
import {AppConfig} from '../utils/Config';

import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {User} from '../models/user';
import {Helper} from '../classes/Helper';
import { Product } from '../models/product';
import {check, validationResult,body} from 'express-validator/check';



export class Routes {    
  //Call all controllers required here  

  /*
  agentOptions = {
    host: '127.0.0.1'
    , port: '3000'
    , path: '/'
    , rejectUnauthorized: false
  };
  agent = https()*/

  

  public routes(app:Router): void {


    app.route('/api/test')
    .post(UserController.testchecks(), UserController.test
    );
  

/*      try {
        console.log (validationResult(req));
        let errors = await req.getValidationResult();//req).throw();
        console.log(errors);
        //const errors = req.getValidationResult();
        //await Product.create({field1:"test1", field2:"kk"});
        //await Product.create({field1:"test2", field2:"kk"});

        res.status(200).send({
          message: "COMPLETED !"
        });
      } catch(error) {
        console.log(JSON.stringify(error.array));
        next(new HttpException(500, error.message, error.errors));
      }*/


  


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
      .post([AuthController.loginChecks(),passport.authenticate('local',{session: false}),AuthController.loginChecks()], AuthController.login);

    app.route('/api/auth/facebook')
      .get(passport.authenticate('facebook', {scope:['email'], session:false}));

    app.route('/api/auth/facebook/callback')
    .get(passport.authenticate('facebook', {failureRedirect: '/api/auth/oauth2/callback/fail' }), AuthController.oauth2Success);

    app.route('/api/auth/google')
      .get(passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/userinfo.profile','https://www.googleapis.com/auth/userinfo.email'], session:false}));

    app.route('/api/auth/google/callback')
    .get(passport.authenticate('google', {failureRedirect: '/api/auth/oauth2/callback/fail' }), AuthController.oauth2Success);


    //Fail callback to any oauth2
    //We just redirect to the login page
    app.route('/api/auth/oauth2/callback/fail')
      .get(AuthController.oauth2Fail);

    /**Route called after using social passports to check if missing any required field and ask user to fill any required and accept conditions */  
    app.route('/api/auth/oauth2/validate')
      .get(passport.authenticate('jwt',{session: false}),AuthController.oauth2ValidateFields);

    /**Route called after using social passports to save updates, it has exactly same checks as signup except for password*/  
    app.route('/api/auth/oauth2/update')
    .post([passport.authenticate('jwt',{session: false}),AuthController.oauth2UpdateFieldsChecks()],AuthController.oauth2UpdateFields); //Validation needs to be performed after auth in order to get access to req.user.id


    //getAuthUser
    app.route('/api/auth/get')
      .get(passport.authenticate('jwt',{session: false}),AuthController.getAuthUser);


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
    app.route("/api/users/test")
    .get(UserController.testRoles);

        //Get all users
        //TODO remove the checkJwt
        app.route("/api/users/all")
          //.get([passport.authenticate('jwt',{session: false})],UserController.getAll);
          .get(UserController.getAll);

        //Get user by ID
        app.route('/api/users/get/id')
        .post(UserController.getUserByIdChecks(),UserController.getOneById);

        //Create new user
        app.route('/api/usercreate')
        .get(UserController.create);

    /////////////////////////////////////////////////////////////////
    // HANDLE NON EXISTING ROUTES
    ////////////////////////////////////////////////////////////////
    app.route('*')
      .get(function(req, res, next){
        next(new HttpException(404, messages.apiRouteNotFound, null));
        });
    app.route('*')
      .post(function(req, res, next){
          next(new HttpException(404, messages.apiRouteNotFound, null));
      });        

    }
}