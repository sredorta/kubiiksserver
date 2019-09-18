import app from "./app";
import express from 'express';
import {Sequelize, addHook} from 'sequelize-typescript';
import fs from 'fs';
import https from 'https';
import {Setting} from './models/setting';
import {User} from './models/user';
import {Role} from './models/role';
import {UserRole} from './models/user_role';

import {AppConfig} from './utils/config';
import {Response,Request,NextFunction} from 'express';
import { Product } from "./models/product";
import { Article } from "./models/article";
import { Email } from "./models/email";
import { ArticleTranslation } from "./models/article_translation";
import { Alert } from "./models/alert";
import { Routes } from "./routes";
import socketio from 'socket.io';
import { Helper } from "./classes/Helper";
import jwt from 'jsonwebtoken';
import { IJwtPayload } from "./controllers/auth.controller";
import { SocketHandler } from "./socket";

//const ca =  fs.readFileSync("./ssl.ca-bundle");
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');

export let sockets :SocketHandler;


const sequelize = new Sequelize({
    database: AppConfig.db.database,
    dialect: 'mariadb',
    username: AppConfig.db.username,
    password: AppConfig.db.password,
    modelPaths: [__dirname + './models/*'],
    modelMatch: (filename, member) => {
      filename = filename.replace("_", "");
      console.log(filename);
      console.log(member.toLowerCase());
      return filename === member.toLowerCase();
    },
  });
  //Create all models
  sequelize.addModels([__dirname + '/models']);

async function startServer() {  
   //await sequelize.sync();
   if (false) {  ///////////////////////////////////////////DO NOT FORCE REMOVAL FOR NOW
    await sequelize.sync({force:true});  
    //Seeding part
    await Setting.seed(); //Seed settings from the config.json for FE sharing
    await Role.seed();
    await User.seed();
    await Article.seed();
    await Email.seed();
    await Alert.seed();
   }
    app.use(function(err:Error, req:Request, res:Response, next:NextFunction) {
        console.log("--> STACK ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!! --> DEBUG REQUIRED !!!");
        console.error(err.stack);
    });

    //Serve static files   
    app.use('/public', express.static(__dirname + '/public', { maxAge: '1y' }));


    console.log('STARTED SERVER ON PORT : ' + AppConfig.api.port);
    //Serve with SSL or not
    if (!AppConfig.api.ssl)
        app.listen(AppConfig.api.port, () => {});
    else {
        const server = https.createServer({
            key: privateKey,
            cert: certificate
        }, app);
        //SocketIO part
        sockets = new SocketHandler(server);
        sockets.listen();
        //CRUD Listener
        server.listen(AppConfig.api.port);
    }
}
startServer();
