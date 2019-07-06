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

//const ca =  fs.readFileSync("./ssl.ca-bundle");
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.crt');

//Socket required parts
/**Socket auth data format */
export interface ISocketToken {
  token:string;
}

export interface ISocketLanguage {
  language:string;
}

/**Socket auth data format*/
export interface ISocketAuth extends ISocketToken, ISocketLanguage {
}

/**Data storage format for sockets */
interface ISocket {
  socket: socketio.Socket;
  userId: number | null;
  language:string;
  welcomeSent:boolean;
}

/**Contains all messages with all translations */
const messagesAll = Helper.translations();

/**Contains array with all active sockets with user if identified... */
let sockets : ISocket[] = [];

/**Contains the socket server globally */
let io : socketio.Server;

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
   if (true) {  ///////////////////////////////////////////DO NOT FORCE REMOVAL FOR NOW
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
        io = socketio(server);
        io.on("connection", function(socket:any) {
          console.log("CONNECTED TO SOCKET : " + socket.id);
          //Ask for authentification first of all
          socket.emit('authenticate');

          //When we get the authentication
          //we recieve language and token
          socket.on('authenticate',(data:ISocketAuth) => {
            //We need to validate user and save to sockets
            let userId = null;
            try {
              const payload = <any>jwt.verify(data.token,AppConfig.auth.jwtSecret);
              userId = payload.id;  
            } catch (error) {}
            const result : ISocket = {
              socket: socket,
              userId: userId,
              language:data.language,
              welcomeSent:false
            }
            //If user has chat rights join it to chat-admin-room
            if (userId)
              User.scope("fulldetails").findByPk(userId).then(user => {
                  if (user)
                    if (user.roles.find(obj=> obj.name == "chat")) {
                      socket.join('chat-admin-room');
                      console.log("USER JOINED chat-admin-room");
                    }
              });

            sockets.push(result);
            console.log(sockets);
          })

          //When socket is disconnected we remove it from the sockets list
          socket.on('disconnect', function () {
            let index = sockets.findIndex(obj=> obj.socket.id == socket.id);
            if (index>=0) {
              sockets.splice(index,1);
            }
            console.log(sockets);
            console.log("Socket disconnected : " + socket.id);
          });

          //Update token
          socket.on('update-token', (data:ISocketToken) => {
            let userId = null;
            try {
              const payload = <any>jwt.verify(data.token,AppConfig.auth.jwtSecret);
              userId = payload.id;  
            } catch (error) {}
            let index = sockets.findIndex(obj=> obj.socket.id == socket.id);
            if (index>=0)
                 sockets[index].userId = userId;
            console.log(sockets);  
            console.log("updated token");   
          })

          //Update language
          socket.on('update-language', (data:ISocketLanguage) => {
            let index = sockets.findIndex(obj=> obj.socket.id == socket.id);
            if (index>=0) {
                sockets[index].language = data.language;
                if (sockets[index].welcomeSent)
                  socket.emit('chat-message', messagesAll[data.language].chatLanguageSwitch);
            }     
            console.log(sockets);  
            console.log("updated language");       
          });


          //Chat echo part
          //----------------------------------------------------------
          //Start chat
          socket.on('chat-start', () => {
            console.log("CHAT START !!!!!!");
            let mySocket = sockets.find(obj => obj.socket.id == socket.id);
            if (mySocket) {
              if (!mySocket.welcomeSent)
                socket.emit('chat-message',messagesAll[mySocket.language].chatWelcome);
              mySocket.welcomeSent = true;
            }
          });

          //When we recieve a message from the chat
          socket.on('chat-message',(message:string)=> {
            let clients = io.sockets.adapter.rooms['chat-admin-room'].sockets; 
            console.log("Found following chat admin id's : ");
            for (let clientId in clients) {
              let clientSocket = io.sockets.connected[clientId];
              console.log(clientSocket.id);
              //Here we need to notify admins that new message is recieved !
              //Then create a room 1-1 with client and admin
              //Need to create angular admin chat with several discussions
              //For the moment I just send to admin
              clientSocket.emit('chat-message',message);
            }

          });


          //Echo for testing
          socket.on('chat-echo', (message:string) => {
            socket.emit('chat-message', message);
          });

          //When user is writting or not
          socket.on('chat-writting', (writting:boolean) => {
            if (writting)
              console.log("User is writting");
            else
              console.log("NOT WRITTING");  
          });
        });

        //CRUD Listener
        server.listen(AppConfig.api.port);
    }
}
startServer();
