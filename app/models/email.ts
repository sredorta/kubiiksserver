import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { EmailTranslation } from './email_translation';
import { Setting } from './setting';
import { messages } from '../middleware/common';
import pug from 'pug';
import path from 'path';
import htmlToText from 'html-to-text';
import InlineCss from 'inline-css';

export const EmailN = 'Not a model';
export const NEmail = 'Not a model';


export interface FooterData {
    /**Contains the link to the footer data like phone,address,email... */
    icon:string;
    /**Contains the value of the data to show like the actual phone number,address... */
    value:string;
}


@DefaultScope({
    //where : {isAdmin : false},   //TODO: Handle published or not
    attributes: {exclude : []},
    include: [() => EmailTranslation]
  })
@Scopes({
    full: {
        attributes: {exclude : []},
        include: [() => EmailTranslation]
    }
  })
@Table({timestamps:true})
export class Email extends Model<Email> {

  /**Name of the template of the email in order for user to select one template */  
  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  name!: string;

  /**Contains the link to the logo image */
  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  logo!: string;

  /**Contains the background of the header if any */
  @AllowNull(true)
  @Default("none")
  @Column(DataTypes.STRING(300))
  backgroundHeader!: string;

  /**Contains the background of the content of the email if any */
  @AllowNull(true)
  @Default("none")
  @Column(DataTypes.STRING(300))
  backgroundContent!: string;  

  /**Property that allows user to delete this email. For example, reset-password, email-validate cannot be deleted */
  @AllowNull(false)
  @Default(false) //TODO: CHANGE TO FALSE
  @Column(DataTypes.BOOLEAN)
  isProtected!: boolean;  

  /**All properties that requires translations */
  @HasMany(() => EmailTranslation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  translations!: EmailTranslation[];  

  /**Footer data to show */  
  footer: FooterData[] = [];
  
  /**Social data. Not stored in the db, gut initialized by getting on Settings */
  social:FooterData[] = [];

  /**Primary color for header and links */
  headerColor:string = "#ff0000";

  /**Secondary color for footer */
  footerColor:string = "#00ff00";

  /**Link to the main site */
  siteUrl:string = "";

  /**Creates additional css for handling colors */
  createAdditionalCss() {
    let css = "a, {color:"+this.headerColor + "} .header {background:"+this.headerColor+"} .footer {background:"+this.footerColor+"}";
    return css;
  }

  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let result : any = JSON.parse(JSON.stringify(this));  
    if (this.translations.length>0) {
      let myTranslation = this.translations.find(obj => obj.iso == iso);
      if (myTranslation) {
        result.translations = [];
        result.translations.push(JSON.parse(JSON.stringify(myTranslation)));
      }
    }
    if (this.backgroundContent == "none") result.backgroundContent="";
    if (this.backgroundHeader == "none") result.backgroundHeader="";
    result.footer = this.footer;
    result.social = this.social;
    result.footerColor = this.footerColor;
    result.headerColor = this.headerColor;
    result.siteUrl = this.siteUrl;
    return result;
  }  

  /**Gets well formatted image for emails */
/*  getImage() {
    if (!this.image) return AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/no-photo-available.jpg";
    else return this.image;
  }*/

  /**Gets well formatted bacgkround image for emails */
/*  getBackgroundImage() {
    if (!this.backgroundImage) {
      if (this.backgroundImage == "none") return "none";
        return AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/no-photo-available.jpg";
    } else 
        return this.backgroundImage;
  }*/

  /**Populates footer and social data that is stored mainly in settings like company data... */
  public static populate() {
    let myPromise : Promise<Email>;
    let myObj = this;
    myPromise =  new Promise<Email>((resolve,reject) => {
      async function _getData() {
        try {
            let urlBase = AppConfig.api.host +":"+ AppConfig.api.port + "/public/images/defaults/";
            let result :any = new Email();
            //Get phone from settings
            let tmp = await Setting.findOne({where:{key:"companyPhone"}});
            if (!tmp) {
                reject("Could not find Setting 'companyPhone'");
                return;
            }
            result.footer.push({icon:urlBase + "phone.png",value:tmp.value});
            //Get address from settings
            tmp = await Setting.findOne({where:{key:"companyAddress"}});
            if (!tmp) {
                reject("Could not find Setting 'companyPhone'");
                return;
            }
            result.footer.push({icon:urlBase + "address.png",value:tmp.value});
            
            //Get site url
            tmp = await Setting.findOne({where:{key:"url"}});
            if (!tmp) {
                reject("Could not find Setting 'url'");
                return;
            }
            result.siteUrl = tmp.value;

            //Get all socialLinks
            let links: any = {};
            links["facebook"] = await Setting.findOne({where:{key:"linkFacebook"}});
            links["instagram"] = await Setting.findOne({where:{key:"linkInstagram"}});
            links["twitter"] = await Setting.findOne({where:{key:"linkTwitter"}});
            links["linkedin"] = await Setting.findOne({where:{key:"linkLinkedin"}});
            links["youtube"] = await Setting.findOne({where:{key:"linkYoutube"}});
            links["google"] = await Setting.findOne({where:{key:"linkGoogleplus"}});
            let myValue : string = "";
            let socialLinks : any = {};
            Object.keys(links).forEach(key => {
                if (links[key].value)
                    myValue = links[key].value;
                    if (myValue != "") {
                        result.social.push({icon:urlBase + key +".png", value:myValue});
                    }
            });
            resolve(result);
        } catch(error) {
           reject("Email header generation error");
        }
      }
      _getData();
    });
    return myPromise;
  }

  /**Populates social and footer data */
  public async populate() {
      let myEmail = await Email.populate();
      if (!myEmail) {
          return "this";
      }
      this.footer = myEmail.footer;
      this.social = myEmail.social;
      this.siteUrl = myEmail.siteUrl;
  }

  /**Returns the html of the final email */
  public async getHtml(iso:string, additionalHtml?:string) {
    try {
        await this.populate(); //Populate email with all settings that are common for all emails
        let myData = this.sanitize(iso);
        myData["siteAccess"] = messages.emailSiteAccess; //Add site Access string
        //Add extra html if required
        if (additionalHtml) 
            myData.translations[0].content = myData.translations[0].content + additionalHtml;

        let html = pug.renderFile(path.join(__dirname, "../emails/emails.pug"), {data:myData,iso: iso});
        //CSS must be put inline for better support of all browsers
        html =  await InlineCss(html, {extraCss:this.createAdditionalCss(),applyStyleTags:true,applyLinkTags:true,removeStyleTags:false,removeLinkTags:true,url:"filePath"});
        return html;
    } catch (error) {
        return null;
    }
  }



  /**Seeds the table initially */
  public static seed() {
    async function _seed() {

        let myEmail = await Email.create({
            name: "validate-email",
            logo: "https://localhost:3000/public/images/defaults/no-photo-available.jpg",
            backgroundHeader: "https://localhost:3000/public/images/defaults/no-photo-available.jpg",
            backgroundContent: "none",  
            isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",title:"titre 1",subtitle:"subtitre fr 1",header:"<h1>Entete email</h1>",content:"<h1>contenu 1</h1>"});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",title:"title 1",subtitle:"subtitle en 1",header:"<h1>Email Header</h1>",content:"<h1>content 1</h1>"});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",title:"titulo 1",subtitle:"subititulo es 1",header:"<h1>Cabecera email</h1>",content:"<h1>contenido 1</h1>"});             



    }
    return _seed();
  }
}

