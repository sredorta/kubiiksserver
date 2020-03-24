import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import  webPush from 'web-push';


export const OnpushsessionN = 'Not a model';
export const NOnpushsession = 'Not a model';

@DefaultScope({
  //where : {isAdmin : false},   //TODO: Handle published or not
  attributes: {exclude : []},
})



@Table({timestamps:false})
export class Onpushsession extends Model<Onpushsession> {

    /**onpush session name */
    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(100))
    session!: string; 

    /**Language of the onpush session */
    @AllowNull(false)
    @Column(DataTypes.STRING(2))
    language!:string;  

    /**Stores all onPush data for onPush notifications */
    @AllowNull(true)
    @Column(DataTypes.STRING(2000))
    onPush!:string;  

  /**Sends onPush notification to specific the session */
  public async notify(title:string,body:string) {

    let myPromise : Promise<boolean>;
    let myObj = this;
    myPromise =  new Promise<boolean>((resolve,reject) => {
      async function _getData(title:string,body:string) {
        try {
          if (myObj.onPush) {
            let urlBase = AppConfig.api.kiiserverExtHost + "/public/images/defaults/";
            //Get baseURL from settings
            const subscription = JSON.parse(myObj.onPush);
            const payload = JSON.stringify({
              notification: {
                title: title,
                body: body,
                icon: urlBase + 'logo.jpg',
                vibrate: [150, 50, 150],
                action:AppConfig.api.kiiwebExtHost,
                data: {
                  url: AppConfig.api.kiiwebExtHost,
                }
              }
            });
            await webPush.sendNotification(subscription,payload);
            resolve(true);
          } else {
            resolve(false);
          }

        } catch(error) {
          console.log("Got error:", error);
          resolve(false);
       }
     }
     _getData(title,body);
   });
   return myPromise;
  }


}




