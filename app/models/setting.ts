import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { SettingTranslation } from './setting_translation';
import { settings } from 'cluster';

export const SettingN = 'Not a model';
export const NSetting = 'Not a model';

export enum SettingType {"shared", "i18n", "social"};

@DefaultScope({
    attributes: ["id","key","type","value"],
    include: [() => SettingTranslation]
  })
@Scopes({
    full: {
      attributes: {exclude : []},
      include: [() => SettingTranslation]
    }
  })
@Table
export class Setting extends Model<Setting> {

  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  type!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(1000))
  value!: string;

  @AllowNull(true)
  //@Default("label")
  @Column(DataTypes.STRING(1000))
  label!: string;

  @AllowNull(true)
  //@Default("placeholder")
  @Column(DataTypes.STRING(1000))
  placeholder!: string;

  @AllowNull(true)
  //@Default("hint")
  @Column(DataTypes.STRING(1000))
  hint!: string;

  @HasMany(() => SettingTranslation)
  translations!: SettingTranslation[];  


  /**Gets the setting value of the specified key */
  public static getByKey(key:string) : Promise<Setting> {
    let myPromise : Promise<Setting>;
    myPromise =  new Promise<Setting>((resolve,reject) => {
      async function _work() {
        let message :string ="";
          let result = await Setting.findOne({where:{"key":key}});
          if (!result) {
            reject(null);
          } else {
            resolve(result);
          }
      }
      _work();
    });
    return myPromise;
  }

  /**Gets all the settings of the specified type */
  public static getByType(type:SettingType) : Promise<Setting[]> {
    let myPromise : Promise<Setting[]>;
    myPromise =  new Promise<Setting[]>((resolve,reject) => {
      async function _work() {
        let message :string ="";
          let result = await Setting.findAll({where:{"type":type}});
          if (!result) {
            reject(null);
          } else {
            resolve(result);
          }
      }
      _work();
    });
    return myPromise;      
  }

  /**From array of settings we get the value of the one that matches they given key*/
  public static getValueFromArray(array:Setting[], key:string) : string | null {
    let result = array.find(obj=> obj.key==key);
    if (result) return result.value;
    return null;
  }

  /**Sanitize output by merging label,hint,placeholder with the language */
  public sanitize(iso:string, scope:"default" | "full" = "default") {
    let result : any;
    let myLabel : string = this.label;
    let myPlaceholder : string = this.placeholder;
    let myHint : string = this.hint;
    let myValue : string = this.value;
    let myTranslatedSetting : SettingTranslation | undefined;

    //Replace label,hint,placeholder of Setting with current language
    if (this.translations.length>0) {
      myTranslatedSetting = this.translations.find(obj => obj.iso == iso);
      if (myTranslatedSetting) {
        myLabel = myTranslatedSetting.label==null?this.label:myTranslatedSetting.label;
        myPlaceholder = myTranslatedSetting.placeholder==null?this.placeholder:myTranslatedSetting.placeholder;
        myHint = myTranslatedSetting.hint==null?this.hint:myTranslatedSetting.hint;
        myValue = myTranslatedSetting.value==null?this.value: myTranslatedSetting.value;
      }
    }
    switch(scope) {
      case "full":  //Do not translate default value and provide translations
        result = {id:this.id,
                    key:this.key,
                    type:this.type,
                    value:this.value,
                    label:myLabel, 
                    placeholder:myPlaceholder,
                    hint:myHint, 
                    translations:this.translations};
      break;
      default:  //Translate default value and do not provide translations, neither label,hint,placeholder
        result = {id:this.id,
          key:this.key,
          type:this.type,
          value:myValue};
    }
    return result;                           

  }

  /**Seeds the table initially */
  public static seed() {
    async function _seed() {
        let mySetting;
        for(let item of AppConfig.sharedSettings) {
            await Setting.create({
                key: item.key,
                type: "shared",
                value: item.value
            });                
        }     
        /*social*/
        mySetting = await Setting.create({
            type: "social",
            key: "linkFacebook",
            value: "https://www.facebook.com/kubiiks/",
            label: "facebook",
            placeholder: "https://www.facebook.com...",
            hint: "Link to your company facebook page, let it empty if you don't have"
        });          
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page facebook de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company facebook page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina facebook de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkGoogleplus",
            value: "https://plus.google.com/u/0/118285710646673394875",
            label: "google plus",
            placeholder: "https://plus.google.com...",
            hint: "Link to your company google plus page, let it empty if you don't have"
        });   
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page google plus de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company google plus page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina google plus de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram",
            value: "https://www.instagram.com/sergiredorta/",
            label: "instagram",
            placeholder: "https://www.instagram.com...",
            hint: "Link to your company instagram page, let it empty if you don't have"
          });   
          await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page instagram de l'entreprise, laisse vide si vous en avez pas"});  
          await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company instagram page, let it empty if you don't have"});    
          await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina instagram de la empresa, deje el campo vacio si no tiene"});             
  

        mySetting = await Setting.create({
            type: "social",
            key: "linkLinkedin",
            value: "https://www.linkedin.com/company/kubiiks/",
            label: "linked in",
            placeholder: "https://www.linkedin.com...",
            hint: "Link to your company linkedIn page, let it empty if you don't have"
        });             
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page linkedin de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company linkedin page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina linkedin de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkTwitter",
            value: "",
            label: "twitter",
            placeholder: "https://www.twitter.com...",
            hint: "Link to your company twitter page, let it empty if you don't have"
        });   
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page twitter de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company twitter page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina twitter de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkYoutube",
            value: "https://www.youtube.com/user/sergiredorta",
            label: "youtube",
            placeholder: "https://www.youtube.com...",
            hint: "Link to your company youtube page, let it empty if you don't have"
        });      
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:null,label:null,placeholder:null,hint:"Lien à votre page youtube de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:null,label:null,placeholder:null,hint:"Link to your company youtube page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:null,label:null,placeholder:null,hint:"Link a la pagina youtube de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "seo",
            key: "title",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"titre en francais",label:"Titre du site",placeholder:"placeholder",hint:"Titre du site web"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"titre in english",label:"Site title",placeholder:"placeholder",hint:"Page's title"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"titre en español",label:"Titulo de la pàgina web",placeholder:"placeholder",hint:"Titulo de la pagina principal"});             
         
        mySetting = await Setting.create({
            type: "seo",
            key: "description",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"description en francais",label:"description",placeholder:"placeholder",hint:"Description de la page"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"description in english",label:"description",placeholder:"placeholder",hint:"Page's description"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"description en español",label:"descripcion",placeholder:"placeholder",hint:"Descripcion de la pagina"});             
         
        mySetting = await Setting.create({
            type: "seo",
            key: "keywords",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"keyword en francais",label:"Mots clefs",placeholder:"placeholder",hint:"Mots clefs pour la recherche"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"keyword in english",label:"Keywords",placeholder:"placeholder",hint:"Keywords for the search"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"keyword en español",label:"Palabras clave",placeholder:"placeholder",hint:"Palabras clave para la busqueda"});             
                 
        mySetting = await Setting.create({
            type: "seo",
            key: "url",
            value: 'https://www.kubiiks.com'
        });

        mySetting = await Setting.create({
            type: "seo",
            key: "url_image",
            value: 'https://www.kubiiks.com/api/my-image.jpg'
        });

        mySetting = await Setting.create({
            type: "seo",
            key: "sitename",
            value: 'kubiiks'
        });
        //let res = await Setting.findByPk(16);
        //console.log(res);
           
        //let mySettingTranslation = SettingTranslation.build({iso:"fr",value:"valeur en fracais"});  
        //mySetting.$create('translations',mySettingTranslation);


/*
    matInputAppearance: "fill",   //Mat input appearance "outline", "default", "fill"...
    matInputHasLabel: true,
    matInputHasHint: true,*/ 

    }
    return _seed();
  }
}






        