import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { User } from './user';
import { PageTranslation } from './page_translation';
import { Cathegory } from './cathegory';
import { PageCathegory } from './page_cathegory';


export const PageN = 'Not a model';
export const NPage = 'Not a model';

@DefaultScope({
  //where : {isAdmin : false},   //TODO: Handle published or not
  attributes: {exclude : []},
  include: [() => PageTranslation, ()=>Cathegory],
})
@Scopes({
  full: {
      attributes: {exclude : []},
      include: [() => PageTranslation, ()=>Cathegory]
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

    @BelongsToMany(() => Cathegory, () => PageCathegory)
    cathegories!: Cathegory[];

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

  /**Attaches a specif cathegory to the Page */
  public attachCathegory(cathegory: string | number) : Promise<boolean> {
    let myPromise : Promise<boolean>;
    let obj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _add() {
          let myCath;
          if (typeof cathegory == "string")
            myCath = await Cathegory.findOne({where:{"name":cathegory}});
          else 
            myCath = await Cathegory.findByPk(cathegory);

          if (!myCath) {
            reject("Role could not be found");
          } else {
            await obj.$add('Cathegory',[myCath]); 
            resolve(true);
          }
      }
      _add();
    });
    return myPromise;
  }


    //Seeds the table with all pages
    public static seed() {
        async function _seed() {
            try {
                //Create the settings from the config file so that we get the defaults
                for(let item of AppConfig.pages) {
                  let tmpP= await Page.create({
                      page: item.page,
                      image: item.image,
                  });              
                  Object.entries(item.translations).forEach((trans,index)=> {
                        PageTranslation.create({pageId:tmpP.id,iso:trans[0],title:trans[1].title,description:trans[1].description})
                  })
                  //Add cathegories
                  Object.entries(item.cathegories).forEach((cathegory,index)=> {
                        console.log("Adding cathegory",cathegory);
                        tmpP.attachCathegory(cathegory[1]);
                  })
                }     
              
            } catch(err) {
                console.log("ERROR: Could not seed PAGES !!!")
            }
        }
        return _seed();
    }  
}




