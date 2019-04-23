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
import {Account} from '../models/account';

export const JWTStrategy = passportJWT.Strategy;
export const LocalStrategy = passportLocal.Strategy;
export const FacebookStrategy = passportFacebook.Strategy;


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

    //Local passport usage
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
    public static jwt() {
        console.log("Enabling jwt passport");
        let opts :any = {};
        opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
        console.log("GOT TOKEN: "+ ExtractJwt.fromAuthHeaderAsBearerToken());
        opts.secretOrKey = AppConfig.auth.jwtSecret;
        //opts.issuer = 'accounts.examplesoft.com';
        //opts.audience = 'yoursite.net';
        //opts.clientID = "test";
        passport.use('jwt',new JWTStrategy(opts,
            function (jwtPayload:any, cb:any){
                console.log("Payload is :");
                console.log(jwtPayload);
                return User.findOne()
                .then(user => {
                    return cb(null, user);
                })
                .catch(err => {
                    return cb(err);
                });
            }
        ));
    }

}