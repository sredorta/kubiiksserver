import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey, HasMany, AfterFind, BeforeFind, BeforeRestore} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';


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




}




