import { Sequelize, Model, DataTypes, BuildOptions, ModelAttributes } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import bcrypt from "bcryptjs";

export class Account extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public access!: string;
    public password!: string;
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

//    public getAccounts: HasManyGetAssociationsMixin<Accounts>;

    //Hashes a password to store in db
    public static hashPassword(unencrypted:string) : string {
        return bcrypt.hashSync(unencrypted,8);
    }

    //Checks matching for unencrypted password against encrypted
    public checkPassword(unencryptedPassword:string) : boolean {
        return bcrypt.compareSync(unencryptedPassword, this.password);
    }


    public static definition(sequelize : Sequelize) {
        return { params :{
            id: {
                type: new DataTypes.INTEGER().UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                },
            userId: {
                type: new DataTypes.INTEGER().UNSIGNED,
                allowNull: false,
                },
            password: {
                type: new DataTypes.STRING(255),
                allowNull:false
            },
            access: {
                type: new DataTypes.STRING(50),
                allowNull: false,
                defaultValue: "standard"
                }

            }, table: {
                tableName: 'accounts',
                modelName: 'account',
                sequelize: sequelize,
                defaultScope: {
                    attributes: { exclude: ['password'] },
                }, 
                scopes: {
                    all: {
                        attributes: { }
                    }
                }
            }};
    }    

    //Seeds the table with plenty of users
    public static seed() {


    }


}
