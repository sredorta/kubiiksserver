import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';

export const SettingN = 'Not a model';
export const NSetting = 'Not a model';

@DefaultScope({
    attributes: ["id","key","type","value"]
  })

@Table
export class Setting extends Model<Setting> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

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


  public static data : any[] = [];

  public static seed() {
    async function _seed() {
        for(let item of AppConfig.sharedSettings) {
            await Setting.create({
                key: item.key,
                type: "shared",
                value: item.value
            });                
        }
        /*i18n*/
        await Setting.create({
            type: "i18n",
            key: "fallbackLanguage",
            value: "en"
        });
        await Setting.create({
            type: "i18n",
            key: "languages",
            value: "fr,en,es"
        });        
        /*social*/
        await Setting.create({
            type: "social",
            key: "linkFacebook",
            value: "https://www.facebook.com/kubiiks/"
        });          
        await Setting.create({
            type: "social",
            key: "linkGooglePlus",
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
/*
    matInputAppearance: "fill",   //Mat input appearance "outline", "default", "fill"...
    matInputHasLabel: true,
    matInputHasHint: true,*/ 
    console.log("SEED END"); 
    }
    return _seed();
  }
}






        