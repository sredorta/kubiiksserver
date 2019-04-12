import { Sequelize, Model, DataTypes, BuildOptions, ModelAttributes } from 'sequelize';
import { HasManyGetAssociationsMixin, HasManyAddAssociationMixin, HasManyHasAssociationMixin, Association, HasManyCountAssociationsMixin, HasManyCreateAssociationMixin } from 'sequelize';
import {Account} from './account';
import errorMiddleware from '../middleware/error.middleware';
import HttpException from '../classes/HttpException';

export class User extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public firstName!: string;
    public email!:string;
    public preferredName!: string | null; // for nullable fields
  
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    public getAccounts: HasManyGetAssociationsMixin<Account>;
    public createAccount: HasManyCreateAssociationMixin<Account>;

    public readonly accounts?: Account[];

    public static associations: {
        accounts: Association<User, Account>;
    }

    


    public static definition(sequelize : Sequelize) {
        return { params :{
               id: {
                type: new DataTypes.INTEGER().UNSIGNED,
                autoIncrement: true,
                primaryKey: true,
                },
                firstName: {
                type: new DataTypes.STRING(128),
                allowNull: false,
                },
                email: {
                    type: new DataTypes.STRING(128),
                    allowNull: false,
                    validate : {isEmail:true}
                },
                preferredName: {
                type: new DataTypes.STRING(128),
                allowNull: true
                }
            }, table: {
                tableName: 'users',
                modelName: 'user',
                sequelize: sequelize
            }};
        }
    public static table(sequelize: Sequelize) {
        return {                
            tableName: 'users',
            modelName: 'user',
            sequelize: sequelize
        }
    }    

    //Seeds the table with plenty of users
    public static seed() {


    }
    //Creates an user with the data initialyzed on the user object
    async insert() {
        User.create({
            firstName: "sergi",
            email: "test",
            preferredName: 'WithAccounts',
        }).then((result)=> {
            console.log(result);
        }).catch( (error) => {
            console.log("We got error !!!");
            //new HttpException(200, 'Error test !!!!')
        });
/*        async function stuff() {
        const newUser = await User.create({
            firstName: "sergi",
            email: "test@test.com",
            preferredName: 'WithAccounts',
          });
          console.log(newUser.id, newUser.firstName, newUser.preferredName);
        
          const project = await newUser.createAccount({
            level: 'first!',
          });
        
          const ourUser = await User.findByPk(1, {
            include: [User.associations.accounts],
            rejectOnEmpty: true, // Specifying true here removes `null` from the return type!
          });
          console.log(ourUser.accounts![0].level); // Note the `!` null assertion since TS can't know if we included
          return(ourUser.accounts![0].level);*/
        //} 
        //return stuff();
        //return await User.create({firstName:this.firstName, preferredName: this.preferredName});
    }

    create() {
        let newUser;
        async function addUser()
            {    
                newUser = await User.create({
                    name: 'Johnny',
                    preferredName: 'John',
                });
            }
        addUser();
      return newUser;
      /*
        User.create({name:this.name, preferredName:this.preferredName}).then(function(res){
            return res;
        })*/
    }


}

/*
      async function addUser()
        {    const newUser = await User.create({
        name: 'Johnny',
        preferredName: 'John',
        });
        return newUser;
        }
        addUser().then(function(result) {
            res.send(result);
        })*/