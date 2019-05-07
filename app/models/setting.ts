import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,HasMany} from 'sequelize-typescript';
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

  @HasMany(() => SettingTranslation)
  translations!: SettingTranslation[];  

  /**Translate with the current language */
  public static translate(settings:Setting[]) {


  }


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


  /**Seeds the table initially */
  public static seed() {
    async function _seed() {
        for(let item of AppConfig.sharedSettings) {
            await Setting.create({
                key: item.key,
                type: "shared",
                value: item.value
            });                
        }     
        /*social*/
        await Setting.create({
            type: "social",
            key: "linkFacebook",
            value: "https://www.facebook.com/kubiiks/"
        });          
        await Setting.create({
            type: "social",
            key: "linkGoogleplus",
            value: "https://plus.google.com/u/0/118285710646673394875"
        });   
        await Setting.create({
            type: "social",
            key: "linkInstagram",
            value: "https://www.instagram.com/sergiredorta/"
        });   
        await Setting.create({
            type: "social",
            key: "linkLinkedin",
            value: "https://www.linkedin.com/company/kubiiks/"
        });                           
        await Setting.create({
            type: "social",
            key: "linkTwitter",
            value: ""
        });   
        await Setting.create({
            type: "social",
            key: "linkYoutube",
            value: "https://www.youtube.com/user/sergiredorta"
        });      
        let mySetting = await Setting.create({
            type: "seo",
            key: "title",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"titre en francais"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"titre in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"titre en español"});             
         
        mySetting = await Setting.create({
            type: "seo",
            key: "description",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"description en francais"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"description in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"description en español"});             
         
        mySetting = await Setting.create({
            type: "seo",
            key: "keywords",
            value: 'Fallback text'
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"keyword en francais"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"keyword in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"keyword en español"});             
                 

        //let res = await Setting.findByPk(16);
        //console.log(res);
           
        //let mySettingTranslation = SettingTranslation.build({iso:"fr",value:"valeur en fracais"});  
        //mySetting.$create('translations',mySettingTranslation);


/*
    matInputAppearance: "fill",   //Mat input appearance "outline", "default", "fill"...
    matInputHasLabel: true,
    matInputHasHint: true,*/ 
    console.log("SEED END"); 
    }
    return _seed();
  }
}






        