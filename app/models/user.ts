import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes, BelongsToMany, Is} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import jwt from "jsonwebtoken";
import {AppConfig} from '../utils/Config';
import bcrypt from "bcryptjs";

import {Role} from './role';
import {UserRole} from './user_role';
import { IJwtPayload } from '../controllers/auth.controller';
import { Helper } from '../classes/Helper';




export const UserN = 'Not a model';
export const NUser = 'Not a model';

//Default scope only contains the public data
@DefaultScope({
  attributes:  ['id','firstName','lastName','email', 'phone', 'mobile','language', 'terms','createdAt','updatedAt']
})
@Scopes({
  withRoles: {
    attributes:  ['id','firstName','lastName','email', 'phone', 'mobile','language','createdAt','updatedAt'],
    include: [() => Role]
  },
  full: {
    attributes: {exclude : []}
  },
  fullWidthRoles: {
    attributes: {exclude : []},
    include: [() => Role],
  }
})

@Table
export class User extends Model<User> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

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

  //Relations
  @BelongsToMany(() => Role, () => UserRole)
  roles!: Role[];



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


  /**Checks if user has specific role */
  public hasRole(role:string | number) : Promise<boolean> {
    let myPromise : Promise<boolean>;
    let id = this.id;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _hasRole() {
          let myUser = await User.scope("withRoles").findByPk(id);
          if (!myUser)
            reject("User could not be found");
          else {
            console.log("Finding if user has roles !!!");
            console.log(myUser.roles.findIndex(obj => obj.name == role));            
            if (typeof role == "string")
              if (myUser.roles.findIndex(obj => obj.name == role) >= 0) resolve(true);
              else reject("Role not found");
            else
              if (myUser.roles.findIndex(obj => obj.id == role) >= 0) resolve(true);
              else reject("Role not found");              
          }
      }
      _hasRole();
    });
    return myPromise;


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