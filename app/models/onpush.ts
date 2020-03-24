import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { OnpushTranslation } from './onpush_translation';


export const OnpushN = 'Not a model';
export const NOnpush = 'Not a model';

@DefaultScope({
  attributes: {exclude : []},
  include: [() => OnpushTranslation]
})
@Scopes({
  full: {
      attributes: {exclude : []},
      include: [() => OnpushTranslation]
  }
})


@Table({timestamps:true})
export class Onpush extends Model<Onpush> {

  /**Name of the template of the email in order for user to select one template */  
  @AllowNull(true)
  @Unique(true)
  @Column(DataTypes.STRING(100))
  name!: string; 

  /**All properties that requires translations */
  @HasMany(() =>OnpushTranslation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  translations!: OnpushTranslation[]; 

  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let myTrans : OnpushTranslation | undefined;
    let result = JSON.parse(JSON.stringify(this));
    delete result.translations;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTrans = this.translations.find(obj => obj.iso == iso);
      if (myTrans) {
        result.description=myTrans.description;
        result.title = myTrans.title;
        result.body = myTrans.body;
      }
    }
    return result;
  }  

 /**Seeds the table initially */
 public static seed() {
  async function _seed() {

      let myOnpush = await Onpush.create({
          name: "notification-example1",
      });                    
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"fr",description:"Exemple de notification onPush",title:"Exemple de notification",body:"Contenu d'exemple de notification"});  
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"en",description:"Onpush notification example",title:"Example of notification",body:"Content of example of notification"});    
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"es",description:"Ejemplo de notificacion onPush",title:"Ejemplo de notificacion",body:"Contenido del ejemplo de notificacion"});             
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"ca",description:"Exemple de notificació onPush",title:"Exemple de notificació",body:"Contingut del exemple de notificació" });             

      myOnpush = await Onpush.create({
        name: "notification-example2",
      });                    
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"fr",description:"Exemple de notification onPush",title:"Exemple de notification",body:"Contenu d'exemple de notification"});  
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"en",description:"Onpush notification example",title:"Example of notification",body:"Content of example of notification"});    
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"es",description:"Ejemplo de notificacion onPush",title:"Ejemplo de notificacion",body:"Contenido del ejemplo de notificacion"});             
      await OnpushTranslation.create({onpushId:myOnpush.id, iso:"ca",description:"Exemple de notificació onPush",title:"Exemple de notificació",body:"Contingut del exemple de notificació" });             

  }
  return _seed();
}

}




