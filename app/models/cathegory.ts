import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { SettingTranslation } from './setting_translation';
import { Article } from './article';


export const CathegoryN = 'Not a model';
export const NCathegory = 'Not a model';


@Table({timestamps:false})
export class Cathegory extends Model<Cathegory> {

  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  name!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  role!: string;



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






        