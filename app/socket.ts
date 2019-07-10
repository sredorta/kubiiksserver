import https from 'https';
import socketio from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJwtPayload } from "./controllers/auth.controller";
import { Helper } from './classes/Helper';
import { AppConfig } from './utils/Config';
import { User } from './models/user';
import { Role } from './models/role';
import { messagesAll } from './middleware/common';
import { Alert } from './models/alert';
import { Socket } from 'dgram';
import { breakStatement } from 'babel-types';
import { createRegularExpressionLiteral } from 'typescript';

/**Enumerator with all socket events*/
export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTHENTICATE = "authenticate",
    UPDATE_USER = "update-user-data",
    CHAT_DATA="chat-data",               //Sends all related to chat room once assigned
    CHAT_ADMINS_DATA = "chat-admins",
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
  }
  /**Contains reduced view of users, used for getting chat admins data */
  interface IChatUser {
      userId:number;
      firstName:string;
      avatar:string;
      connected:boolean;
  }

  /**Contains message structure */
  interface IChatMessage {
    message:string;
    date:Date;  
    sender:string;
    room:string | null;
    isBot:boolean;
  }

  /**Room structure */
  interface IChatRoom {
      id:string;
      participants:number;
      date:Date;
      messages: IChatMessage[];
      language:string;
  }

  /**Chat data structure */
  interface IChatData {
    room:string | null;
    type:ChatDataType;
    object:any;
  }
  enum ChatDataType {
     CreateRoom = "create-room",
     FirstMessage = "first-message",
     WaitingRooms = "waiting-rooms",
     StoredMessagesRequest = "stored-messages-request",
     StoredMessagesResponse = "stored-messages-response",
     Participants = "room-participants",
     JoinRoom = "join-room",
     LeaveRoom = "leave-room",
     Message = "message",
     Room = "room",
     Admins = "admins",
     Writting = "writting",
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
            this.addConnection({socket:socket,user:new User()});
            this.loadOnDisconnect(socket);            //Disconnection
            this.loadOnAuthenticate(socket);          //Identify connected user
            this.loadOnChatAdmins(socket);            //Returns current status of admins, who they are and if connected or not
            this.loadOnChatData(socket);
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
    private getConnectionUser(socket:socketio.Socket) : User | null {
        const connection = this.findConnectionBySocket(socket);
        if (connection) return connection.user;
        return null;
    }

    /**Checks if the socket connection is a chat admin */
    private isChatAdminUser(socket:socketio.Socket) : boolean {
      let myUser = this.getConnectionUser(socket);
      if (myUser) {
         if (myUser.hasRole('chat')) 
              return true;
      }
      return false;
    }

    /**Returns all clients of a roomId */
    private findClientsSocketByRoomId(roomId:string) {
      let res = [];
      if(!this.io.sockets.adapter.rooms[roomId]) return [];
      let room = this.io.sockets.adapter.rooms[roomId].sockets;
      if (room) {
          for (var id in room) {
            res.push(this.io.sockets.adapter.nsp.connected[id]);
          }
      }
      return res;
    }
    /**Returns clientCount of roomId */
    private findClientCountSocketByRoomId(roomId:string) {
      return this.findClientsSocketByRoomId(roomId).length;
    }

    /**Returns all chat rooms opened */
    private getChatRooms() {
      let myRooms :IChatRoom[] = [];
      Object.keys(this.io.sockets.adapter.rooms).forEach( (key) => {
        if (key.includes('chat-room-'))
          myRooms.push({
            id: key,
            participants: this.findClientCountSocketByRoomId(key),
            date: new Date(),
            messages: [],
            language: AppConfig.api.defaultLanguage
          });
      });
      return myRooms;
    }

    /**Gets if user already has one chat room  */
    private hasChatRoom(socket:socketio.Socket) {
      let result :boolean = false;
      Object.keys(socket.adapter.rooms).forEach( (key) => {
        if (key.includes('chat-room-')) {
          console.log("USERRRRRRRRRRRRRRRRRRR ALREEEEEEEEEEEADDDYYYYYYYYYYYYYY!!!!!!!!!!!!", key);
          result = true;
        }
      });
      return result;
    }



    /**Gets nickname of the connection */
    private getConnectionFirstName(socket:socketio.Socket) {
        const connection = this.findConnectionBySocket(socket);
        if (connection)
          if(connection.user) 
            return connection.user.firstName;
        return null;
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
      if (JSON.stringify(result) != JSON.stringify(this.chatAdmins)) {
          console.log("Emitting CHAT_ADMINS_DATA !!!!!!!",result);
          socket.broadcast.emit(SocketEvents.CHAT_ADMINS_DATA,result);
      }
      this.chatAdmins = result;  
    }    

    /**Returns chat admins on request */
    private loadOnChatAdmins(socket:socketio.Socket) {
      //If is a chat admin we need to emit the change
      socket.on(SocketEvents.CHAT_ADMINS_DATA,  () => {
        User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
          let myUsers : IChatUser[] = [];
          for (let user of users) {
              myUsers.push({userId:user.id,firstName:user.firstName,avatar:user.avatar,connected:this.isUserConnected(user.id)})
          }
          this.chatAdmins = myUsers;
          console.log("Recieved CHAT_ADMINS_DATA !!!!!!!!!!!!!!!!");
          socket.emit(SocketEvents.CHAT_ADMINS_DATA,this.chatAdmins);
        });
      });
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
              user: new User()
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
            myConnection.user = connection.user;
        }
        if (index>=0 && myConnection) {
            this.connections[index] = myConnection;
        }
        let result :any[] = [];
        for (let connection of this.connections) {
            result.push({userId:connection.user.id});
        }
        this.chatAdminsChange(connection.socket);
    }

    /**Emits to the specified user the current database data */
    public updateAuth(userId:number) {
      if (userId) {
        const connection = this.findConnectionByUserId(userId); 
        if (connection)
          if (connection.socket) {
            User.scope("details").findByPk(userId).then(user => {
              connection.socket.emit(SocketEvents.UPDATE_USER,user);
            })
          }
      }
    }

  ////////////////////////////////////////////////////////////////////////
  //Functions for handling CHAT PART
  ////////////////////////////////////////////////////////////////////////
  /**Sends data to the chat room others*/
  private loadOnChatData(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_DATA, (data:IChatData) => {
        console.log("Broadcasting CHAT_DATA", data);
        switch(data.type) {   
          case ChatDataType.CreateRoom:
            if (!this.isChatAdminUser(socket)) {
                  console.log("Creating room as not admin chat !");
                  const roomName = "chat-room-" + Helper.generateRandomString(10);
                  const myRoom = {
                    id:roomName,
                    participants:1,
                    date: new Date(),
                    messages: [],
                    language: data.object.language
                  }
                  socket.join(roomName);
                  //return to socket the room
                  socket.emit(SocketEvents.CHAT_DATA, {room:myRoom.id, type:ChatDataType.Room, object: {room:myRoom}});
                  let myMessage = {
                    message:this.messagesAll[myRoom.language].chatWelcome,
                    room: data.room,
                    isBot:true
                  }
                  socket.emit(SocketEvents.CHAT_DATA, {room:data.room, type:ChatDataType.Message, object:{message:myMessage}});
            } else {
              console.log("NOT CREATING ROOM, YOU ARE ADMIN !!!!")
            }
            break;
          case ChatDataType.FirstMessage:
            if (!this.isChatAdminUser(socket)) {
                console.log("NOTIFING ALL ADMINS...")
                User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
                  for (let user of users) {
                    user.notify(this.messagesAll[user.language].notificationNewChat,data.object.message.message);
                    //Add alert and send update to user
                    Alert.create({userId:user.id,type:"chat",title:this.messagesAll[user.language].notificationNewChat,message:data.object.message.message}).then(res => {
                      User.scope("details").findByPk(user.id).then(userChatAdmin => {
                        if (userChatAdmin) {
                          let connection = this.findConnectionByUserId(userChatAdmin.id);
                          if (connection)
                            connection.socket.emit(SocketEvents.UPDATE_USER,userChatAdmin);
                        }
                      })
                    })
                  }
                });
                //Tell to all already connected admins all the available chat rooms
                let myRooms : IChatRoom[] = this.getChatRooms();
                console.log("SENDING ROOMS !!!!",myRooms);
                socket.broadcast.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_DATA, {room:null, type:ChatDataType.WaitingRooms, object:{rooms:myRooms}});
            } else {
              //In case of admin just forward message
              if (data.room)
                socket.broadcast.to(data.room).emit(SocketEvents.CHAT_DATA,data);
            }
            break;
          case ChatDataType.WaitingRooms:
            let myRoomsNow : IChatRoom[] = this.getChatRooms();
            socket.emit(SocketEvents.CHAT_DATA, {room:null, type:ChatDataType.WaitingRooms, object:{rooms:myRoomsNow}});
            break;
          case ChatDataType.StoredMessagesResponse:
            console.log("Sending messages to admins", data);
            socket.broadcast.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_DATA, data);
            break;
          case ChatDataType.JoinRoom:
            console.log(data);
            console.log("Joining room",data.room);
            if (data.room) {
              socket.join(data.room);
              let myMessage = {
                message:this.messagesAll[data.object.room.language].chatJoinRoom(this.getConnectionFirstName(socket)),
                room: data.room,
                isBot:true
              }
              socket.broadcast.to(data.room).emit(SocketEvents.CHAT_DATA, {room:data.room, type:ChatDataType.Message, object:{message:myMessage}});
              this.io.to(data.room).emit(SocketEvents.CHAT_DATA, {room:data.room, type:ChatDataType.Participants, object:{participants:this.findClientCountSocketByRoomId(data.room)}})
            }
            break;   
          case ChatDataType.LeaveRoom: 
            Object.keys(socket.adapter.rooms).forEach( (key) => {
              if (key.includes('chat-room-')) {
              let myMessage = {
                message:this.messagesAll[AppConfig.api.defaultLanguage].chatLeaveRoom(this.getConnectionFirstName(socket)),
                room: key,
                isBot:true
              }
              socket.leave(key);
              socket.broadcast.to(key).emit(SocketEvents.CHAT_DATA, {room:key, type:ChatDataType.Message, object:{message:myMessage}});
              this.io.to(key).emit(SocketEvents.CHAT_DATA, {room:key, type:ChatDataType.Participants, object:{participants:this.findClientCountSocketByRoomId(key)}});
              let myRoomsNow2 : IChatRoom[] = this.getChatRooms();
              this.io.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_DATA, {room:null, type:ChatDataType.WaitingRooms, object:{rooms:myRoomsNow2}});
  
            }
            });
            break;
          default:
            console.log("BROADCAST DEFAULT !!! -> BYPASS")
            if (data.room) {
              console.log("Broadcasting to room " +data.room, data);
              socket.broadcast.to(data.room).emit(SocketEvents.CHAT_DATA,data);
            }
        }

    });
  }



}
