import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { SettingTranslation } from './setting_translation';
import { settings } from 'cluster';
import { isSpreadAssignment } from 'typescript';

export const SettingN = 'Not a model';
export const NSetting = 'Not a model';

export enum SettingType {"shared", "i18n", "social"};

@DefaultScope({
    where : {isAdmin : false},
    attributes: ["id","key","type","value"],
    include: [() => SettingTranslation]
  })
@Scopes({
    full: {
      attributes: {exclude : []},
      include: [() => SettingTranslation]
    }
  })
@Table({timestamps:false})
export class Setting extends Model<Setting> {

  @AllowNull(false)
  @Unique(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  type!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(1000))
  value!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  isAdmin!:boolean;


  @HasMany(() => SettingTranslation)
  translations!: SettingTranslation[];  


  /**Gets the setting value of the specified key */
/*  public static getByKey(key:string) : Promise<Setting> {
    let myPromise : Promise<Setting>;
    myPromise =  new Promise<Setting>((resolve,reject) => {
      async function _work() {
        let message :string ="";
          let result = await Setting.findOne({where:{"key":key}});
          if (!result) {
            reject(null);
          } else {
            resolve(result);
          }
      }
      _work();
    });
    return myPromise;
  }*/

  /**Gets all the settings of the specified type */
/*  public static getByType(type:SettingType) : Promise<Setting[]> {
    let myPromise : Promise<Setting[]>;
    myPromise =  new Promise<Setting[]>((resolve,reject) => {
      async function _work() {
        let message :string ="";
          let result = await Setting.findAll({where:{"type":type}});
          if (!result) {
            reject(null);
          } else {
            resolve(result);
          }
      }
      _work();
    });
    return myPromise;      
  }*/

  /**From array of settings we get the value of the one that matches they given key*/
  public static getValueFromArray(array:Setting[], key:string) : string | null {
    let result = array.find(obj=> obj.key==key);
    if (result) return result.value;
    return null;
  }

  /**Sanitize output by replacing translated value */
  public sanitize(iso:string, scope:"default" | "full" = "default") {
    let result : any;
    let myValue : string = this.value;
    let myTranslatedSetting : SettingTranslation | undefined;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTranslatedSetting = this.translations.find(obj => obj.iso == iso);
      if (myTranslatedSetting) {
        myValue = myTranslatedSetting.value==null?this.value: myTranslatedSetting.value;
      }
    }
    switch(scope) {
      case "full":  //Do not translate default value and provide translations
        result = {id:this.id,
                    key:this.key,
                    type:this.type,
                    value:myValue, 
                    translations:this.translations};
      break;
      default:  //Translate default value and do not provide translations, neither label,hint,placeholder
        result = {id:this.id,
          key:this.key,
          type:this.type,
          value:myValue};
    }
    return result;   

  }

  /**Seeds the table initially */
  public static seed() {
    async function _seed() {
        let mySetting;
        for(let item of AppConfig.sharedSettings) {
            await Setting.create({
                key: item.key,
                type: "shared",
                value: item.value
            });                
        }     
        /*social*/
        mySetting = await Setting.create({
            type: "social",
            key: "linkFacebook",
            value: "https://www.facebook.com/kubiiks/",
            label: "facebook",
            placeholder: "https://www.facebook.com...",
            hint: "Link to your company facebook page, let it empty if you don't have"
        });          
        mySetting = await Setting.create({
          type: "social",
          key: "linkFacebook.label",
          value: "facebook",
          isAdmin:true
         });     
        mySetting = await Setting.create({
          type: "social",
          key: "linkFacebook.placeholder",
          value: "https://www.facebook.com...",
          isAdmin: true
         });       
        mySetting = await Setting.create({
          type: "social",
          key: "linkFacebook.hint",
          value: null,
          isAdmin: true
         });         
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page facebook de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company facebook page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina facebook de la empresa, deje el campo vacio si no tiene"});             


        mySetting = await Setting.create({
            type: "social",
            key: "linkGoogleplus",
            value: "https://plus.google.com/u/0/118285710646673394875",
        });   

        mySetting = await Setting.create({
          type: "social",
          key: "linkGoogleplus.label",
          value: "google plus",
          isAdmin:true
        });   

        mySetting = await Setting.create({
          type: "social",
          key: "linkGoogleplus.placeholder",
          value: "https://plus.google.com...",
          isAdmin:true
        });   

        mySetting = await Setting.create({
          type: "social",
          key: "linkGoogleplus.hint",
          value: null,
          isAdmin:true
        });   
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page google plus de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company google plus page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina google plus de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram",
            value: "https://www.instagram.com/sergiredorta/",
         });  
        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram.label",
            value: "instagram",
            isAdmin:true
        }); 
        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram.placeholder",
            value: "https://www.instagram.com...",
            isAdmin:true
        }); 
        mySetting = await Setting.create({
            type: "social",
            key: "linkInstagram.hint",
            value: null,
            isAdmin:true
        });                                
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page instagram de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company instagram page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina instagram de la empresa, deje el campo vacio si no tiene"});             
  

        mySetting = await Setting.create({
            type: "social",
            key: "linkLinkedin",
            value: "https://www.linkedin.com/company/kubiiks/",
        });   
        mySetting = await Setting.create({
          type: "social",
          key: "linkLinkedin.label",
          value: "linked in",
          isAdmin:true
        });   
        mySetting = await Setting.create({
          type: "social",
          key: "linkLinkedin.placeholder",
          value: "https://www.linkedin.com...",
          isAdmin:true
         });   
        mySetting = await Setting.create({
          type: "social",
          key: "linkLinkedin.hint",
          value: null,
          isAdmin:true
        });   
                
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page linkedin de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company linkedin page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina linkedin de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkTwitter",
            value: "",
        });   
        mySetting = await Setting.create({
          type: "social",
          key: "linkTwitter.label",
          value: "twitter",
          isAdmin:true
       });  
        mySetting = await Setting.create({
          type: "social",
          key: "linkTwitter.placeholder",
          value: "https://www.twitter.com...",
          isAdmin:true
        });  
        mySetting = await Setting.create({
          type: "social",
          key: "linkTwitter.hint",
          value: null,
          isAdmin:true
        });                    
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page twitter de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company twitter page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina twitter de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "social",
            key: "linkYoutube",
            value: "https://www.youtube.com/user/sergiredorta",
       });   
        mySetting = await Setting.create({
          type: "social",
          key: "linkYoutube.label",
          value: "youtube",
          isAdmin:true
        });
        mySetting = await Setting.create({
          type: "social",
          key: "linkYoutube.placeholder",
          value: "https://www.youtube.com...",
          isAdmin:true
        });
        mySetting = await Setting.create({
          type: "social",
          key: "linkYoutube.hint",
          value: null,
          isAdmin:true
        });                     
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Lien à votre page youtube de l'entreprise, laisse vide si vous en avez pas"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Link to your company youtube page, let it empty if you don't have"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Link a la pagina youtube de la empresa, deje el campo vacio si no tiene"});             

        mySetting = await Setting.create({
            type: "seo",
            key: "title",
            value: null
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Titre en français"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Title in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Titulo en español"});

        mySetting = await Setting.create({
          type: "seo",
          key: "title.label",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Titre"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Title"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Titulo"});      

        mySetting = await Setting.create({
          type: "seo",
          key: "title.placeholder",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Titre du site"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Sit'es title"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Titulo de la pagina web"});             

        mySetting = await Setting.create({
          type: "seo",
          key: "title.hint",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Titre du site web"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Page's title"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Titulo de la pagina principal"});             


        mySetting = await Setting.create({
            type: "seo",
            key: "description",
            value: null
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"description en francais"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"description in english"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"description en español"});             
         
        mySetting = await Setting.create({
          type: "seo",
          key: "description.label",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"description"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"description"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"descripcion"});             

        mySetting = await Setting.create({
          type: "seo",
          key: "description.placeholder",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Description"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Description"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Descripcion"});             

        mySetting = await Setting.create({
          type: "seo",
          key: "description.hint",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Description de la page"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Page's description"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Descripcion de la pagina"});             
               
        mySetting = await Setting.create({
            type: "seo",
            key: "url",
            value: 'https://www.kubiiks.com',
        });
        mySetting = await Setting.create({
          type: "seo",
          key: "url.placeholder",
          value: "https://www.mysite.com",
          isAdmin:true,
        });        

        mySetting = await Setting.create({
          type: "seo",
          key: "url.label",
          value: null,
          isAdmin:true,
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse internet"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Internet address"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Direccion internet"});             

        mySetting = await Setting.create({
          type: "seo",
          key: "url.hint",
          value: null,
          isAdmin:true,
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse principale du site"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Main site's address"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Pagina principal de la pagina web"});             

        mySetting = await Setting.create({
            type: "seo",
            key: "url_image",
            value: 'https://www.kubiiks.com/api/my-image.jpg'
        });


        mySetting = await Setting.create({
            type: "seo",
            key: "sitename",
            value: 'kubiiks'
        });

        mySetting = await Setting.create({
          type: "seo",
          key: "sitename.label",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Nom"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Name"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Nombre"});             

        mySetting = await Setting.create({
          type: "seo",
          key: "sitename.hint",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Nom de l'entreprise"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Company's name"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Nombre de la empresa"});             



        //General part
        mySetting = await Setting.create({
          type: "general",
          key: "companyPhone",
          value: '0423133212'
        });
        mySetting = await Setting.create({
          type: "general",
          key: "companyPhone.placeholder",
          value: '0423133212'
        });
        mySetting = await Setting.create({
          type: "general",
          key: "companyPhone.label",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Telephone"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Phone"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Telefono"});             

        mySetting = await Setting.create({
          type: "general",
          key: "companyPhone.hint",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Número de telephone de l'entreprise"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Company's phone number"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Numero de telefono de la empresa"});             


        mySetting = await Setting.create({
          type: "general",
          key: "companyEmail",
          value: 'sales@kubiiks.com'
        });
        mySetting = await Setting.create({
          type: "general",
          key: "companyEmail.placeholder",
          value: 'sales@kubiiks.com',
          isAdmin:true
        });        
        mySetting = await Setting.create({
          type: "general",
          key: "companyEmail.label",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse courriel"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Email address"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Correo electronico"});             
        mySetting = await Setting.create({
          type: "general",
          key: "companyEmail.hint",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse mel de l'entreprise"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Company's email address"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Direccion de correo electronico de la empresa"});             




        mySetting = await Setting.create({
          type: "general",
          key: "companyAddress",
          value: 'Kubiiks SAS, 6 rue Roger Avon, 06610 La Gaude, FRANCE',
        });
        mySetting = await Setting.create({
          type: "general",
          key: "companyAddress.label",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Adress"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Direccion"});             
        mySetting = await Setting.create({
          type: "general",
          key: "companyAddress.hint",
          value: null,
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Adresse postale de l'entreprise"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Company's postal address"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Direccion de la empresa"});             



        mySetting = await Setting.create({
          type: "general",
          key: "gmapLatLng",
          value: '43.61426,6.959808'
        });

        mySetting = await Setting.create({
          type: "general",
          key: "gmapLatLng.placeholder",
          value: '43.61426,6.959808',
          isAdmin:true
        });        
        mySetting = await Setting.create({
          type: "general",
          key: "gmapLatLng.label",
          value: '43.61426,6.959808',
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Coordones GPS"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"GPS coordinates"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Coordenadas GPS"});             
        mySetting = await Setting.create({
          type: "general",
          key: "gmapLatLng.hint",
          value: '43.61426,6.959808',
          isAdmin:true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Coordonnées GPS de l'entreprise (lat,lng)"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"Company's GPS coordinates (lat,lng)"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Coordenadas GPS de la empresa (lat,lng)"});             


        mySetting = await Setting.create({
          type: "general",
          key: "gmapZoom",
          value: '14',
        });
        mySetting = await Setting.create({
          type: "general",
          key: "gmapZoom.label",
          value: 'GoogleMap zoom',
          isAdmin:true
        });
        mySetting = await Setting.create({
          type: "general",
          key: "gmapZoom.placeholder",
          value: '14',
          isAdmin:true

        });
        mySetting = await Setting.create({
          type: "general",
          key: "gmapZoom.hint",
          value: null,
          isAdmin:true
        });        
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Zoom applicable a GoogleMap (valeur entre 10 et 20)"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"GoogleMap zoom (value between 10 and 20)"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Zoom para GoogleMap (valor entre 10 y 20)"});             


        //Legal part
        mySetting = await Setting.create({
          type: "legal",
          key: "legalUserData",
          value: null,
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"<h1>C'est un test</h1><p>pour voir ce qui ce passe</p>"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"<h1>this is a test</h1><p>to see what happens</p>"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"<h1>Esto es un test</h1><p>para ver que passa</p>"});             

        mySetting = await Setting.create({
          type: "legal",
          key: "legalUserData.title",
          value: null,
          isAdmin: true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Conditions generales d'utilization de donnees personnelles"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"General conditions of personnal data usage"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Condiciones generales de utilizacion de datos personnales"});             

        mySetting = await Setting.create({
          type: "legal",
          key: "legalSales",
          value: null,
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"<h1>C'est un test ventes</h1><p>pour voir ce qui ce passe</p>"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"<h1>this is a test sales</h1><p>to see what happens</p>"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"<h1>Esto es un test ventas</h1><p>para ver que passa</p>"});             

        mySetting = await Setting.create({
          type: "legal",
          key: "legalSales.title",
          value: null,
          isAdmin: true
        });
        await SettingTranslation.create({settingId:mySetting.id, iso:"fr",value:"Conditions generales de vente"});  
        await SettingTranslation.create({settingId:mySetting.id, iso:"en",value:"General conditions"});    
        await SettingTranslation.create({settingId:mySetting.id, iso:"es",value:"Condiciones generales de venta"});             


/*
    matInputAppearance: "fill",   //Mat input appearance "outline", "default", "fill"...
    matInputHasLabel: true,
    matInputHasHint: true,*/ 

    }
    return _seed();
  }
}






        