import app from "./app";
import {Sequelize} from 'sequelize-typescript';
import {Setting} from './models/setting';
import {User} from './models/user';
import {Role} from './models/role';
import {UserRole} from './models/user_role';

import {AppConfig} from './utils/config';
import {Response,Request,NextFunction} from 'express';


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
    //Start server listenning
    app.listen(AppConfig.api.port, () => {
        console.log('Express server listening on port ' + AppConfig.api.port);
    });
}
startServer();
