import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import {UserRole} from './user_role';
import {User} from './user';


export const RoleN = 'Not a model';
export const NRole = 'Not a model';

@DefaultScope({
    attributes: {exclude : []}
  })
  @Scopes({
    withUsers: {
      attributes: {exclude : []},
      //include: [() => User]
    },
    reduced: {
      //attributes:  ['role']
    }

  })
  
@Table
export class Product extends Model<Product> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataTypes.INTEGER().UNSIGNED)
    id!:number;

    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(50))
    field1!: string;

    @AllowNull(true)
    @Unique(true)
    @Column(DataTypes.STRING(50))
    field2!: string;    
    //Relations
    //@BelongsToMany(() => User, () => UserRole)
    //users!: User[];


    //Seeds the table with plenty of users
    public static seed() {
/*        console.log("ROLE:: Seeding table !");
        async function _seed() {
            try {
            await Role.create({role:"chat"});
            await Role.create({role:"admin"});
            } catch(err) {
                console.log("ERROR: Could not seed ROLES !!!")
            }
        }
        return _seed();*/
    }  
}




