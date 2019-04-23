import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, ForeignKey,DefaultScope} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import {User} from './user';
import {Role} from './role';

export const SettingN = 'Not a model';
export const NSetting = 'Not a model';

@DefaultScope({
    attributes: {exclude : ['UserRole']}
  })
@Table
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
