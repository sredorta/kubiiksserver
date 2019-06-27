import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { SettingTranslation } from './setting_translation';
import { Article } from './article';


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
@Table({timestamps:false})
export class Setting extends Model<Setting> {

  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  type!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(40000))
  value!: string;

  @HasMany(() => SettingTranslation)
  translations!: SettingTranslation[];  

  /**Return if setting has translations or not */
  hasTranslations() {
    if (this.translations)
      if (this.translations.length>0)
        return true;
    return false;    
  }

  /**From array of settings we get the value of the one that matches they given key*/
  public static getValueFromArray(array:Setting[], key:string) : string | null {
    let result = array.find(obj=> obj.key==key);
    if (result) return result.value;
    return null;
  }

  /**Sanitize output by replacing translated value */
  public sanitize(iso:string) {
    let myValue : string = this.value;
    let myTranslatedSetting : SettingTranslation | undefined;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTranslatedSetting = this.translations.find(obj => obj.iso == iso);
      if (myTranslatedSetting) {
        myValue = myTranslatedSetting.value==null?this.value: myTranslatedSetting.value;
      }
    }
    return {id:this.id,
          key:this.key,
          type:this.type,
          value:myValue};

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
            value: "https://www.facebook.com/kubiiks/"
        });          

        mySetting = await Setting.create({
            type: "social",
            key: "linkGoogleplus",
            value: "https://plus.google.com/u/0/118285710646673394875",
        });   

        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram",
            value: "https://www.instagram.com/sergiredorta/",
         });  

        mySetting = await Setting.create({
            type: "social",
            key: "linkLinkedin",
            value: "https://www.linkedin.com/company/kubiiks/",
        });   

        mySetting = await Setting.create({
            type: "social",
            key: "linkTwitter",
            value: "",
        });   

        mySetting = await Setting.create({
            type: "social",
            key: "linkYoutube",
            value: "https://www.youtube.com/user/sergiredorta",
       });   

        mySetting = await Setting.create({
            type: "seo",
            key: "title",
            value: null
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Titre en français"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Title in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Titulo en español"});

        mySetting = await Setting.create({
            type: "seo",
            key: "description",
            value: null
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"description en francais"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"description in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"description en español"});             
               
        mySetting = await Setting.create({
            type: "seo",
            key: "url",
            value: 'https://www.kubiiks.com',
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

        //General part
        mySetting = await Setting.create({
          type: "general",
          key: "companyPhone",
          value: '0423133212'
        });
        mySetting = await Setting.create({
          type: "general",
          key: "companyAddress",
          value: "374, chemin de l'escure; 06610 Le Bar sur Loup;France"
        });

        mySetting = await Setting.create({
          type: "general",
          key: "companyEmail",
          value: 'sales@kubiiks.com'
        });


        mySetting = await Setting.create({
          type: "general",
          key: "gmapLatLng",
          value: '43.61426,6.959808'
        });

        mySetting = await Setting.create({
          type: "general",
          key: "gmapZoom",
          value: '14',
        });           


    }
    return _seed();
  }
}






        