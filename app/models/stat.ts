import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes, BelongsTo, ForeignKey} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';


export const StatN = 'Not a model';
export const NStat = 'Not a model';

@DefaultScope({
  attributes: {exclude : []}
  })
  
@Table({timestamps:true})
export class Stat extends Model<Stat> {

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(50))
    session!: string; 

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(300))
    type!: string;     

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(1000))
    ressource!: string; 

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.DATE)
    start!: Date; 

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.DATE)
    end!: Date; 

    //Seeds the table with plenty of users
    public static seed() {
        async function _seed() {
            try {

            } catch(err) {
                console.log("ERROR: Could not seed STATS !!!")
            }
        }
        return _seed();
    }  
}