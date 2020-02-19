import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
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

  /**Key that is used for finding the setting */
  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  /**Contains the context where the setting is needed */
  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  type!: string;

  /**Value of the setting if it's defined no translation are asumed */
  @AllowNull(true)
  @Column(DataTypes.STRING(40000))
  value!: string;

  /**Translations of the value if value is defined null */
  @HasMany(() => SettingTranslation)
  translations!: SettingTranslation[];  

  /**Return if setting has translations or not */
  hasTranslations() {
    if (this.translations)
      if (this.translations.length>0)
        return true;
    return false;    
  }

  /**From array of settings we get the value of the one that matches the given key*/
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
      //Create the settings from the config file so that we get the defaults
        for(let item of AppConfig.settings) {
            let tmpS= await Setting.create({
                key: item.key,
                type: item.type,
                value: item.value
            });              
            if (item.value == null) {
              if (item.translations) {
                Object.entries(item.translations).forEach((trans,index)=> {
                  SettingTranslation.create({settingId:tmpS.id,iso:trans[0],value:trans[1].value})
                })
              }
            }
        }     
    }
    return _seed();
  }
}






        