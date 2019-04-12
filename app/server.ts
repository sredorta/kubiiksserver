import app from "./app";
import {Middleware} from './middleware/common';
import { Sequelize } from 'sequelize';
import {User} from './models/user';
import {Account} from './models/account';
import AppConfig from './config/config.json';


const PORT = 3000;
const sequelize = new Sequelize(AppConfig.db.database, AppConfig.db.username, AppConfig.db.password, <any>AppConfig.db.options);

//Common middlewares   
//app.use(Middleware.cors());     //Enable cors
//app.use(Middleware.language()); //Parses headers and determines language

Account.init(Account.definition(sequelize).params,Account.definition(sequelize).table);
User.init(User.definition(sequelize).params,User.definition(sequelize).table);
User.hasMany(Account, {foreignKey: 'userId', as: 'accounts'});

async function startServer() {    
    await sequelize.sync({force:true});
    //Start server listenning
    app.listen(PORT, () => {
        console.log('Express server listening on port ' + PORT);
    });
}
startServer();
