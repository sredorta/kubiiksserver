import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import { Email } from './email';
import { Onpush } from './onpush';

export const OnpushTranslationN = 'Not a model';
export const NOnpushTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table({timestamps:false})
export class OnpushTranslation extends Model<OnpushTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  /**onpush Id that this translations refers to */
  @ForeignKey(() => Onpush)
  @Column
  onpushId!: number;  

  /**Iso language of the tranlsation: fr,es,en... */
  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  /**Short description of the notification template to show in admin */  
  @AllowNull(false)
  @Column(DataTypes.STRING(500))
  description!: string; 

  /**Title of the notification */  
  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  title!: string; 

  /**Body of the notification*/
  @AllowNull(false)
  @Column(DataTypes.STRING(1000))
  body!: string;  

  /**Onpush that this translation belongs to */
  @BelongsTo(() => Onpush)
  onpush!: Onpush;

}