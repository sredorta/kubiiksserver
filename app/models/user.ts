import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes, BelongsToMany} from 'sequelize-typescript';
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
    attributes: {exclude : ['password','isEmailValidated','emailValidationKey','isMobileValidated', 'mobileValidationKey']},
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
  @Unique(true)
  @Column(DataTypes.STRING(50))
  phone!:string;

  @AllowNull(true)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  mobile!:string;

  @AllowNull(true)
  @Default(false)
  @Column(DataTypes.STRING(50))
  isEmailValidated!:boolean;

  @AllowNull(false)
  @Column(DataTypes.STRING(30))
  emailValidationKey!:string;

  @AllowNull(true)
  @Default(false)
  @Column(DataTypes.STRING(50))
  isMobileValidated!:boolean;

  @AllowNull(false)
  @Column(DataTypes.STRING(4))
  mobileValidationKey!:string;

  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  password!:string;


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
}