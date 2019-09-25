import {Table, Model,  DefaultScope} from 'sequelize-typescript';


//This is a default model that is required to have in order to run in production
//It's an empty model not used for anything

export const AccountN = 'Not a model';
export const NAccount = 'Not a model';

@DefaultScope({
  attributes: {exclude : []}
  })
  
@Table({timestamps:false})
export class Account extends Model<Account> {


}




