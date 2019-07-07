import https from 'https';
import socketio from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from "./controllers/auth.controller";
import { Helper } from './classes/Helper';
import { AppConfig } from './utils/Config';
import { User } from './models/user';
import { Socket } from 'dgram';
import { Role } from './models/role';
import { isObject } from 'util';

/**Enumerator with all socket events*/
export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTHENTICATE = "authenticate",
    JOIN_ROOM = "join-room",
    LEAVE_ROOM = "leave-room",
    LANGUAGE = "update-language",
    //TOKEN = "update-token",
    CHAT_START = "chat-start",
    CHAT_ADMINS_DATA = "chat-admins",
    CHAT_JOIN = "chat-join",
    CHAT_LEAVE = "chat-leave",
    CHAT_ECHO = "chat-echo",
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

    constructor(server:https.Server,) {
        this.io = socketio(server);
    }

    /**Starts listening on sockets and handling events*/
    listen() {
        this.io.on(SocketEvents.CONNECT, (socket) => {
            this.addConnection({socket:socket,user:new User(),language:AppConfig.api.defaultLanguage});
            this.loadOnDisconnect(socket);
            //Ask for authentication
            socket.emit(SocketEvents.AUTHENTICATE);

            //Handle all events
            this.loadOnAuthenticate(socket);
            this.loadOnChatStart(socket);
            this.loadOnChatEcho(socket);
            this.loadOnChatLanguageChange(socket);
        })
    }

    ////////////////////////////////////////////////////////////////////////
    //Functions for handling all connections
    ////////////////////////////////////////////////////////////////////////

    /**Adds connection to the list */
    private addConnection(connection:ISocketConnection) {
        this.connections.push(connection);
        /*if (connection.user.hasRole('chat')) {
          this.io.emit(SocketEvents.CHAT_ADMINS_DATA,this.connections.find(obj=> obj.user.hasRole('chat')==true));
        }*/
        console.log("Socket connection :", connection.socket.id)
    }

    /**Removes connection from the list */
    private removeConnection(socket:socketio.Socket) {
        //Check if we have to do any notification
        let connection = this.connections.find(obj=> obj.socket.id == socket.id);
        /*if (connection)
          if (connection.user)
            if (connection.user.hasRole('chat')) 
                this.io.emit(SocketEvents.CHAT_ADMINS_DATA,this.connections.find(obj=> obj.user.hasRole('chat')==true));
        */
        let index = this.connections.findIndex(obj=> obj.socket.id == socket.id);
        if (index>=0) {
            this.connections.splice(index,1);
        }
        
        console.log("Socket disconnected : " + socket.id);
    }

    /**Updates connection values */
    private updateConnection(connection:ISocketConnection) {
        let myConnection = this.findConnection(connection.socket);
        const index = this.connections.findIndex(obj => obj.socket.id == connection.socket.id);
        if (myConnection) {
            myConnection.language = connection.language;
            myConnection.user = connection.user;
        }
        if (index>=0 && myConnection) {
            this.connections[index] = myConnection;
            /*if (myConnection.user.hasRole('chat')) {
              this.io.emit(SocketEvents.CHAT_ADMINS_DATA,this.connections.find(obj=> obj.user.hasRole('chat')==true));
            }*/
        }
    }
    
    /**Returns the associated connection from a socket */
    private findConnection(socket:socketio.Socket) {
        const connection = this.connections.find(obj=> obj.socket.id == socket.id);
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
        const connection = this.findConnection(socket);
        if (connection) return connection.user.id;
        return null;
    }
    /**Gets nickname of the connection */
    private getConnectionFirstName(socket:socketio.Socket) {
        const connection = this.findConnection(socket);
        if (connection) return connection.user.firstName;
        return null;
    }

    /**Returns the current language of the connection */
    private getConnectionLanguage(socket:socketio.Socket) {
        const connection = this.findConnection(socket);
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
            let userId = null;
            try {
                const payload = <IJwtPayload>jwt.verify(data.token,AppConfig.auth.jwtSecret);
                userId = payload.id;  
            } catch (error) {}
            let connection : ISocketConnection = {
                socket: socket,
                user: new User(),
                language:data.language
            }
            if (userId)
                User.scope("fulldetails").findByPk(userId).then(user => {
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
            else 
                this.updateConnection(connection);    

        });
    }
    /**On chat start we send BOT message, then we send to client the chat admins user list and ask admins to join room ! */
    private loadOnChatStart(socket:socketio.Socket) {
        socket.on(SocketEvents.CHAT_START, () => {
            //Find all chat admins users and answer with them and if they are connected or not
            console.log("RECIEVED CHAT START !!!!");
            User.findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
                console.log(users);
                let myUsers : IChatUser[] = [];
                for (let user of users) {
                    myUsers.push({userId:user.id,firstName:user.firstName,avatar:user.avatar,connected:this.isUserConnected(user.id)})
                }
                socket.emit(SocketEvents.CHAT_ADMINS_DATA, myUsers);
            });
            socket.emit(SocketEvents.CHAT_MESSAGE, this.messagesAll[this.getConnectionLanguage(socket)].chatWelcome);
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
            let connection = this.findConnection(socket);
            if (connection) {
                connection.language = data.language;
                socket.emit(SocketEvents.CHAT_MESSAGE, this.messagesAll[this.getConnectionLanguage(socket)].chatLanguageSwitch);
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