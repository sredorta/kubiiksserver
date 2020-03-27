import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import { Article } from './article';

export const ArticleTranslationN = 'Not a model';
export const NArticleTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
    attributes: {exclude : []},
  })

@Table({timestamps:false})
export class ArticleTranslation extends Model<ArticleTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  @ForeignKey(() => Article)
  @Column
  articleId!: number;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(100))
  title!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(500))
  description!: string;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10000))
  content!: string;

  @BelongsTo(() => Article)
  article!: Article;

}