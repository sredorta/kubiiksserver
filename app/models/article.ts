import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { ArticleTranslation } from './article_translation';


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

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  cathegory!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  image!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  public!: boolean;  

  @HasMany(() => ArticleTranslation)
  translations!: ArticleTranslation[];  

  /**Sanitize output by removing all languages except request */
  public sanitize(iso:string,scope:"summary" | "full") {
    let result : any = JSON.parse(JSON.stringify(this));  
    if (this.translations.length>0) {
      let myTranslation = this.translations.find(obj => obj.iso == iso);
      if (myTranslation) {
        result.translations = [];
        result.translations.push(JSON.parse(JSON.stringify(myTranslation)));
      }
    }
    switch (scope) {
        case "summary":
            let index : number =0;
            for (let translation of result.translations) {
                delete translation.content;
                index = index+1;
            }
            break;
        default: {}        
    }
    return result;
  }  

  /**Seeds the table initially */
  public static seed() {
    async function _seed() {

        let myArticle = await Article.create({
                cathegory: "realisations",
                image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>conteido 1</h1>"});             

        myArticle = await Article.create({
            cathegory: "realisations",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 2",description:"description fr 2",content:"<h1>contenu 2</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2",description:"description en 2",content:"<h1>content 2</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2",description:"descripcion es 2",content:"<h1>conteido 2</h1>"});             

        myArticle = await Article.create({
            cathegory: "realisations",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 3",description:"description fr 3",content:"<h1>contenu 3</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 3",description:"description en 3",content:"<h1>content 3</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 3",description:"descripcion es 3",content:"<h1>conteido 3</h1>"});             

        myArticle = await Article.create({
            cathegory: "blog",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1 blog",description:"description fr 1 blog",content:"<h1>contenu 1 blog</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1 blog",description:"description en 1 blog",content:"<h1>content 1 blog</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1 blog",description:"descripcion es 1 blog",content:"<h1>conteido 1 blog</h1>"});             

        myArticle = await Article.create({
            cathegory: "blog",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 2 blog",description:"description fr 2 blog",content:"<h1>contenu 1 blog</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2 blog",description:"description en 2 blog",content:"<h1>content 1 blog</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2 blog",description:"descripcion es 2 blog",content:"<h1>conteido 1 blog</h1>"});             

        myArticle = await Article.create({
            cathegory: "content",
            image:null
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1 content",description:"description fr 1 content",content:"<h1>contenu 1 content</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1 content",description:"description en 1 content",content:"<h1>content 1 content</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1 content",description:"descripcion es 1 content",content:"<h1>conteido 1 content</h1>"});             

        myArticle = await Article.create({
            cathegory: "content",
            image:null
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 2 content",description:"description fr 2 content",content:"<h1>contenu 1 content</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2 content",description:"description en 2 content",content:"<h1>content 1 content</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2 content",description:"descripcion es 2 content",content:"<h1>conteido 1 content</h1>"});             


    }
    return _seed();
  }
}

