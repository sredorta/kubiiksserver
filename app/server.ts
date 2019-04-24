import app from "./app";
import {Sequelize} from 'sequelize-typescript';
import fs from 'fs';
import https from 'https';
import {Setting} from './models/setting';
import {User} from './models/user';
import {Role} from './models/role';
import {UserRole} from './models/user_role';

import {AppConfig} from './utils/config';
import {Response,Request,NextFunction} from 'express';


//const ca =  fs.readFileSync("./ssl.ca-bundle");
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');

const sequelize = new Sequelize({
    database: AppConfig.db.database,
    dialect: 'mariadb',
    username: AppConfig.db.username,
    password: AppConfig.db.password,
    modelPaths: [__dirname + './models/*.ts'],
    /*modelMatch: (filename, member) => {
      return filename.substring(0, filename.indexOf('.ts')) === member.toLowerCase();
    },*/
  });
 sequelize.addModels([User,Setting,Role, UserRole]);

async function startServer() {    
    await sequelize.sync({force:true});
    //Seeding part
    await Setting.seed(); //Seed settings from the config.json for FE sharing
    await Role.seed();

    app.use(function(err:Error, req:Request, res:Response, next:NextFunction) {
        console.log("--> STACK ERROR !!!!!!!!!!!!!!!!!!!!!!!!!!! --> DEBUG REQUIRED !!!");
        console.error(err.stack);
      });
    console.log('STARTED SERVER ON PORT : ' + AppConfig.api.port);
    //Serve with SSL or not
    if (!AppConfig.api.ssl)
        app.listen(AppConfig.api.port, () => {});
    else
        https.createServer({
            key: privateKey,
            cert: certificate
        }, app).listen(AppConfig.api.port);
}
startServer();
