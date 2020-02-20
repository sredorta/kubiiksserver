import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany, BelongsTo, ForeignKey, BelongsToMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { SettingTranslation } from './setting_translation';
import { Article } from './article';
import { Page } from './page';
import { PageCathegory } from './page_cathegory';


export const CathegoryN = 'Not a model';
export const NCathegory = 'Not a model';


@Table({timestamps:false})
export class Cathegory extends Model<Cathegory> {
    
  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;
  
  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  name!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  role!: string;

  //Relations
  @BelongsToMany(() => Page, () => PageCathegory)
  pages!: Page[];

  /**Seeds the table initially */
  public static seed() {
    async function _seed() {
      //Create the settings from the config file so that we get the defaults
        for(let item of AppConfig.cathegories) {
            await Cathegory.create({
                name: item.name,
                role: item.role,
            });              
        }     
    }
    return _seed();
  }
}






        