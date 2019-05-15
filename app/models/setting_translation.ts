import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { Setting } from './setting';

export const SettingTranslationN = 'Not a model';
export const NSettingTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table({timestamps:false})
export class SettingTranslation extends Model<SettingTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  @ForeignKey(() => Setting)
  @Column
  settingId!: number;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(1000))
  value!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(1000))
  label!: string;  

  @AllowNull(true)
  @Column(DataTypes.STRING(1000))
  placeholder!: string;  

  @AllowNull(true)
  @Column(DataTypes.STRING(1000))
  hint!: string;  

  @BelongsTo(() => Setting)
  setting!: Setting;

}






        