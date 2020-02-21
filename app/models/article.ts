import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { ArticleTranslation } from './article_translation';
import { Cathegory } from './cathegory';


export const ArticleN = 'Not a model';
export const NArticle = 'Not a model';


@DefaultScope({
    //where : {isAdmin : false},   //TODO: Handle published or not
    attributes: {exclude : []},
    include: [() => ArticleTranslation]
  })
@Scopes({
    full: {
        attributes: {exclude : []},
        include: [() => ArticleTranslation]
    }
  })
@Table({timestamps:true})
export class Article extends Model<Article> {

  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.INTEGER().UNSIGNED)
  order!: number;

  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.STRING(50))
  page!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  cathegory!: string;

  @AllowNull(false)
  @Default('kubiiks')
  @Column(DataTypes.STRING(50))
  disk!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  image!: string;

  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.STRING(300))
  backgroundImage!: string;

  @AllowNull(false)
  @Default(true) //TODO: CHANGE TO FALSE
  @Column(DataTypes.BOOLEAN)
  public!: boolean;  

  @HasMany(() => ArticleTranslation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  translations!: ArticleTranslation[];  




  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let myTrans : ArticleTranslation | undefined;
    let result = JSON.parse(JSON.stringify(this));
    delete result.translations;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTrans = this.translations.find(obj => obj.iso == iso);
      if (myTrans) {
        result.title = myTrans.title;
        result.description = myTrans.description;
        result.content = myTrans.content;
      }
    }
    return result;
  }  

  /**Gets well formatted image for emails */
  getImage() {
    if (!this.image) return AppConfig.api.kiiserverExtHost + "/public/images/defaults/no-photo-available.jpg";
    else return this.image;
  }

  /**Gets well formatted bacgkround image for emails */
  getBackgroundImage() {
    /*if (!this.backgroundImage) {
      return "none";
      //if (this.backgroundImage == "none") return "none";
      //  return AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/no-photo-available.jpg";
    } else */
        return this.backgroundImage;
  }


  /**Seeds the table initially */
  public static seed() {
    async function _seed() {

                //Create the settings from the config file so that we get the defaults
                for(let item of AppConfig.articles) {
                  let disk = 'kubiiks';
                  let myCath = await Cathegory.findOne({where:{name:item.cathegory}});
                  if (myCath) disk = myCath.role;
                  let tmp= await Article.create({
                      order: item.order,
                      page: item.page,
                      key: item.key,
                      cathegory:item.cathegory,
                      disk: disk
                  });              
                  Object.entries(item.translations).forEach((trans,index)=> {
                        ArticleTranslation.create({articleId:tmp.id,iso:trans[0],title:trans[1].title,description:trans[1].description, content: trans[1].content})
                  })
                }   

    }
    return _seed();
  }
}

