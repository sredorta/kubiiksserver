import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import { Page } from './page';

export const PageTranslationN = 'Not a model';
export const NPageTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table({timestamps:false})
export class PageTranslation extends Model<PageTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  @ForeignKey(() => Page)
  @Column
  pageId!: number;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  title!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(500))
  description!: string;  

  @BelongsTo(() => Page)
  page!: Page;

}