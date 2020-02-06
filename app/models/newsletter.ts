import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, BelongsToMany, DefaultScope,Scopes} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import {UserRole} from './user_role';
import {User} from './user';


export const NewsletterN = 'Not a model';
export const NNewsletter = 'Not a model';

@DefaultScope({
  attributes: {exclude : []}
  })
  @Scopes({})
  
@Table({timestamps:false})
export class Newsletter extends Model<Newsletter> {

    @PrimaryKey
    @AutoIncrement
    @Column(DataTypes.INTEGER().UNSIGNED)
    id!:number;

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(100))
    firstName!:string;

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(100))
    lastName!:string;

    @AllowNull(false)
    @Unique(true)
    @Column(DataTypes.STRING(128))
    email!:string;

    @AllowNull(false)
    @Unique(false)
    @Column(DataTypes.STRING(5))
    language!:string;    

    //Seeds the table with plenty of users
    public static seed() {
        async function _seed() {
            try {
              await Newsletter.create({firstName:"Prénom1",lastName:"Nom1", email:"prenom1.nom1@hotmail.com",language:"fr"});
              await Newsletter.create({firstName:"Prénom2",lastName:"Nom2", email:"prenom2.nom2@hotmail.com",language:"fr"});

            } catch(err) {
                console.log("ERROR: Could not seed Newsletter !!!")
            }
        }
        return _seed();
    }  
    /**Subscribe email to the newsletter*/
    static subscribe(firstName:string,lastName:string,email:string,language:string) {
        let myPromise : Promise<boolean>;
        myPromise =  new Promise<boolean>((resolve,reject) => {
          async function _getData() {
            try {
                let found = await Newsletter.findOne({where:{email:email}});
                if (found) resolve(true);
                else {
                    await Newsletter.create({firstName:firstName,lastName:lastName,email:email,language:language});
                    resolve(true);
                }
            } catch(error) {
               resolve(false);
            }
          }
          _getData();
        });
        return myPromise;
    }

    /**Unsubscribe email from the newsletter*/
    static unsubscribe(email:string) {
        let myPromise : Promise<boolean>;
        myPromise =  new Promise<boolean>((resolve,reject) => {
          async function _getData() {
            try {
                let found = await Newsletter.findOne({where:{email:email}});
                if (!found) reject(false);
                else {
                    await found.destroy();
                    resolve(true);
                }
            } catch(error) {
               resolve(false);
            }
          }
          _getData();
        });
        return myPromise;
    }

}




