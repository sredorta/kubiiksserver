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

  /**Title of the email. Typically this is the company name */
  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  title!: string;

  /**Subtitle of the email. Typically we add here: Validate your email account... */
  @AllowNull(false)
  @Column(DataTypes.STRING(500))
  subtitle!: string;  

  /**Flexible content that se put just after the real header */
  @AllowNull(false)
  @Column(DataTypes.STRING(5000))
  header!: string;

  /**Flexible main content*/
  @AllowNull(false)
  @Column(DataTypes.STRING(5000))
  content!: string;

  /**Email that this translation belongs to */
  @BelongsTo(() => Email)
  email!: Email;

}