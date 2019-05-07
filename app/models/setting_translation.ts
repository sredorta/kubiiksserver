import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope, ForeignKey, BelongsTo} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { Setting } from './setting';

export const SettingTranslationN = 'Not a model';
export const NSettingTranslation = 'Not a model';

@DefaultScope({
    //attributes: ["id","key","type","value"]
  })

@Table
export class SettingTranslation extends Model<SettingTranslation> {

  @PrimaryKey
  @AutoIncrement
  @Column(DataTypes.INTEGER().UNSIGNED)
  id!:number;

  @ForeignKey(() => Setting)
  @Column
  settingId!: number;  

  @AllowNull(false)
  @Column(DataTypes.STRING(10))
  iso!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(1000))
  value!: string;

  @BelongsTo(() => Setting)
  setting!: Setting;

  /**Gets the setting value of the specified key */
/*  public static getByKey(key:string) : Promise<Setting> {
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
  }*/

  /**Gets all the settings of the specified type */
/*  public static getByType(type:SettingType) : Promise<Setting[]> {
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
  }*/

  /**From array of settings we get the value of the one that matches they given key*/
/*  public static getValueFromArray(array:Setting[], key:string) : string | null {
    let result = array.find(obj=> obj.key==key);
    if (result) return result.value;
    return null;
  }*/



  /**Seeds the table initially */
  public static seed() {
  }
}






        