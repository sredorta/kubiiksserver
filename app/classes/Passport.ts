import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from "passport-jwt";
import passportFacebook from "passport-facebook";
import passsportGoogle from "passport-google-oauth";
import {ExtractJwt} from "passport-jwt";
import {messages} from '../middleware/common';
import { Helper } from './Helper';
import {AppConfig} from '../utils/config';


import { Request, Response, NextFunction } from "express";
import {HttpException} from '../classes/HttpException';
import {User} from '../models/user';
import { isNamedExports } from 'typescript';
import { IJwtPayload } from '../controllers/auth.controller';



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

    /**Local login passport */   
    public static local() {
        passport.use('local',new passportLocal.Strategy({
            usernameField: 'username',
            passwordField: 'password',
        }, 
        function (username, password, cb)  {
            //Find that we have an user matching username and passport
            async function _work() {
                let query :any =  {};
                query['email'] = username;
                let myUser = await User.scope("full").findOne({where: query});
                if (!myUser) {
                    return cb(new HttpException(401, messages.authInvalidCredentials ,null), false);
                } else {
                    //Handle throttling
                    if (myUser.failCount>5) {
                        //Check if delta time is ok
                        let deltaT = Math.abs(new Date().getTime() - new Date(myUser.failTimer).getTime());
                        let deltaMinutes = Math.round(deltaT/60000);
                        if (deltaMinutes<2) {
                            //myUser.failCount = myUser.failCount+1;
                            //myUser.failTimer = new Date();
                            return cb(new HttpException(401, messages.authTooManyTrials ,null), false);
                        }

                    }
                    //Check password valid
                    if (!myUser.checkPassword(password)){
                        myUser.failCount = myUser.failCount+1;
                        myUser.failTimer = new Date();
                        await myUser.save();
                        return cb(new HttpException(401, messages.authInvalidCredentials ,null), false);
                    }
                    //Check that account has validated email
                    let tmp = AppConfig.sharedSettings.find(obj=> obj.key=="validation_method");
                    if (tmp)
                        if (tmp.value != "no_validation") {
                            if (myUser.isEmailValidated!= true)
                                return cb(new HttpException(401, messages.authAccountNotActive ,null), false);
                        }
                }
                myUser.passport = "local";
                myUser.failCount=0;
                myUser = await myUser.save();
                return cb(null, myUser);
            }
            _work();
        }));
    }

    /**Passport that decodes jwt and provides user to next middleware */   
    public static jwt() {
        passport.use('jwt',new passportJWT.Strategy({
            jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey : AppConfig.auth.jwtSecret
        },
        async function (jwtPayload: IJwtPayload, cb) {
            try {
                const myUser = await User.findByPk(jwtPayload.id);
                if (!myUser) {
                    return cb(new HttpException(401, messages.authTokenInvalid, null), false);
                }
                //TODO: Validate that all required fields are present if not, return error
                return cb(null, myUser);
            }
            catch (error) {
                return cb(error);
            }

            }
        ));
    }

/*Facebook profile example
    { id: '10219621054623304',
    username: undefined,
    displayName: undefined,
    name:
     { familyName: 'Redorta',
       givenName: 'Sergi',
       middleName: undefined },
    gender: undefined,
    profileUrl: undefined,
    emails: [ { value: 'sergi.redorta@hotmail.com' } ],
    provider: 'facebook',
    _raw: '{"id":"10219621054623304","email":"sergi.redorta\\u0040hotmail.com","last_name":"Redorta","first_name":"Sergi"}',
    _json:
     { id: '10219621054623304',
       email: 'sergi.redorta@hotmail.com',
       last_name: 'Redorta',
       first_name: 'Sergi' } }*/

    /**Facebook passport for login or signup */   
    public static facebook() {
      passport.use('facebook', new passportFacebook.Strategy({
        clientID: AppConfig.auth.facebook.clientId,
        clientSecret: AppConfig.auth.facebook.clientSecret,
        callbackURL: AppConfig.api.kiiserverExtHost + "/api/auth/facebook/callback",
        passReqToCallback:true,
        profileFields: ['id', 'emails', 'name', "link","locale",'photos',"timezone"]
      },
      function(req, accessToken, refreshToken, profile, cb) {
          console.log("IN PASSPORT !!!!!!!!!!!!!!!");
        //Now we need to see if user already exists in database and if not then add it
        async function _work() {
            //Check that we got all the required minimum fields
            if (!profile._json.email)
              return cb(null,null,null);

            //Find user by email or by facebookId and update fields from provider profile
            let myUser = await User.findOne({where: {email:profile._json.email}});      //Find user by email
            if (myUser) {
                if (profile._json.id)  myUser.facebookId = profile._json.id;   
            } else {
                myUser = await User.findOne({where: {facebookId:profile._json.id}});    //Find user by provider id
                if (myUser) {
                    if (profile._json.email) myUser.email = profile._json.email;
                }
            }
            //EQUIVALENT TO LOGIN
            if (myUser) {
                myUser.passport = "facebook";
                myUser = await myUser.save();
                return cb(null, myUser);
            }
            //EQUIVALENT TO SIGNUP
            //We got a new user so we register him
            myUser = await User.create({
              firstName: profile._json.first_name,
              lastName: profile._json.last_name,
              email: profile._json.email,
              language: req.user.language,
              password: User.hashPassword(Helper.generatePassword()), //Generate a random password just in case
              emailValidationKey: Helper.generateRandomString(30),
              mobileValidationKey: Helper.generateRandomNumber(4),
              avatar: profile._json.picture.data.url,
              passport: "facebook",
              facebookId : profile._json.id,
            });
            //Attach admin role if required
            if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
              await myUser.attachRole("admin"); 
            }           
            return cb(null,myUser);
        }
        _work();
      }
    ));
  }

  //Google Profile example
  /*
  { id: '118285710646673394875',
  displayName: 'Sergi Redorta',
  name: { familyName: 'Redorta', givenName: 'Sergi' },
  emails: [ { value: 'sergi.redorta@gmail.com', verified: true } ],
  photos:
   [ { value: 'https://lh3.googleusercontent.com/-OuYh3FZFEtE/AAAAAAAAAAI/AAAAAAAAjVI/p3QqxgzwXgI/photo.jpg' } ],
  provider: 'google',
  _raw: '{\n  "sub": "118285710646673394875",\n  "name": "Sergi Redorta",\n  "given_name": "Sergi",\n  "family_name": "Redorta",\n  "profile": "https://plus.google.com/118285710646673394875",\n  "picture": "https://lh3.googleusercontent.com/-OuYh3FZFEtE/AAAAAAAAAAI/AAAAAAAAjVI/p3QqxgzwXgI/photo.jpg",\n  "email": "sergi.redorta@gmail.com",\n  "email_verified": true,\n  "locale": "fr"\n}',
  _json:
   { sub: '118285710646673394875',
     name: 'Sergi Redorta',
     given_name: 'Sergi',
     family_name: 'Redorta',
     profile: 'https://plus.google.com/118285710646673394875',
     picture: 'https://lh3.googleusercontent.com/-OuYh3FZFEtE/AAAAAAAAAAI/AAAAAAAAjVI/p3QqxgzwXgI/photo.jpg',
     email: 'sergi.redorta@gmail.com',
     email_verified: true,
     locale: 'fr' } }
 */

  /**Google passport for login or signup */   
  public static google() {
    passport.use('google', new passsportGoogle.OAuth2Strategy({
      clientID: AppConfig.auth.google.clientId,
      clientSecret: AppConfig.auth.google.clientSecret,
      callbackURL: AppConfig.api.kiiserverExtHost + "/api/auth/google/callback",
      passReqToCallback:true,
    },
    function(req, accessToken, refreshToken, profile, cb) {
        //Now we need to see if user already exists in database and if not then add it
        async function _work() {
            //Check that we got all the required minimum fields
            if (!profile._json.email)
              return cb(null,null);

            //Find user by email or by facebookId and update fields from provider profile
            let myUser = await User.findOne({where: {email:profile._json.email}});      //Find user by email
            if (myUser) {
                if (profile._json.sub)  myUser.googleId = profile._json.sub;   
            } else {
                myUser = await User.findOne({where: {googleId:profile._json.sub}});    //Find user by provider id
                if (myUser) {
                    if (profile._json.email) myUser.email = profile._json.email;
                }
            }
            //EQUIVALENT TO LOGIN
            if (myUser) {
                //if (profile._json.given_name) myUser.firstName = profile._json.given_name;
                //if (profile._json.family_name) myUser.lastName = profile._json.family_name;
                //TODO save also language that is in _json.locale
                myUser.passport = "google";
                myUser = await myUser.save();
                return cb(null, myUser);
            }
            //EQUIVALENT TO SIGNUP
            //We got a new user so we register him
            myUser = await User.create({
              firstName: profile._json.given_name,
              lastName: profile._json.family_name,
              email: profile._json.email,
              language: req.user.language,
              emailValidationKey: Helper.generateRandomString(30),
              mobileValidationKey: Helper.generateRandomNumber(4),
              password: User.hashPassword(Helper.generatePassword()), //Generate a random password just in case
              avatar: profile._json.picture,
              passport:"google",
              googleId : profile._json.sub,
            });
            //Attach admin role if required
            if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
              await myUser.attachRole("admin"); 
            }           
            return cb(null,myUser);
        }
        _work();
    }
  ));
  }
}