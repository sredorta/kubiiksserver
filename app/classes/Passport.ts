import passport from 'passport';
import passportLocal from 'passport-local';
import passportJWT from "passport-jwt";
import passportFacebook from "passport-facebook";
import {ExtractJwt} from "passport-jwt";
import {messages} from '../middleware/common';
import { Helper } from './Helper';
import AppConfig from '../config/config.json';


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
            User.scope("all").findOne({
                    where: query
                }).then((user:User|null)=> {
                    //Check user existance
                    if (!user) {
                        return cb(new HttpException(400, messages.authInvalidCredentials ,null), false);
                    }
                    //Check password valid
                    if (!user.checkPassword(password)){
                        console.log("Passwords not matching !!!!");
                        return cb(new HttpException(400, messages.authInvalidCredentials ,null), false);
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
            try {
                const user = await User.findByPk(jwtPayload.userId);
                if (!user) {
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
/*passport.use(new FacebookStrategy({
    clientID: "FB ID", //process.env.FACEBOOK_ID,
    clientSecret: "FB SECRET", //process.env.FACEBOOK_SECRET,
    callbackURL: "/api/auth/facebook/callback",
    profileFields: ["name", "email", "link", "locale", "timezone"],
    passReqToCallback: true
  }, (req: any, accessToken, refreshToken, profile, done) => {
      console.log("Using facebook passport !");*/
/*    if (req.user) {
      User.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          req.flash("errors", { msg: "There is already a Facebook account that belongs to you. Sign in with that account or delete it, then link it with your current account." });
          done(err);
        } else {
          User.findById(req.user.id, (err, user: any) => {
            if (err) { return done(err); }
            user.facebook = profile.id;
            user.tokens.push({ kind: "facebook", accessToken });
            user.profile.name = user.profile.name || `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = user.profile.gender || profile._json.gender;
            user.profile.picture = user.profile.picture || `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.save((err: Error) => {
              req.flash("info", { msg: "Facebook account has been linked." });
              done(err, user);
            });
          });
        }
      });
    } else {
      User.findOne({ facebook: profile.id }, (err, existingUser) => {
        if (err) { return done(err); }
        if (existingUser) {
          return done(undefined, existingUser);
        }
        User.findOne({ email: profile._json.email }, (err, existingEmailUser) => {
          if (err) { return done(err); }
          if (existingEmailUser) {
            req.flash("errors", { msg: "There is already an account using this email address. Sign in to that account and link it with Facebook manually from Account Settings." });
            done(err);
          } else {
            const user: any = new User();
            user.email = profile._json.email;
            user.facebook = profile.id;
            user.tokens.push({ kind: "facebook", accessToken });
            user.profile.name = `${profile.name.givenName} ${profile.name.familyName}`;
            user.profile.gender = profile._json.gender;
            user.profile.picture = `https://graph.facebook.com/${profile.id}/picture?type=large`;
            user.profile.location = (profile._json.location) ? profile._json.location.name : "";
            user.save((err: Error) => {
              done(err, user);
            });
          }
        });
      });
    }*/
//  }));
}