import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, ForeignKey,DefaultScope} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import {User} from './user';
import {Role} from './role';

export const UserRoleN = 'Not a model';
export const NUserRole = 'Not a model';

@DefaultScope({})

@Table({timestamps:false})
export class UserRole extends Model<UserRole> {

    @ForeignKey(() => User)
    @Column
    userId!: number;
   
    @ForeignKey(() => Role)
    @Column
    roleId!: number;

  public static seed() {
    async function _seed() {
 
    }
    return _seed();
  }
}
