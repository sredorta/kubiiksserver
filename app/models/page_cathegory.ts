import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, ForeignKey,DefaultScope} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import {User} from './user';
import {Role} from './role';
import { Cathegory } from './cathegory';
import { Page } from './page';

export const PageCathegoryN = 'Not a model';
export const NPageCathegory = 'Not a model';

@DefaultScope({})

@Table({timestamps:false})
export class PageCathegory extends Model<PageCathegory> {

    @ForeignKey(() => Page)
    @Column
    pageId!: number;
   
    @ForeignKey(() => Cathegory)
    @Column
    cathegoryId!: number;

  public static seed() {
    async function _seed() {
 
    }
    return _seed();
  }
}
