import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { User } from './user';
import { PageTranslation } from './page_translation';


export const PageN = 'Not a model';
export const NPage = 'Not a model';

@DefaultScope({
  //where : {isAdmin : false},   //TODO: Handle published or not
  attributes: {exclude : []},
  include: [() => PageTranslation]
})
@Scopes({
  full: {
      attributes: {exclude : []},
      include: [() => PageTranslation]
  }
})
  
@Table({timestamps:false})
export class Page extends Model<Page> {



    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(50))
    page!: string; 

    @AllowNull(true)
    @Column(DataTypes.STRING(300))
    image!: string;


    @HasMany(() => PageTranslation, {
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      hooks: true})
    translations!: PageTranslation[];  

  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let myTrans : PageTranslation | undefined;
    let result = JSON.parse(JSON.stringify(this));
    delete result.translations;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTrans = this.translations.find(obj => obj.iso == iso);
      if (myTrans) {
        result.title = myTrans.title;
        result.description = myTrans.description;
      }
    }
    return result;
  }  

    //Seeds the table with all pages
    public static seed() {
        async function _seed() {
            try {
              let myPage = await Page.create({page:"home"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre accueil", description:"Description accueil"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Home title", description:"Home description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo inicio", description:"Descripcion inicio"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol inici", description:"Descripcio inici"}));
              
              myPage = await Page.create({page:"demo"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre demo", description:"Description demo"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Demo title", description:"Home description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo demo", description:"Descripcion demo"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol demo", description:"Descripcio demo"}));

              myPage = await Page.create({page:"realisations"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre realisations", description:"Description realizations"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Clients title", description:"Clients description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo clientes", description:"Descripcion clientes"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol clients", description:"Descripcio clients"}));

              myPage = await Page.create({page:"prices"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre prix", description:"Description prix"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Prices title", description:"Prices description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo precios", description:"Descripcion precios"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol preus", description:"Descripcio preus"}));
 
              myPage = await Page.create({page:"blog"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre blog", description:"Description blog"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Blog title", description:"Blog description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo blog", description:"Descripcion blog"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol blog", description:"Descripcio blog"}));

              myPage = await Page.create({page:"contact"});
              await PageTranslation.create(({pageId:myPage.id, iso:"fr", title:"Titre contact", description:"Description contact"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"en", title:"Contact title", description:"Contact description"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"es", title:"Titulo contacto", description:"Descripcion contacto"}));
              await PageTranslation.create(({pageId:myPage.id, iso:"ca", title:"Titol contact", description:"Descripcio contact"}));

              
            } catch(err) {
                console.log("ERROR: Could not seed PAGES !!!")
            }
        }
        return _seed();
    }  
}




