import app from "./app";
import { Sequelize } from 'sequelize';
import {User} from './models/user';
import {Account} from './models/account';
import {Setting} from './models/setting';

import AppConfig from './config/config.json';
import {Response,Request,NextFunction} from 'express';


const PORT = 3000;
const sequelize = new Sequelize(AppConfig.db.database, AppConfig.db.username, AppConfig.db.password, <any>AppConfig.db.options);

//Init all tables
//This needs to be moved somewhere else most provably
Setting.init(Setting.definition(sequelize).params, Setting.definition(sequelize).table);
Account.init(Account.definition(sequelize).params,Account.definition(sequelize).table);
User.init(User.definition(sequelize).params,User.definition(sequelize).table);
User.hasMany(Account, {foreignKey: 'userId', as: 'accounts'});
//User.addHook('beforeValidate', User.validationHook());
async function startServer() {    
    await sequelize.sync({force:true});
    await Setting.seed(); //Seed settings from the config.json for FE sharing

    app.use(function(err:Error, req:Request, res:Response, next:NextFunction) {
        console.log("STACK ERRO !!!!!");
        console.error(err.stack);
        //next(new HttpException(400, "sequelize", "Custom isUnique violation", null));
        //res.status(500).send('Something broke!');
      });
    //Start server listenning
    app.listen(PORT, () => {
        console.log('Express server listening on port ' + PORT);
    });
}
startServer();
