import { Sequelize, Model, DataTypes, BuildOptions, ModelAttributes } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import {Account} from './account';

export class User extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.

    public firstName!: string;
    public email!:string;
    public preferredName!: string | null; // for nullable fields
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getAccounts!: HasManyGetAssociationsMixin<Account>;
    public createAccount!: HasManyCreateAssociationMixin<Account>;


    public readonly accounts?: Account[];

    public static associations: {
        accounts: Association<User, Account>;
    }

    


    public static definition(sequelize : Sequelize) {
        return { params :{
               id: {
                    type: new DataTypes.INTEGER().UNSIGNED,
                    autoIncrement: true,
                    primaryKey: true,
                },
                firstName: {
                    type: new DataTypes.STRING(50),
                    allowNull: false,
                },
                lastName: {
                    type: new DataTypes.STRING(50),
                    allowNull: false,
                },                
                email: {
                    type: new DataTypes.STRING(128),
                    allowNull: false,
                    validate : {isEmail:true}
                }
            }, table: {
                tableName: 'users',
                modelName: 'user',
                sequelize: sequelize
            }};
        }

    //Seeds the table with plenty of users
    public static seed() {


    }

}




        