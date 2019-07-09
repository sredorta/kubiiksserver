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

/**Enumerator with all socket events*/
export enum SocketEvents {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    AUTHENTICATE = "authenticate",
    UPDATE_USER = "update-user-data",

    CHAT_ADMIN_ROOMS="chat-admin-rooms", //Detects rooms and assigns
    CHAT_DATA="chat-data", //Sends data related to chat room
    CHAT_ADMINS_DATA = "chat-admins",
    CHAT_NEW_NOTIFY ="chat-new-notify",
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
  }

  /**Room structure */
  interface IChatRoom {
      id:string;
      participants:number;
      date:Date;
      messages: IChatMessage[];
  }

  /**Chat data structure */
  interface IChatData {
    room:string | null;
    type:ChatDataType;
    object:any;
  }
  enum ChatDataType {
     Message = "message",
     Room = "room",
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
            this.loadOnDisconnect(socket);            //Disconnection
            this.loadOnAuthenticate(socket);          //Identify connected user
            this.loadOnChatNewNotify(socket);         //Notify chat admins new chat entry
            this.loadOnChatAdmins(socket);            //Returns current status of admins, who they are and if connected or not
            this.loadOnChatAdminStart(socket);
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


  /**Creates all required rooms and return them */
  private loadOnChatAdminStart(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_ADMIN_ROOMS, () => {
      //Find all orphan messages and create rooms for them if connection is still alive
      //Remove any messages that they already have a room assigned or socket doesn't exist
      for (let i = this.chatMessages.length - 1; i >= 0; --i) {
        const index = this.connections.findIndex(obj => obj.socket.id == this.chatMessages[i].sender);
        if ((this.chatMessages[i].room != null) || (index<0)) {
            this.chatMessages.splice(i,1);
        }
      }
      //Now create a senders array with each socket and it's messages
      let senders : any = [];
      for (let message of this.chatMessages) {
         if (message.room ==null) {
           if (message.sender) {
             if (!senders[message.sender]) {
                senders[message.sender] = [];
             }
             senders[message.sender].push(message);
           }
         }
      }
      let myRooms : IChatRoom[] = [];
      //Now create a chat room for each sender and join mySelf and the sender
      Object.keys(senders).forEach( (socketId)=> {
          const roomName = "chat-room-" + Helper.generateRandomString(10)
          const hisSocket = this.io.sockets.connected[socketId];
          socket.join(roomName);
          hisSocket.join(roomName);
          myRooms.push({
            id:roomName,
            participants:2,
            date: new Date(),
            messages: senders[socketId]
          });
      });
      //Emit to the admin all the rooms
      socket.emit(SocketEvents.CHAT_ADMIN_ROOMS, myRooms);
    });
  }

  /**Sends data to the chat room others*/
  private loadOnChatData(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_DATA, (data:IChatData) => {
        console.log("Broadcasting CHAT_DATA", data);
        if (data.room)
          socket.broadcast.to(data.room).emit(SocketEvents.CHAT_DATA,data);
        else if (!data.room && data.type == ChatDataType.Message) {
          console.log("STORING ORPHAN MESSAGE", data.object.message);
          this.chatMessages.push(data.object.message);
        }
    });
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

    /**Determines if socket can start a room. Only non chat admins can start a room. Only one room per client */
    /*private socketCanStartRoom(socket:socketio.Socket) {
      let result : boolean = true;
       Object.keys(socket.rooms).forEach( (key:string) => {
           console.log("KEY : " + key);
           if (key.includes('chat-room-')) result = false;
           if (key == SocketRooms.CHAT_ADMIN) result = false;
       })
       return result;
    }*/


    /**When the client starts a chat. We create a room and send BOT message, then we send to client the chat admins user list and ask admins to join room ! */
/*    private loadOnChatStart(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_START_REQUEST, () => {
        //STEP0: Do work if socket is not already in a chat room and is not chat admin
        console.log("Recieved CHAT_START_REQUEST",this.socketCanStartRoom(socket));
        if (this.socketCanStartRoom(socket)) {
            //STEP1: Create a room and join the socket to the room
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
            }
            this.chatMessages.push(myMessage);
            this.chatRooms.push(myRoom);
            socket.join(myRoom.id);
            //Prevent admins that chat-room changes
            socket.broadcast.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOMS_UPDATE,this.chatRooms);

            //STEP2: Get all chat admins and their status
            User.scope("full").findAll({include: [{model:Role, where: {name: "chat"}}]}).then(users => {
              let myUsers : IChatUser[] = [];
              for (let user of users) {
                  myUsers.push({userId:user.id,firstName:user.firstName,avatar:user.avatar,connected:this.isUserConnected(user.id)})
              }
              this.chatAdmins = myUsers;
              const response : IChatData = {
                admins:myUsers,
                room:myRoom,
                messages: this.chatMessages.filter(obj=>obj.room == myRoom.id)
              }
              socket.emit(SocketEvents.CHAT_START_RESPONSE, response);
            });
        }
      });
    }*/




  /**Returns current chat rooms if request to socket*/
  /*private loadOnChatRooms(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_ROOMS_UPDATE, () => {
      console.log("Sending chat rooms", this.chatRooms);
      socket.emit(SocketEvents.CHAT_ROOMS_UPDATE,this.chatRooms);
    });
  }*/











  /**Returns all messages of a room */
/*  private loadOnGetStoredMessages(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_STORED_MESSAGES, (room:string)=> {
      let myMessages = this.chatMessages.filter(obj=> obj.room == room);
      console.log("Sending all stored messages of room " + room, myMessages );
      socket.emit(SocketEvents.CHAT_STORED_MESSAGES, myMessages);
    })
  }*/


  /**When admin wants to know chat rooms currently opened */
  /*private loadOnGetChatRooms(socket:socketio.Socket) {
    socket.on(SocketEvents.CHAT_ROOMS_UPDATE, () => {
      console.log("Sending current chatRooms", this.chatRooms);
      socket.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOMS_UPDATE, this.chatRooms);
    });
  }*/




  /**Chat echo function */
 /* private loadOnChatEcho(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_ECHO, (message:IChatMessage) => {
          //message.iAmSender = false;
          socket.emit(SocketEvents.CHAT_MESSAGE, message);
      });
  }*/

  /**Updates connection language */
  /*private loadOnChatLanguageChange(socket:socketio.Socket) {
      socket.on(SocketEvents.CHAT_LANGUAGE, (data:ISocketLanguage) => {
          let connection = this.findConnectionBySocket(socket);
          if (connection) {
              connection.language = data.language;
              //socket.emit(SocketEvents.CHAT_MESSAGE, this.newBotMessage(this.messagesAll[this.getConnectionLanguage(socket)].chatLanguageSwitch));
          }
      });      
  }*/
  //This is the missing part now....
/*

    private removeChatRoom(room:IChatRoom) {
      const myRoomIndex = this.chatRooms.findIndex(obj => obj.id == room.id);
      if (myRoomIndex>=0) {
        this.chatRooms.splice(myRoomIndex,1);
        //this.io.to(SocketRooms.CHAT_ADMIN).emit(SocketEvents.CHAT_ROOM_UPDATE, this.chatRooms);
      }
    }


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
    }*/

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