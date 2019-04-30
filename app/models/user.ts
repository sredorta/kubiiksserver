import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes, BelongsToMany, Is} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import jwt from "jsonwebtoken";
import {AppConfig} from '../utils/Config';
import bcrypt from "bcryptjs";

import {Role} from './role';
import {UserRole} from './user_role';




export const UserN = 'Not a model';
export const NUser = 'Not a model';

@DefaultScope({
  attributes: {exclude : ['password','isEmailValidated','emailValidationKey','isMobileValidated', 'mobileValidationKey']}
})
@Scopes({
  withRoles: {
    attributes: {exclude : ['password','isEmailValidated','emailValidationKey','isMobileValidated', 'mobileValidationKey','UserRole']},
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
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  isSocial!:boolean;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  facebookId!:string;

  @AllowNull(true)
  @Column(DataTypes.STRING(255))
  facebookToken!:string;


  //Relations
  @BelongsToMany(() => Role, () => UserRole)
  roles!: Role[];


  //Hashes a password to store in db
  public static hashPassword(unencrypted:string) : string {
        return bcrypt.hashSync(unencrypted,8);
  }

  //Checks matching for unencrypted password against encrypted
  public checkPassword(unencryptedPassword:string) : boolean {
      return bcrypt.compareSync(unencryptedPassword, this.password);
  }

  //Generates a token
  public createToken(time: "short" | "long") {
    let expires = AppConfig.auth.accessLong;
    if (time == "short") {
      expires = AppConfig.auth.accessShort;
    }
    return jwt.sign(
      { id: this.id }, //Payload !
      AppConfig.auth.jwtSecret,
      { expiresIn: expires }
    );
  }

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
/*
  let adminRole = await Role.findOne({where:{role:"admin"}});

  console.log(adminRole);   
  if (!adminRole) {
      return next( new HttpException(500, "Admin role not found !!!",null));
  }
  //If we are the first user, then we need to add the admin role
  //If we are in demo mode each new user has an admin role
  if (myUser.id ==1 || Helper.isSharedSettingMatch("mode", "demo")) {
      await myUser.$add('Role',[adminRole]); 
  }
*/

}