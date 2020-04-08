import app from "./app";
import express from 'express';
import {Sequelize, addHook} from 'sequelize-typescript';
import fs from 'fs';
import http from 'http';
import https from 'https';
import * as dotenv from "dotenv";

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
import { AlertTranslation } from "./models/alert_translation";

import { Routes } from "./routes";
import socketio from 'socket.io';
import { Helper } from "./classes/Helper";
import jwt from 'jsonwebtoken';
import { IJwtPayload } from "./controllers/auth.controller";
import { SocketHandler } from "./socket";
import { Newsletter } from "./models/newsletter";
import { Page } from "./models/page";
import { Cathegory } from "./models/cathegory";
import { Onpush } from "./models/onpush";


export let sockets :SocketHandler;

if (!process.env.NODE_ENV) {
  console.error("NODE_ENV not set !!!, please use set NODE_ENV = value  or export NODE_ENV = value")
}
let mydir :string = __dirname;
if (String(process.env.NODE_ENV).includes("production") || String(process.env.NODE_ENV).includes("vps")) {
  mydir = process.cwd() + '/build';
} else {
  mydir = process.cwd()+ '/app';
}

const sequelize = new Sequelize({
    logging: false,
    database: AppConfig.db.database,
    dialect: "mariadb",
    dialectOptions: {timezone: process.env.db_timezone},
    username: AppConfig.db.username,
    password: AppConfig.db.password,
    modelPaths: [mydir + './models/*'],
    modelMatch: (filename, member) => {
      filename = filename.replace("_", "");
      //console.log("FILENAME",filename);
      return filename === member.toLowerCase();
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
  //Create all models
  sequelize.addModels([mydir + '/models']);

async function startServer() {  
   //await sequelize.sync();
   if (false) {  ///////////////////////////////////////////DO NOT FORCE REMOVAL FOR NOW
    await sequelize.sync({force:true});  
    //Seeding part
    await Setting.seed(); //Seed settings from the config.json for FE sharing
    await Cathegory.seed();
    await Page.seed();
    await Role.seed();
    await User.seed();
    await Article.seed();
    await Email.seed();
    await Alert.seed();
    await Newsletter.seed();
    await Onpush.seed();
   }
    app.use(function(err:Error, req:Request, res:Response, next:NextFunction) {
        console.log("--> STACK ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!! --> DEBUG REQUIRED !!!");
        console.error(err.stack);
    });

    //Serve static files   
    app.use('/public', express.static(process.cwd() + '/app/public', { maxAge: '1y' }));
 
    

    console.log('STARTED SERVER ON PORT : ' + AppConfig.api.port);
    const server = http.createServer({}, app);
    sockets = new SocketHandler(server);
    sockets.listen();
    //CRUD Listener
    server.listen(AppConfig.api.port);
    
}
startServer();
