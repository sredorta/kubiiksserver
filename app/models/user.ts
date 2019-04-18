import { Sequelize, Model, DataTypes, BuildOptions, ModelAttributes } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import {Account} from './account';
import {Helper} from '../classes/Helper';
import { HttpException } from '../classes/HttpException';
import {Response,Request,NextFunction, response} from 'express';
import app from '../app';
import { request } from 'http';
import { IsNumber, IsEmail,IsString, MinLength, MaxLength } from 'class-validator';
import validator from 'validator';
import {messages} from '../middleware/common';

export interface IUser {
    id?: number;
    firstName?:string;
    lastName?:string;
    email?:string;

}

export class User extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public firstName!: string;
    public lastName!:string;
    public email!:string;
    public phone!:string;
    public mobile!:string;
    public password!: string;  
    public isEmailValidated!: boolean;
    public emailValidationKey!: string;
    public isMobileValidated!: boolean;
    public mobileValidationKey!:string;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getAccounts!: HasManyGetAssociationsMixin<Account>;
    public createAccount!: HasManyCreateAssociationMixin<Account>;


    public readonly accounts?: Account[];

    public static associations: {
        accounts: Association<User, Account>;
    }


    //TODO move to Account !!!!!
    //Checks if the password matches the encrypted one
    /*public checkPassword(unencryptedPassword:string) {
        return bcrypt.compareSync(unencryptedPassword, this.checkPassword);
    }*/


    public static definition(sequelize : Sequelize) {
        return { params :{
               id: {
                    type: new DataTypes.INTEGER().UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                firstName: {
                    type: new DataTypes.STRING(50),
                    isUUID: 4,
                    allowNull: true,
                },
                lastName: {
                    type: new DataTypes.STRING(50),
                    allowNull: true,
                },                
                email: {
                    type: new DataTypes.STRING(128),
                    allowNull: true,
                    unique: true
                },
                phone:{
                    type: new DataTypes.STRING(50),
                    allowNull: true,
                    unique:true
                },          
                mobile:{
                    type: new DataTypes.STRING(50),
                    allowNull: true,
                    unique:true
                },
                isEmailValidated: {
                    type: DataTypes.BOOLEAN,
                    allowNull:false,
                    defaultValue:false
                },
                emailValidationKey: {
                    type: new DataTypes.STRING(30),
                    allowNull: false,
                },
                isMobileValidated: {
                    type: DataTypes.BOOLEAN,
                    allowNull:false,
                    defaultValue:false
                },
                mobileValidationKey: {
                    type: new DataTypes.STRING(4),
                    allowNull: false,
                },   
                password: {
                    type: new DataTypes.STRING(255),
                    allowNull:false
                },  
                                         
            }, table: {
                tableName: 'users',
                modelName: 'user',
                sequelize: sequelize,
                defaultScope: {
                    attributes: { exclude: ['password','isEmailValidated','emailValidationKey','isMobileValidated', 'mobileValidationKey'] },
                }, 
                scopes: {
                    all: {
                        attributes: { }
                    }
                }
            }};
    }

    //Validates the data before adding an element to the database
    public static validationHook() {
        /*return function(user: User, options:any) {
            async function unique()
            {    
                let userExists = await User.findOne({
                    where: {
                        "email": user.email
                    }
                });
                if (userExists)
                return Promise.reject(new HttpException(400, "custom", messages.validationUnique(messages.user),null));
            }
        return unique();
        };*/
        return function(user: User, options:any) {
            console.log("AFTER VALIDATE HOOK !!!!!!!!!!!!!!!!!!!!");            

        };
    }
    //Seeds the table with plenty of users
    public static seed() {


    }

}





        