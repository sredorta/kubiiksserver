import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from "passport-jwt";
import passportFacebook from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {messages} from '../middleware/common';
import { Helper } from './Helper';
import {AppConfig} from '../utils/Config';


import { Request, Response, NextFunction } from "express";
import {HttpException} from '../classes/HttpException';
import {User} from '../models/user';
import { isNamedExports } from 'typescript';



export class Passport {

    //Initialize passports
    public static init() {
        //PASSPORT PART !!!!!!
        passport.serializeUser(function(user, done) {
            done(null, user);
        });
    
        passport.deserializeUser(function(obj, done) {
            done(null, obj);
        });
    }

    //Passport that validates login from local system
    public static local() {
        console.log("Enabling local passport");
        passport.use('local',new passportLocal.Strategy({
            usernameField: 'username',
            passwordField: 'password',
        }, 
        function (username, password, cb)  {
            //Find that we have an user matching username and passport
            console.log("USING LOCAL STRATEGY !!!" + Helper.getSharedSetting("login_username"));
            let field = Helper.getSharedSetting("login_username"); 
            if (!field ){
                return cb(new HttpException(500, "Invalid 'login_username' config field : " + field  ,null), false);
            }
            let query :any =  {};
            query[field] = username;
            console.log(query);
            User.scope("full").findOne({
                    where: query
                }).then((user:User|null)=> {
                    //Check user existance
                    if (!user) {
                        return cb(new HttpException(401, messages.authInvalidCredentials ,null), false);
                    }
                    //Check password valid
                    if (!user.checkPassword(password)){
                        console.log("Passwords not matching !!!!");
                        return cb(new HttpException(401, messages.authInvalidCredentials ,null), false);
                    }
                    //Success 
                    return cb(null, user);
                }).catch((error: Error) => {
                    return cb(error);
                });
        }));
    }

    //Passport to decode JWT and pass user to next middleware
    public static jwt() {
        console.log("Enabling jwt passport");
        passport.use('jwt',new passportJWT.Strategy({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey : AppConfig.auth.jwtSecret
        },
        async function (jwtPayload, cb) {
            console.log("We are here !!!!");
            console.log(jwtPayload);
            try {
                const user = await User.findByPk(jwtPayload.id);
                if (!user) {
                    console.log(user);
                    return cb(new HttpException(401, messages.authTokenInvalid, null), false);
                }
                return cb(null, user);
            }
            catch (error) {
                return cb(error);
            }

            }
        ));
    }
    public static facebook() {
      passport.use('facebook', new passportFacebook.Strategy({
        clientID: AppConfig.auth.facebook.clientId,
        clientSecret: AppConfig.auth.facebook.clientSecret,
        callbackURL: "https://localhost:3000/api/auth/facebook/callback",
        passReqToCallback:true,
        profileFields: ['id', 'emails', 'name', "link","locale","timezone"]
      },
      function(req, accessToken, refreshToken, profile, cb) {
        console.log("We are in facebook passport !!!!!!!!!!!!!!!!!");
        //Now we need to see if user already exists in database and if not then add it
        async function _work() {
            //Check that we got all the required minimum fields
            if (!profile._json.email)
              return cb(null,null,null);

            let myUser = await User.findOne({where: {email:profile._json.email}});
            if (myUser) {
              console.log("Overriding user data with facebook data !!!");
              //We already have an user so just update fields if required
              if (profile._json.first_name)
                myUser.firstName = profile._json.first_name;
              if (profile._json.last_name)
                myUser.lastName = profile._json.last_name;
                myUser.isSocial = true;
                myUser.facebookId = profile.id;
                myUser.facebookToken = accessToken;
                myUser = await myUser.save();
                return cb(null, myUser);
            }
            //LIKE SIGNUP
            console.log("Creating user data with facebook data !!!");
            //We got a new user so we register him
            myUser = await User.create({
              firstName: profile._json.first_name,
              lastName: profile._json.last_name,
              email: profile._json.email,
              emailValidationKey: Helper.generateRandomString(30),
              mobileValidationKey: Helper.generateRandomNumber(4),
              isSocial:true,
              facebookId : profile.id,
              facebookToken: accessToken            
            });
            //Attach admin role if required
            if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
              await myUser.attachRole("admin"); 
            }           
            //return cb(new HttpException(100, "SEND THE TOKEN PLEASE", null), false);

            console.log("Sending user to callback");
            //return cb(new HttpException(400, "HERE WE SHOULD PROVIDE TOKEN !", null), false);
            return cb(null,myUser);
        }
        _work();
      }
    ));
  }
}