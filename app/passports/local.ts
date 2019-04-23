import passport from 'passport';
import passportLocal from 'passport-local';
import passportFacebook from "passport-jwt";
import passportJWT from "passport-facebook";
import {ExtractJwt} from "passport-jwt";

import { Request, Response, NextFunction } from "express";
import {HttpException} from '../classes/HttpException';
import {User} from '../models/user';
import {Account} from '../models/account';

export const JWTStrategy = passportJWT.Strategy;
export const LocalStrategy = passportLocal.Strategy;
export const FacebookStrategy = passportFacebook.Strategy;



       //PASSPORT PART !!!!!!
       passport.serializeUser(function(user, done) {
        done(null, user);
    });
    
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    console.log("Before passport.use");
    passport.use('local',new passportLocal.Strategy({
        usernameField: 'username',
        passwordField: 'password',
    }, 
    function (email, password, done)  {
      console.log("LOCAL STRATEGY !!!!");
      let user = User.build({email:"test"});
      return done(null, user, {message: 'Incorrect email or password.'});
    }));

    console.log("After passport.use");









/*


//define REST proxy options based on logged in user
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});


//Extracts the token from the request !!!!
let opts :any = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secret';
opts.issuer = 'accounts.examplesoft.com';
opts.audience = 'yoursite.net';
opts.clientID = "test";
passport.use(new JWTStrategy(opts,
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


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
    }, 
    function (email, password, cb) {
        console.log("Checking with local password !!!!!");
        //Find user and validate password
        return User.scope("all").findOne({where :{email:email, password:password}})
           .then(user => {
               if (!user) {
                   return cb(null, false, {message: 'Incorrect email or password.'});
               }
               //Now check password from accounts
               return cb(null, user, {message: 'Logged In Successfully'});
          })
          .catch(err => cb(err));
    }
));
*/
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


  /**
 * Login Required middleware.
 */
export let isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    console.log("isAuthenticated : " + req.isAuthenticated());
    if (req.isAuthenticated()) {
      return next();
    }
    next(new HttpException(401, "Requires authentication !", null));

  };
  
  /**
   * Authorization Required middleware.
   */
  export let isAuthorized = (req: Request, res: Response, next: NextFunction) => {
    const provider = req.path.split("/").slice(-1)[0];
    console.log("Provider is : " + provider);
    //if (_.find(req.user.tokens, { kind: provider })) {
      next();
    //} else {
    //  res.redirect(`/auth/${provider}`);
    //}
  };