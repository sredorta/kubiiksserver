import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes, BelongsToMany,HasMany, Is} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import jwt from "jsonwebtoken";
import {AppConfig} from '../utils/Config';
import bcrypt from "bcryptjs";

import {Role} from './role';
import {UserRole} from './user_role';
import { IJwtPayload } from '../controllers/auth.controller';
import { Helper } from '../classes/Helper';
import { Alert } from './alert';
import  webPush from 'web-push';
import { isNamedExports } from 'typescript';
import { Setting } from './setting';




export const UserN = 'Not a model';
export const NUser = 'Not a model';

//Default scope only contains the public data
@DefaultScope({
  attributes:  ['id','firstName','lastName','email', 'phone', 'mobile','language','avatar','isEmailValidated', 'terms','createdAt','updatedAt']
})
@Scopes({
  details: {
    attributes:  ['id','firstName','lastName','email', 'phone', 'mobile','language','avatar','isEmailValidated','createdAt','updatedAt'],
    include: [() => Role, () => Alert]
  },
  full: {
    attributes: {exclude : []}
  },
  fulldetails: {
    attributes: {exclude : []},
    include: [() => Role, () => Alert],
  }
})

@Table({})
export class User extends Model<User> {



  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  firstName!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  lastName!:string;

  @AllowNull(true)
  @Unique(true)
  @Column(DataTypes.STRING(128))
  email!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  phone!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  mobile!:string;

  @AllowNull(false)
  @Column(DataTypes.STRING(56))
  language!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  avatar!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  terms!:boolean;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  isEmailValidated!:boolean;

  @AllowNull(false)
  @Column(DataTypes.STRING(30))
  emailValidationKey!:string;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  isMobileValidated!:boolean;

  @AllowNull(false)
  @Column(DataTypes.STRING(4))
  mobileValidationKey!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(100))
  password!:string;

  @AllowNull(false)
  @Default(0)
  @Column(DataTypes.SMALLINT)
  failCount!:number;
  
  @AllowNull(true)
  @Default(new Date())
  @Column(DataTypes.DATE)
  failTimer!:Date;  


  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  passport!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  facebookId!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(255))
  facebookToken!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  googleId!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(255))
  googleToken!:string;  

  /**Stores all onPush data for onPush notifications */
  @AllowNull(true)
  @Column(DataTypes.STRING(2000))
  onPush!:string;   

  //Relations
  @BelongsToMany(() => Role, () => UserRole)
  roles!: Role[];

  @HasMany(() => Alert, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  alerts!: Alert[];  

  /**Sends onPush notification to user if any subscription */
  public async notify(title:string,body:string) {

    let myPromise : Promise<boolean>;
    let myObj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _getData(title:string,body:string) {
        try {
          console.log("IN GET_DATA !!!!!!!!!!!!!!!");
          if (myObj.onPush) {
            //Get logo from settings
            /*let siteUrl = await Setting.findOne({where:{key:"url"}});
            if (!siteUrl) {
                throw new Error("Could not find siteUrl");
            }*/
            let urlBase = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/";
            //Get baseURL from settings


            const subscription = JSON.parse(myObj.onPush);
            const payload = JSON.stringify({
              notification: {
                title: title,
                body: body,
                icon: urlBase + 'logo.jpg',
                vibrate: [100, 50, 100],
                action:"reload-user",
                data: {
                  url: AppConfig.api.host +":"+ AppConfig.api.fePort,
                  user: await User.scope("details").findByPk(myObj.id)
                }
              }
            });
            await webPush.sendNotification(subscription,payload);
            resolve(true);
          } else {
            resolve(false);
          }

        } catch(error) {
          console.log("Got error:", error);
          resolve(false);
       }
     }
     _getData(title,body);
   });
   return myPromise;
  }



  /**Hashes a password to store in db */
  public static hashPassword(unencrypted:string) : string {
        return bcrypt.hashSync(unencrypted,8);
  }

  //Checks matching for unencrypted password against encrypted
  public checkPassword(unencryptedPassword:string) : boolean {
      return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  /**Generates a token */
  public createToken(time: "short" | "long") {
    let expires = AppConfig.auth.accessLong;
    if (time == "short") {
      expires = AppConfig.auth.accessShort;
    }
    const payload : IJwtPayload = {
      id: this.id 
    }
    return jwt.sign(payload, //Payload !
      AppConfig.auth.jwtSecret,
      { expiresIn: expires }
    );
  }


  /**Checks if user has specific role or is admin */
  public hasRole(role:string | number) : boolean {  
      if (!this.roles) return false;
      if (typeof role == "string") {
          if (this.roles.findIndex(obj => obj.name == role) >= 0 || this.roles.findIndex(obj => obj.name == 'admin')>=0) return true;
          else return false;
      } else {
          if (this.roles.findIndex(obj => obj.id == role) >= 0 || this.roles.findIndex(obj => obj.id == 1)>=0) return true;
          else return false;
      }              
  }

  /**Attaches a specif role to the user */
  public attachRole(role: string | number) : Promise<boolean> {
    let myPromise : Promise<boolean>;
    let obj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _addRole() {
          let myRole;
          if (typeof role == "string")
            myRole = await Role.findOne({where:{"name":role}});
          else 
            myRole = await Role.findByPk(role);

          if (!myRole) {
            reject("Role could not be found");
          } else {
            await obj.$add('Role',[myRole]); 
            resolve(true);
          }
      }
      _addRole();
    });
    return myPromise;
  }

  /**Detaches a specif role from the user */
  public detachRole(role: string | number) : Promise<boolean> {
    let myPromise : Promise<boolean>;
    let obj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _removeRole() {
          let myRole;
          if (typeof role == "string")
            myRole = await Role.findOne({where:{"name":role}});
          else 
            myRole = await Role.findByPk(role);

          if (!myRole) {
            reject("Role could not be found");
          } else {
            await obj.$remove('Role',[myRole]); 
            resolve(true);
          }
      }
      _removeRole();
    });
    return myPromise;
  }



  /**Seeds the table initially */
  public static seed() {
    async function _seed() {
        /*first user*/
        let myUser : User = new User();
        myUser = await User.scope("full").create({
          firstName: "Sergi",
          lastName: "Redorta",
          email: "sergi.redorta@hotmail.com",
          phone: null,
          mobile: "0623133212",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });
        await myUser.attachRole("admin");
        await myUser.attachRole("kubiiks");
        await myUser.attachRole("chat");

        /*Debug users*/
        myUser = await User.scope("full").create({
          firstName: "Christine",
          lastName: "Besson",
          email: "christine.besson@hotmail2.com",
          phone: null,
          mobile: "0623133222",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });
        await myUser.attachRole("chat");
        myUser = await User.scope("full").create({
          firstName: "Laia",
          lastName: "Redorta",
          email: "laia.redorta@hotmail2.com",
          phone: null,
          mobile: "0623133233",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });
        await myUser.attachRole("chat");
        myUser = await User.scope("full").create({
          firstName: "Jana",
          lastName: "Redorta",
          email: "jana.redorta@hotmail2.com",
          phone: null,
          mobile: "0623133244",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });
        myUser = await User.scope("full").create({
          firstName: "Anna",
          lastName: "Soldevila",
          email: "anna.soldevila@hotmail2.com",
          phone: null,
          mobile: "0623133255",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });      
        myUser = await User.scope("full").create({
          firstName: "Julien",
          lastName: "Vert",
          email: "julien.vert@hotmail2.com",
          phone: null,
          mobile: "0623133266",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        }); 
        myUser = await User.scope("full").create({
          firstName: "Sophie",
          lastName: "Larribeau",
          email: "sophie.larribeau@hotmail2.com",
          phone: null,
          mobile: "0623133266",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        }); 
        myUser = await User.scope("full").create({
          firstName: "Marc",
          lastName: "Redorta",
          email: "marc.redorta@hotmail2.com",
          phone: null,
          mobile: "0623133277",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });                         
        myUser = await User.scope("full").create({
          firstName: "Eva",
          lastName: "Corvera",
          email: "eva.corvera@hotmail2.com",
          phone: null,
          mobile: "0623133288",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });         
        myUser = await User.scope("full").create({
          firstName: "Cedric",
          lastName: "Normand",
          email: "cedric.normand@hotmail2.com",
          phone: null,
          mobile: "0623133299",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });  
        myUser = await User.scope("full").create({
          firstName: "Pascal",
          lastName: "Gory",
          email: "pascal.gory@hotmail2.com",
          phone: null,
          mobile: "0623133300",
          language: "fr",
          passport: "local",
          terms: true,
          emailValidationKey: Helper.generateRandomString(30),
          mobileValidationKey: Helper.generateRandomNumber(4),
          password: User.hashPassword("Secure0")
        });                  

    }
    return _seed();
  }
}