import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
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
      include: [() => User]
    },
    reduced: {
      attributes:  ['role']
    }

  })
  
@Table({timestamps:false})
export class Role extends Model<Role> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataTypes.INTEGER().UNSIGNED)
    id!:number;

    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(50))
    name!: string;

    //Relations
    @BelongsToMany(() => User, () => UserRole)
    users!: User[];


    //Seeds the table with plenty of users
    public static seed() {
        async function _seed() {
            try {
              await Role.create({name:"admin"});
              await Role.create({name:"kubiiks"});  //Role that cannot be modified allows to modify the content of the site
              await Role.create({name:"content"});   //Allows to modify content, like posts that are not blog...
              await Role.create({name:"blog"});      //Allows to modify content of blog
              await Role.create({name:"users"});     //Allows access to users
              await Role.create({name:"chat"});      //Allows user to admin chat
              await Role.create({name:"email"});     //Allows user to send emails
              await Role.create({name:"stats"});     //Allows user to see stats
            } catch(err) {
                console.log("ERROR: Could not seed USERS !!!")
            }
        }
        return _seed();
    }  
}




