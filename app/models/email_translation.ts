import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import { Email } from './email';

export const EmailTranslationN = 'Not a model';
export const NEmailTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table({timestamps:false})
export class EmailTranslation extends Model<EmailTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  /**email Id that this translations refers to */
  @ForeignKey(() => Email)
  @Column
  emailId!: number;  

  /**Iso language of the tranlsation: fr,es,en... */
  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  /**Short description of the template to show in admin */  
  @AllowNull(false)
  @Column(DataTypes.STRING(500))
  description!: string; 

  /**JSON data of the email */
  @AllowNull(false)
  @Column(DataTypes.STRING(25000))
  data!: string;  

  /**Email that this translation belongs to */
  @BelongsTo(() => Email)
  email!: Email;

}