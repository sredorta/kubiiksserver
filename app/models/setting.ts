import { Sequelize, Model, DataTypes } from 'sequelize';

export class Setting extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.

    public key!: string;
    public value!:string;
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;


    public static definition(sequelize : Sequelize) {
        return { params :{
               id: {
                type: new DataTypes.INTEGER().UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                },
               key: {
                type: new DataTypes.STRING(50),
                allowNull: false,
                unique: true
                },
               value: {
                    type: new DataTypes.STRING(50),
                    allowNull: false,
                    defaultValue: ""
                },
            }, table: {
                tableName: 'settings',
                modelName: 'setting',
                sequelize: sequelize
            }};
        }

    //Seeds the table with all the defaults
    public static seed() {
        async function _seed() {
            console.log("SEED START");
            await Setting.create({
                key: "test1",
                value: "value1"
            });
            await Setting.create({
                key:  "test2",
                value: "value2"
            })
            console.log("SEED END");
        }
        return _seed();

    }

}




        