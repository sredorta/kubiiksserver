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
  attributes:  ['id','firstName','lastName','email', 'phone', 'mobile', 'terms']
})
@Scopes({
  withRoles: {
    attributes:  ['id','firstName','lastName','email', 'phone', 'mobile'],
    include: [() => Role]
  },
  full: {
    attributes: {exclude : []}
  },
  fullWidthRoles: {
    attributes: {exclude : []},
    include: [() => Role]
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


  /**Returns array with all required missing fields for signup. This can happen when creating account with oauth2 */
  /*public getMissingSignupFields() {
    let result = [];
    if (Helper.isSharedSettingMatch("signup_firstName","include"))
      if (this.firstName == null || this.firstName == undefined) result.push("firstName");
    if (Helper.isSharedSettingMatch("signup_lastName","include"))
      if (this.lastName == null || this.lastName == undefined) result.push("lastName");
    if (Helper.isSharedSettingMatch("signup_email","include"))
      if (this.email == null || this.email == undefined) result.push("email");
    if (Helper.isSharedSettingMatch("signup_mobile","include"))
      if (this.mobile == null || this.mobile == undefined) result.push("mobile");
    if (Helper.isSharedSettingMatch("signup_phone","include"))
      if (this.phone == null || this.phone == undefined) result.push("phone");       
    return result;
  }*/

  /**Validate that user contains all signup required fields. It could be that this is not the case in case of oauth2 account creation */
  /*public hasAllSignupFields() {
    if (this.getMissingSignupFields().length>0) return false;
    return true;
  }*/


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

  /**Attaches a specif role to the user */
  public attachRole(role: string) : Promise<boolean> {
    let myPromise : Promise<boolean>;
    let obj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _addRole() {
        let message :string ="";

          let myRole = await Role.findOne({where:{"role":role}});
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

}