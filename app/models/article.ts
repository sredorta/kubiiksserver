import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
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

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  page!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  cathegory!: string;

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

      /////////////////////////////////////////////////////////////////////////////////////
      //Legal part
      ////////////////////////////////////////////////////////////////////////////////////
      let myArticle = await Article.create({
        page:"legal",
        key:"legal-cookies",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1 cookies</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1 cookies</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido 1 cookies</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut 1 cookies</h1>"});  

      myArticle = await Article.create({
        page:"legal",
        key:"legal-user-data",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1 user-data</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1 user-data</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido 1 user-data</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut user-data</h1>"});                      



      /////////////////////////////////////////////////////////////////////////////////////
      //Home part
      ////////////////////////////////////////////////////////////////////////////////////
      myArticle = await Article.create({
        page:"home",
        key:"dialog-initial",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Dialogue initiale",description:"Dialogue initial qui apparait apres 5s",content:"<h1>Mon dialoge</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Initial dialog",description:"Initial dialog that appears after 5s",content:"<h1>My dialog</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Dialogo inicial",description:"Dialogo inicial que aparece after 5s",content:"<h1>Mi dialogo</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"Diàleg inicial",description:"Diàleg inicial que apareix despres de 5s",content:"<h1>El meu dialeg</h1>"});                      

      myArticle = await Article.create({
        page:"home",
        key:"home-header",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido 1</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut</h1>"});                      

      myArticle = await Article.create({
        page:"home",
        key:null,
        cathegory: "home-features",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"home-features titre 1",description:" features description fr 1",content:"<h1>home-features contenu 1</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"home-features title 1",description:" features description en 1",content:"<h1>home-features content 1</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"home-features titulo 1",description:"features descripcion es 1",content:"<h1>home-features conteido 1</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"home-features titol 1",description:"features descripcion es 1",content:"<h1>home-features conteido 1</h1>"});             

      myArticle = await Article.create({
        page:"home",
        key:null,
        cathegory: "home-features",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"home-features titre 2",description:" features description fr 2",content:"<h1>home-features contenu 2</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"home-features title 2",description:" features description en 2",content:"<h1>home-features content 2</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"home-features titulo 2",description:"features descripcion es 2",content:"<h1>home-features conteido 2</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"home-features titol 2",description:"features descripcion es 2",content:"<h1>home-features conteido 2</h1>"});             

      myArticle = await Article.create({
        page:"home",
        key:"home-footer",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu pied de page</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content footer</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido pie de pagina</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut peu de pagina</h1>"});                      

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // BLOG PART
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////

      myArticle = await Article.create({
        page:"blog",
        key:"blog-header",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido 1</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut</h1>"});                      

      myArticle = await Article.create({
        page:"blog",
        key:null,
        cathegory: "blog-item",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"blog-item titre 1",description:"blog description fr 1",content:"<h1>blog-item contenu 1</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"blog-item title 1",description:"blog description en 1",content:"<h1>blog-item content 1</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"blog-item titulo 1",description:"blog descripcion es 1",content:"<h1>blog-item contenido 1</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"blog-item titol 1",description:"blog descripcion ca 1",content:"<h1>blog-item contingut 1</h1>"});             

      myArticle = await Article.create({
        page:"blog",
        key:null,
        cathegory: "blog-item",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"blog-item titre 2",description:"blog description fr 2",content:"<h1>blog-item contenu 2</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"blog-item title 2",description:"blog description en 2",content:"<h1>blog-item content 2</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"blog-item titulo 2",description:"blog descripcion es 2",content:"<h1>blog-item conteido 2</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"blog-item titol 2",description:"blog descripcion ca 2",content:"<h1>blog-item conteido 2</h1>"});             

      myArticle = await Article.create({
        page:"blog",
        key:"blog-footer",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu pied de page</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content footer</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido pie de pagina</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut peu de pagina</h1>"});                      

      //////////////////////////////////////////////////////////////////////////////////////////////////////////////
      // CONTACT PART
      /////////////////////////////////////////////////////////////////////////////////////////////////////////////

      myArticle = await Article.create({
        page:"contact",
        key:"contact-header",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido 1</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut</h1>"});                      

      myArticle = await Article.create({
        page:"contact",
        key:"contact-footer",
        cathegory: "kubiiks",
        image:null
      });                    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu pied de page</h1>"});  
      await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content footer</h1>"});    
      await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>contenido pie de pagina</h1>"});             
      await ArticleTranslation.create({articleId:myArticle.id, iso:"ca",title:"titol 1",description:"descripcio ca 1",content:"<h1>contingut peu de pagina</h1>"});                      


    }
    return _seed();
  }
}

