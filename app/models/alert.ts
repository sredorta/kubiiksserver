import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { User } from './user';
import { AlertTranslation } from './alert_translation';


export const AlertN = 'Not a model';
export const NAlert = 'Not a model';

@DefaultScope({
  //where : {isAdmin : false},   //TODO: Handle published or not
  attributes: {exclude : []},
  include: [() => AlertTranslation]
})
@Scopes({
  full: {
      attributes: {exclude : []},
      include: [() => AlertTranslation]
  }
})
  
@Table({timestamps:true})
export class Alert extends Model<Alert> {


    @ForeignKey(() => User)
    @Column
    userId!: number; 

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(50))
    type!: string; 

    @AllowNull(true)
    @Unique(false)
    @Column(DataTypes.STRING(300))
    title!: string;     

    @AllowNull(true)
    @Unique(false)
    @Column(DataTypes.STRING(1000))
    message!: string; 

    @AllowNull(false)
    @Unique(false)
    @Default(false)
    @Column(DataTypes.BOOLEAN)
    isRead!: string;     

    @BelongsTo(() => User)
    user!: User;

    @HasMany(() => AlertTranslation, {
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      hooks: true})
    translations!: AlertTranslation[];  


    //Seeds the table with plenty of users
    public static seed() {
        async function _seed() {
            try {
              let myAlert = await Alert.create({id:1,userId:1,type:"email",title:"My new alert",message:"New order has been created for $100 total"});
              await AlertTranslation.create({alertId:myAlert.id, iso:"fr",title:"Ma nouvelle alerte en francais",message:"Un message en francais d'alerte"});  
              await AlertTranslation.create({alertId:myAlert.id, iso:"en",title:"My new alert in english", message:"A message in english for an alert"});    
              await AlertTranslation.create({alertId:myAlert.id, iso:"es",title:"Mi nueva alerta en español", message:"Un mensaje en español para una alerta"});             
              await AlertTranslation.create({alertId:myAlert.id, iso:"ca",title:"La meva nova alerta en català", message:"Un missatge per una alerta en català"});             
              for (let i=0; i<100; i++) {
              myAlert = await Alert.create({userId:1,type:"email",title:"My new alert",message:"New order has been created for $100 total"});
              await AlertTranslation.create({alertId:myAlert.id, iso:"fr",title:"Ma nouvelle alerte en francais",message:"Un message en francais d'alerte"});  
              await AlertTranslation.create({alertId:myAlert.id, iso:"en",title:"My new alert in english", message:"A message in english for an alert"});    
              await AlertTranslation.create({alertId:myAlert.id, iso:"es",title:"Mi nueva alerta en español", message:"Un mensaje en español para una alerta"});             
              await AlertTranslation.create({alertId:myAlert.id, iso:"ca",title:"La meva nova alerta en català", message:"Un missatge per una alerta en català"});             
              }
            } catch(err) {
                console.log("ERROR: Could not seed ALERTS !!!")
            }
        }
        return _seed();
    }  
}




