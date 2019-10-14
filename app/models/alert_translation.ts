import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import { Alert } from './alert';

export const AlertTranslationN = 'Not a model';
export const NAlertTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table({timestamps:false})
export class AlertTranslation extends Model<AlertTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  @ForeignKey(() => Alert)
  @Column
  alertId!: number;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  title!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(500))
  message!: string;  

  @BelongsTo(() => Alert)
  alert!: Alert;

}