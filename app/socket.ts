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
import { isObject } from 'util';

/**Enumerator with all socket events*/
export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTHENTICATE = "authenticate",
    UPDATE_USER = "update-user-data",
    CHAT_LANGUAGE = "chat-update-language",  //Defines the language of the chat room


    CHAT_START = "chat-start",
    CHAT_ADMINS_DATA = "chat-admins",
    CHAT_NEW_NOTIFY ="chat-new-notify",
    CHAT_ROOM_ASSIGN ="chat-room-assign",  //Current chat room assigned
    CHAT_ROOMS_UPDATE ="chat-rooms-update", //Only for admins when changes on rooms

    CHAT_ROOM_DELETE ="chat-room-delete",
    CHAT_ROOM_CLOSE ="chat-room-close",
    CHAT_JOIN = "chat-join",
    CHAT_LEAVE = "chat-leave",
    CHAT_ECHO = "chat-echo",
    //CHAT_BOT_MESSAGE= "chat-bot-message",
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

  interface IChatMessage {
    message:string;
    date:Date;  
    sender:string;
    room:string;
  }

  interface IChatRoom {
      id:string;
      participants:number;
      date:Date;
      language:string;
  }


export class SocketHandler  {
    /**Contains array of messages in all languages */
    private messagesAll = Helper.translations();
    
    /**Contains the socket server */
    private io : socketio.Server;

    /**Contains all current connections */
    private connections : ISocketConnection[] = [];

    /**Contains chat admins */
    chatAdmins : IChatUser[] = [];

    /**Contains active chat rooms with messages stored*/
    chatRooms : IChatRoom[] = [];

    /**Contains all current chat messages */
    chatMessages : IChatMessage[] = [];




    constructor(server:https.Server,) {
        this.io = socketio(server);
    }

    /**Starts listening on sockets and handling events*/
    listen() {
        this.io.on(SocketEvents.CONNECT, (socket) => {
            this.addConnection({socket:socket,user:new User(),language:AppConfig.api.defaultLanguage});
            this.loadOnDisconnect(socket);
            this.loadOnAuthenticate(socket);
            this.loadOnChatStart(socket);
            this.loadOnChatNewNotify(socket);
            this.loadOnChatLanguageChange(socket);
            this.loadOnGetChatRooms(socket);
            this.loadOnGetMessage(socket);
            /*this.loadOnJoinRoom(socket);
            this.loadOnLeaveRoom(socket);
            this.loadOnDeleteRoom(socket);
            this.loadOnChatEcho(socket);
            */
        })

    }

    /////////////////////////////////////////////////////////////////////////////
    // Usefull functions for finding connections/sockets/users
    /////////////////////////////////////////////////////////////////////////////
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
        if (connection)
          if(connection.user) 
            return connection.user.firstName;
        return null;
    }

    /**Returns the current language of the connection */
    private getConnectionLanguage(socket:socketio.Socket) {
        const connection = this.findConnectionBySocket(socket);
        if (connection) return connection.language;
        return AppConfig.api.defaultLanguage;
    }

    ////////////////////////////////////////////////////////////////////////
    //Functions for handling all connections ENTER/EXIT
    ////////////////////////////////////////////////////////////////////////

    /**Emits updates of the status of the admins ONLY when there are changes*/
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


    /**Adds connection to the list */
    private addConnection(connection:ISocketConnection) {
        this.connections.push(connection);
        console.log("Socket connection :", connection.socket.id)
        this.chatAdminsChange(connection.socket);

    }

    /**Disconnects user by removing it from the list of connections */
    private loadOnDisconnect(socket:socketio.Socket) {
      //If is a chat admin we need to emit the change
      socket.on(SocketEvents.DISCONNECT,  () => {
        let index = this.connections.findIndex(obj=> obj.socket.id == socket.id);
        if (index>=0) {
            this.connections.splice(index,1);
        }
        console.log("Socket disconnected : " + socket.id);
        this.chatAdminsChange(socket);
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
                          socket.join(SocketRooms.CHAT_ADMIN);
                      }
                      if (user.hasRole('admin')) {
                          socket.join(SocketRooms.ADMIN);
                      }
                      this.updateConnection(connection);    
                  }
              });
          else  {  
            this.updateConnection(connection);    
          }

      });
    }


    /**Updates connection values, this is called inside loadOnAuthenticate */
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
        this.chatAdminsChange(connection.socket);
    }

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
    //Functions for handling CHAT PART
    ////////////////////////////////////////////////////////////////////////
    /**Creates a chat room and stores first message in the room, this is only triggered by customers*/
    private createChatRoom(socket:socketio.Socket) {
        let myRoom : IChatRoom = {
          id: "chat-room-" + Helper.generateRandomString(10),
          participants:1,
          date: new Date(),
          language: this.getConnectionLanguage(socket)
        }
        let myMessage : IChatMessage = {
          message:this.messagesAll[this.getConnectionLanguage(socket)].chatWelcome,
          date: new Date(),  
          sender: "bot",
          room: myRoom.id
        }
        this.chatMessages.push(myMessage);
        this.chatRooms.push(myRoom);
        socket.join(myRoom.id);
        socket.emit(SocketEvents.CHAT_ROOM_ASSIGN, myRoom);
        socket.emit(SocketEvents.CHAT_MESSAGE,myMessage);

        //Notify admins that there are changes on the chatRooms
        console.log("SENDING TO CHAT ADMINS", this.chatRooms);
        socket.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOMS_UPDATE, this.chatRooms);
        return myRoom;
    }

    /**Leaves room from a specific connection */
    /*private leaveChatRoom(socket:socketio.Socket, room:IChatRoom) {
      const myRoomIndex = this.chatRooms.findIndex(obj => obj.id == room.id);
      if (myRoomIndex>=0) {
        this.chatRooms[myRoomIndex].participants = this.chatRooms[myRoomIndex].participants-1;
        socket.leave(this.chatRooms[myRoomIndex].id);
        socket.to(this.chatRooms[myRoomIndex].id).emit(SocketEvents.CHAT_MESSAGE, this.newBotMessage(this.messagesAll[this.getConnectionLanguage(socket)].chatLeaveRoom(this.getConnectionFirstName(socket)),this.chatRooms[myRoomIndex].id));
      }
      //Notify admins that there are changes on the chatRooms
      socket.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOM_UPDATE, this.chatRooms);
    } */   

    /**When the client starts a chat. We create a room and send BOT message, then we send to client the chat admins user list and ask admins to join room ! */
    private loadOnChatStart(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_START, () => {
          //Create a new chat room and add requesting socket to it
          this.createChatRoom(socket);
          //Find all chat admins users and answer with them and if they are connected or not
          User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
              let myUsers : IChatUser[] = [];
              for (let user of users) {
                  myUsers.push({userId:user.id,firstName:user.firstName,avatar:user.avatar,connected:this.isUserConnected(user.id)})
              }
              this.chatAdmins = myUsers;
              socket.emit(SocketEvents.CHAT_ADMINS_DATA, this.chatAdmins);
          });
      });
    }

  /**When client sends first message, then we notify all chat admins with onPush and update chats */
  private loadOnChatNewNotify(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_NEW_NOTIFY, (msg:IChatMessage) => {
        //Find all chat admins users, do onPush notification and send them Room update
        User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
            for (let user of users) {
              user.notify(this.messagesAll[user.language].notificationNewChat,msg.message);
              //Add alert and send update to user
              Alert.create({userId:user.id,type:"chat",title:this.messagesAll[user.language].notificationNewChat,message:msg.message}).then(res => {
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
        });
    });
  }
  /**When we get a message we store it in the current chat room */
  private loadOnGetMessage(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_MESSAGE, (message:IChatMessage) => {
      console.log("Recieved message, storing in chat room",message);
      //Store message to the room
      this.chatMessages.push(message);
      //Redistribute message
      socket.broadcast.to(message.room).emit(SocketEvents.CHAT_MESSAGE,message);
      //Notify new message to all admins
      socket.broadcast.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_MESSAGE, message);
    });
  }








  /**Chat echo function */
  private loadOnChatEcho(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_ECHO, (message:IChatMessage) => {
          //message.iAmSender = false;
          socket.emit(SocketEvents.CHAT_MESSAGE, message);
      });
  }

  /**Updates connection language */
  private loadOnChatLanguageChange(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_LANGUAGE, (data:ISocketLanguage) => {
          let connection = this.findConnectionBySocket(socket);
          if (connection) {
              connection.language = data.language;
              socket.emit(SocketEvents.CHAT_MESSAGE, this.newBotMessage(this.messagesAll[this.getConnectionLanguage(socket)].chatLanguageSwitch));
          }
      });      
  }



  /**When admin wants to know chat rooms currently opened */
  private loadOnGetChatRooms(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_ROOMS_UPDATE, () => {
      console.log("Sending current chatRooms", this.chatRooms);
      socket.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOMS_UPDATE, this.chatRooms);
    });
  }




  //This is the missing part now....










    private removeChatRoom(room:IChatRoom) {
      const myRoomIndex = this.chatRooms.findIndex(obj => obj.id == room.id);
      if (myRoomIndex>=0) {
        this.chatRooms.splice(myRoomIndex,1);
        this.io.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOM_UPDATE, this.chatRooms);
      }
    }


    /**Joins connection to specific room */
    private loadOnJoinRoom(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_JOIN, (room:string) => {
        console.log("Recieved request to join room: ",room);
        let myRoom = this.chatRooms.find(obj => obj.id == room);
        console.log(myRoom);
        if (myRoom) {
          //this.joinRoom(socket,myRoom.id);
        }
      });
    }
    /**Joins connection to specific room */
    private loadOnLeaveRoom(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_LEAVE, (room:string) => {
        console.log("Recieved request to leave room: ",room);
        let myRoom = this.chatRooms.find(obj => obj.id == room);
        console.log(myRoom);
        if (myRoom) {
          //this.leaveRoom(socket,myRoom.id);
        }
      });
    }
    /**Joins connection to specific room */
    private loadOnDeleteRoom(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_ROOM_DELETE, (room:string) => {
        console.log("Recieved request to remove room: ",room);
        let myRoom = this.chatRooms.find(obj => obj.id == room);
        if (myRoom) {
          //Notify all users that room is being closed
          socket.to(myRoom.id).emit(SocketEvents.CHAT_ROOM_CLOSE);
          //this.removeChatRoom(myRoom);
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