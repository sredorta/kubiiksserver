import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { User } from './user';


export const AlertN = 'Not a model';
export const NAlert = 'Not a model';

@DefaultScope({
  attributes: {exclude : []}
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

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(300))
    title!: string;     

    @AllowNull(false)
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

    //Seeds the table with plenty of users
    public static seed() {
        async function _seed() {
            try {
              await Alert.create({id:1,userId:1,type:"email",title:"title1",message:"New order has been created for $100 total"});
              await Alert.create({id:2,userId:1,type:"email",title:"title2",message:"New contact email has been recieved"});
              await Alert.create({id:3,userId:1,type:"email",title:"title3",message:"New order has been created for $25 total"});
              await Alert.create({id:4,userId:2,type:"email",title:"title3 user2",message:"New order has been created for $25 total"});
              await Alert.create({id:5,userId:2,type:"email",title:"title3 user2",message:"New order has been created for $25 total"});

            } catch(err) {
                console.log("ERROR: Could not seed ALERTS !!!")
            }
        }
        return _seed();
    }  
}




