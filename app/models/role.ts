import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import AppConfig from '../config/config.json';
import {UserRole} from './user_role';
import {User} from './user';


export const SettingN = 'Not a model';
export const NSetting = 'Not a model';

@Table
export class Role extends Model<Role> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataTypes.INTEGER().UNSIGNED)
    id!:number;

    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(50))
    role!: string;

    //Relations
    @BelongsToMany(() => User, () => UserRole)
    users!: User[];


    //Seeds the table with plenty of users
    public static seed() {
        console.log("ROLE:: Seeding table !");
        async function _seed() {
            try {
            await Role.create({role:"chat"});
            await Role.create({role:"admin"});
            } catch(err) {
                console.log("ERROR: Could not seed ROLES !!!")
            }
        }
        _seed();
    }  
}




