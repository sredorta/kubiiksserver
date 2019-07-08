import https from 'https';
import socketio from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from "./controllers/auth.controller";
import { Helper } from './classes/Helper';
import { AppConfig } from './utils/Config';
import { User } from './models/user';
import { Role } from './models/role';
import onChange from 'on-change';
import { messagesAll } from './middleware/common';
import { Alert } from './models/alert';

/**Enumerator with all socket events*/
export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTHENTICATE = "authenticate",
    UPDATE_USER = "update-user-data",
    JOIN_ROOM = "join-room",
    LEAVE_ROOM = "leave-room",
    LANGUAGE = "update-language",
    //TOKEN = "update-token",
    CHAT_START = "chat-start",
    CHAT_ADMINS_DATA = "chat-admins",
    CHAT_NEW_NOTIFY ="chat-new-notify",
    CHAT_ROOM_UPDATE ="chat-room-update",
    CHAT_JOIN = "chat-join",
    CHAT_LEAVE = "chat-leave",
    CHAT_ECHO = "chat-echo",
    CHAT_BOT_MESSAGE= "chat-bot-message",
    CHAT_MESSAGE = "chat-message",
    CHAT_WRITTING = "chat-writting"
}

/**Enumerator containing all socket rooms */
export enum SocketRooms {
    /**Contains all administrators */
    ADMIN = "admin-room",   
    /**Contains all chat administrators */
    CHAT_ADMIN = "chat-admin-room",    
}

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
  
  /**Data storage format for sockets connections */
  interface ISocketConnection {
    socket: socketio.Socket;
    user: User;
    language:string;
  }
  
  interface IChatUser {
      userId:number;
      firstName:string;
      avatar:string;
      connected:boolean;
  }

  interface IChatRoom {
      id:string;
      date:Date;
  }

  /**Contains all messages with all translations */
  //const messagesAll = Helper.translations();
  
  /**Contains array with all active sockets with user if identified... */
  //let sockets : ISocket[] = [];
  
  /**Contains the socket server globally */
  //let io : socketio.Server;







export class SocketHandler  {
    /**Contains array of messages in all languages */
    private messagesAll = Helper.translations();
    
    /**Contains the socket server */
    private io : socketio.Server;

    /**Contains all current connections */
    private connections : ISocketConnection[] = [];

    /**Contains chat admins */
    chatAdmins : IChatUser[] = [];

    /**Contains active chat rooms */
    chatRooms : IChatRoom[] = [];



    constructor(server:https.Server,) {
        this.io = socketio(server);
    }

    /**Starts listening on sockets and handling events*/
    listen() {
        this.io.on(SocketEvents.CONNECT, (socket) => {
            this.addConnection({socket:socket,user:new User(),language:AppConfig.api.defaultLanguage});
            this.loadOnDisconnect(socket);

            //Handle all events
            this.loadOnAuthenticate(socket);
            this.loadOnChatStart(socket);
            this.loadOnChatNewNotify(socket);

            this.loadOnChatEcho(socket);
            this.loadOnChatLanguageChange(socket);
        })

    }

    ////////////////////////////////////////////////////////////////////////
    //Functions for handling all connections
    ////////////////////////////////////////////////////////////////////////

    /**Emits all necessary events when there are changes on the connections,logins... */
    private handleConnectionChanges(socket: socketio.Socket) {
      this.chatAdminsChange(socket);
    }


    /**Adds connection to the list */
    private addConnection(connection:ISocketConnection) {
        this.connections.push(connection);
        console.log("Socket connection :", connection.socket.id)
        this.handleConnectionChanges(connection.socket);

    }

    /**Removes connection from the list */
    private removeConnection(socket:socketio.Socket) {
        let index = this.connections.findIndex(obj=> obj.socket.id == socket.id);
        if (index>=0) {
            this.connections.splice(index,1);
        }
        console.log("Socket disconnected : " + socket.id);
        this.handleConnectionChanges(socket);
    }

    /**Updates connection values */
    private updateConnection(connection:ISocketConnection) {
        let myConnection = this.findConnectionBySocket(connection.socket);
        const index = this.connections.findIndex(obj => obj.socket.id == connection.socket.id);
        if (myConnection) {
            myConnection.language = connection.language;
            myConnection.user = connection.user;
        }
        if (index>=0 && myConnection) {
            this.connections[index] = myConnection;
        }
        let result :any[] = [];
        for (let connection of this.connections) {
            result.push({userId:connection.user.id});
        }
        console.log(result);
        this.handleConnectionChanges(connection.socket);

    }

    /**Returns the associated connection from a socket */
    public findConnectionBySocket(socket:socketio.Socket) {
        const connection = this.connections.find(obj=> obj.socket.id == socket.id);
        if (connection) return connection;
        return null;
    }
    /**Returns the associated connection from a user */
    public findConnectionByUser(user: User) {
      const connection = this.connections.find(obj=> obj.user.id == user.id);
      if (connection) return connection;
      return null;
    }
    /**Returns the associated connection from a userId*/
    public findConnectionByUserId(userId: number) {
      const connection = this.connections.find(obj=> obj.user.id == userId);
      if (connection) return connection;
      return null;
    }


    /**Returns if there is a connection with specified userId */
    private isUserConnected(userId:number|null) {
        if (!userId) return false;
        const connect = this.connections.find(obj => obj.user.id == userId);
        if(connect) return true;
        return false;
    }
    
    /**Finds userId of an associated connection if is identified */
    private getConnectionUser(socket:socketio.Socket) {
        const connection = this.findConnectionBySocket(socket);
        if (connection) return connection.user.id;
        return null;
    }
    /**Gets nickname of the connection */
    private getConnectionFirstName(socket:socketio.Socket) {
        const connection = this.findConnectionBySocket(socket);
        if (connection) return connection.user.firstName;
        return null;
    }

    /**Returns the current language of the connection */
    private getConnectionLanguage(socket:socketio.Socket) {
        const connection = this.findConnectionBySocket(socket);
        if (connection) return connection.language;
        return AppConfig.api.defaultLanguage;
    }


    /**Joins connection to specific room */
    private joinToRoom(socket:socketio.Socket, room:SocketRooms) {
        socket.join(room);
        socket.to(room).emit(SocketEvents.JOIN_ROOM, this.messagesAll[this.getConnectionLanguage(socket)].chatJoinRoom(this.getConnectionFirstName(socket)));
    }

    /**Leaves room from a specific connection */
    private leaveFromRoom(socket:socketio.Socket, room:SocketRooms) {
        socket.leave(room);
        socket.to(room).emit(SocketEvents.LEAVE_ROOM, this.messagesAll[this.getConnectionLanguage(socket)].chatLeaveRoom(this.getConnectionFirstName(socket)));
    }    

    //PUBLIC FUNCTIONS

    /**Emits to the specified user the current database data */
    public updateAuth(userId:number) {
        console.log("UPDATING USER", userId);
        if (userId) {
          const connection = this.findConnectionByUserId(userId); 
          if (connection)
            if (connection.socket) {
              User.scope("details").findByPk(userId).then(user => {
                console.log("SENDING EVENT USER-UPDATE !!!");
                connection.socket.emit(SocketEvents.UPDATE_USER,user);
              })
            }
        }
    }


    ////////////////////////////////////////////////////////////////////////
    //Functions for handling socket events
    ////////////////////////////////////////////////////////////////////////
    /**Disconnects user by removing it from the list of connections */
    private loadOnDisconnect(socket:socketio.Socket) {
        //If is a chat admin we need to emit the change
        socket.on(SocketEvents.DISCONNECT,  () => {
            this.removeConnection(socket);
          });
    }

    /**Authenticates the user if he has a token */
    private loadOnAuthenticate(socket:socketio.Socket) {
        socket.on(SocketEvents.AUTHENTICATE,(data:ISocketAuth) => {
            let userId : null | number = null;
            try {
                const payload = <IJwtPayload>jwt.verify(data.token,AppConfig.auth.jwtSecret);
                userId = payload.id;  
            } catch (error) {}
            let connection : ISocketConnection = {
                socket: socket,
                user: new User(),
                language:data.language
            }
            console.log("FROM PAYLOAD", userId)
            if (userId)
                User.scope("details").findByPk(userId).then(user => {
                    if (user) {
                        connection.user = user;
                        if(user.hasRole('chat')) {
                            this.joinToRoom(socket,SocketRooms.CHAT_ADMIN);
                        }
                        if (user.hasRole('admin')) {
                            this.joinToRoom(socket, SocketRooms.ADMIN);
                        }
                        this.updateConnection(connection);    
                    }
                });
            else  {  
              this.updateConnection(connection);    
            }

        });
    }

    ////////////////////////////////////////////////////////////////////////
    //CHAT PART
    ////////////////////////////////////////////////////////////////////////
    /**Creates a new chat room */
    private createChatRoom() : IChatRoom {
      const myRoom = {
        id: "chat-room-" + Helper.generateRandomString(10),
        date: new Date()
      }
      this.chatRooms.push(myRoom);
      return myRoom;
    }


    /**Emits updates of the status of the admins when there are changes*/
    private chatAdminsChange(socket:socketio.Socket) {
      let result :IChatUser[] = [];
      for (let user of this.chatAdmins) {
         let newUser = JSON.parse(JSON.stringify(user));
         let connection = this.findConnectionByUserId(user.userId);
         if (connection) newUser.connected = true;
         else newUser.connected = false;
         result.push(newUser);
      }
      if (JSON.stringify(result) != JSON.stringify(this.chatAdmins))
        socket.broadcast.emit(SocketEvents.CHAT_ADMINS_DATA,result);
      this.chatAdmins = result;  
    }

    /**On chat start we send BOT message, then we send to client the chat admins user list and ask admins to join room ! */
    private loadOnChatStart(socket:socketio.Socket) {
        socket.on(SocketEvents.CHAT_START, () => {
            //Find all chat admins users and answer with them and if they are connected or not
            console.log("RECIEVED CHAT START !!!!");
            User.findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
                let myUsers : IChatUser[] = [];
                for (let user of users) {
                    myUsers.push({userId:user.id,firstName:user.firstName,avatar:user.avatar,connected:this.isUserConnected(user.id)})
                }
                this.chatAdmins = myUsers;
                socket.emit(SocketEvents.CHAT_ADMINS_DATA, this.chatAdmins);
            });
            socket.emit(SocketEvents.CHAT_BOT_MESSAGE, this.messagesAll[this.getConnectionLanguage(socket)].chatWelcome);
        });
    }

    /**When client starts a chat and sends first message, then we notify all chat admins with onPush and update chats */
    private loadOnChatNewNotify(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_NEW_NOTIFY, (msg:string) => {

          //Create a new chat room and add requesting socket to it
          const myChatRoom = this.createChatRoom();
          socket.join(myChatRoom.id);

          //Find all chat admins users, do onPush notification and send them Room update
          User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
              for (let user of users) {
                user.notify(this.messagesAll[user.language].notificationNewChat,msg);
                //Add alert and send update to user
                Alert.create({userId:user.id,type:"chat",title:this.messagesAll[user.language].notificationNewChat,message:msg}).then(res => {
                  User.scope("details").findByPk(user.id).then(userChatAdmin => {
                    console.log("SENDING EVENT USER-UPDATE !!!");
                    if (userChatAdmin) {
                      let connection = this.findConnectionByUserId(userChatAdmin.id);
                      if (connection)
                        connection.socket.emit(SocketEvents.UPDATE_USER,userChatAdmin);
                    }
                  })
                })
              }
              socket.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOM_UPDATE, this.chatRooms);
          });
      });
  }


    /**Chat echo function */
    private loadOnChatEcho(socket:socketio.Socket) {
        socket.on(SocketEvents.CHAT_ECHO, (message:string) => {
            socket.emit(SocketEvents.CHAT_MESSAGE, message);
        });
    }

    /**Updates connection language */
    private loadOnChatLanguageChange(socket:socketio.Socket) {
        socket.on(SocketEvents.LANGUAGE, (data:ISocketLanguage) => {
            let connection = this.findConnectionBySocket(socket);
            if (connection) {
                connection.language = data.language;
                socket.emit(SocketEvents.CHAT_BOT_MESSAGE, this.messagesAll[this.getConnectionLanguage(socket)].chatLanguageSwitch);
            }
        });      
    }






}

/*
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
  });*/