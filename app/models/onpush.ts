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



@Table({timestamps:true})
export class Onpush extends Model<Onpush> {

  /**Name of the template of the email in order for user to select one template */  
  @AllowNull(true)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  name!: string; 

  /**All properties that requires translations */
  @HasMany(() =>OnpushTranslation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  translations!: OnpushTranslation[]; 

 /**Seeds the table initially */
 public static seed() {
  const defaultData = JSON.stringify(
    {"id":0,"type":"container","bgColor":"#ffffff","txtColor":"black","width":"700","font":"Verdana","fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"14px","blocks":[{"id":1,"type":"block","position":1,"format":"double_2080","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":2,"type":"cell","width":"20%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":10,"paddingLeft":10,"paddingRight":10,"paddingBottom":10,"hAlign":"left","vAlign":"top","widgets":[{"id":6,"position":1,"type":"widget","format":"image","textarea":"Text","url":"","imageUrl":"https://localhost:4300/server/public/images/email/logo-round__1584886485065.png","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]},{"id":3,"type":"cell","width":"80%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":20,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"middle","widgets":[{"id":7,"position":1,"type":"widget","format":"text","textarea":"<p>KUBIIKS</p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"34px","font":"Arial"},{"id":8,"position":2,"type":"widget","format":"text","textarea":"<p><span style=\"color:#808080;\">Créateur d'éperiences web</span></p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"22px"}]}]},{"id":4,"type":"block","position":2,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":5,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[]}]},{"id":9,"type":"block","position":3,"format":"double_7030","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":10,"type":"cell","width":"70%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"right","vAlign":"top","widgets":[{"id":12,"position":1,"type":"widget","format":"text","textarea":"<p><span style=\"color:#c0c0c0;\">Suivez-nous</span></p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"26px"}]},{"id":11,"type":"cell","width":"30%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"center","vAlign":"top","widgets":[{"id":13,"position":1,"type":"widget","format":"button","textarea":"Text","url":"https://www.facebook.com","imageUrl":"https://localhost:4300/server/public/images/email/facebook__1584893306544.png","txtBtn":"Facebook","typeBtn":"image_button","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":48},{"id":14,"position":2,"type":"widget","format":"button","textarea":"Text","url":"https://www.linkedin.com","imageUrl":"https://localhost:4300/server/public/images/email/linkedin__1584892935792.png","txtBtn":"Linkedin","typeBtn":"image_button","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":48}]}]}]}
    );
    
    //{"id":0,"type":"container","bgColor":"#808080","txtColor":"black","width":"700","font":"Verdana","fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"14px","blocks":[]});//{"id":1,"type":"block","position":1,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":2,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[{"id":3,"position":1,"type":"widget","format":"text","textarea":"Text here we are","url":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"26px","font":"Courier New"},{"id":7,"position":2,"type":"widget","format":"text","textarea":"Text klsdfajsdfalkj sfdlkjfsd lsdfakj lsdafkj lsadfkjd fsalkjds faljdsfa ldsfkja lsdfkajlkdfsj dflskjd slfkjdfslkjdfsa lkdfsj lkdfasj ldsfkj dflkj","url":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]}]},{"id":4,"type":"block","position":2,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":5,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[{"id":6,"position":1,"type":"widget","format":"button","textarea":"Text","url":"http://www.google.com","txtBtn":"Text","typeBtn":"stroked","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]}]}]});

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




