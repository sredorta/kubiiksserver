import { Sequelize, Model, DataTypes, BuildOptions, ModelAttributes } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';

export class Account extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public level!: string;
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

//    public getAccounts: HasManyGetAssociationsMixin<Accounts>;



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
            level: {
                type: new DataTypes.STRING(128),
                allowNull: false,
                }
            }, table: {
                tableName: 'accounts',
                modelName: 'account',
                sequelize: sequelize
            }};
    }    

    //Seeds the table with plenty of users
    public static seed() {


    }


}
