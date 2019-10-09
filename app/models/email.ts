import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/config';
import { EmailTranslation } from './email_translation';
import { Setting } from './setting';
import { messages } from '../middleware/common';
import pug from 'pug';
import path from 'path';
import htmlToText from 'html-to-text';
import InlineCss from 'inline-css';
import nodemailer from 'nodemailer';
import { Helper } from '../classes/Helper';

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
  @Unique(true)
  @Column(DataTypes.STRING(50))
  name!: string; 

  /**Contains the link to the logo image */
  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  logo!: string;

  /**Contains the background of the header if any */
  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.STRING(300))
  backgroundHeader!: string;

  /**Contains the background of the content of the email if any */
  @AllowNull(true)
  @Default(null)
  @Column(DataTypes.STRING(300))
  backgroundContent!: string;  

  /**Primary color for header and links */
  @AllowNull(true)
  @Default("#ffffff")
  @Column(DataTypes.STRING(30))
  headerColor!:string;

  /**Secondary color for footer */
  @AllowNull(true)
  @Default("#000000")
  @Column(DataTypes.STRING(30))  
  footerColor!:string;

  @AllowNull(true)
  @Default("#000000")
  @Column(DataTypes.STRING(30))  
  titleColor!:string;
  
  @AllowNull(true)
  @Default("#000000")
  @Column(DataTypes.STRING(30))  
  subtitleColor!:string;  

  @AllowNull(true)
  @Default("#153643")
  @Column(DataTypes.STRING(30))  
  textColor!:string;    

  
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

  /**Link to the main site */
  siteUrl:string = "";

  /**Creates additional css for handling colors */
  createAdditionalCss() {
    let css = ".header-button,a {color:"+this.headerColor + "} .header {background:"+this.headerColor+"} .footer {background:"+this.footerColor+"} ";
    css = css + ".kii-email-embedded-title {color:"+this.titleColor + "} .kii-email-embedded-subtitle {color:"+this.subtitleColor+"} h1,h2,.bodycopy {color:"+this.textColor+"}";
    return css;
  }

  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let myTrans : EmailTranslation | undefined;
    let result = JSON.parse(JSON.stringify(this));
    delete result.translations;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTrans = this.translations.find(obj => obj.iso == iso);
      if (myTrans) {
        result.title = myTrans.title;
        result.subtitle=myTrans.subtitle;
        result.description = myTrans.description;
        result.content = myTrans.content;
        result.header = myTrans.header;
      }
    }
    return result;
  }  



  /**Populates footer and social data that is stored mainly in settings like company data... */
  public static populate() {
    let myPromise : Promise<Email>;
    let myObj = this;
    myPromise =  new Promise<Email>((resolve,reject) => {
      async function _getData() {
        try {
            let urlBase = AppConfig.api.kiiserverExtHost + "/public/images/defaults/";
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
          return this;
      }
      this.footer = myEmail.footer;
      this.social = myEmail.social;
      this.siteUrl = myEmail.siteUrl;
  }

  /**Returns the html of the final email */
  public async getHtml(iso:string, additionalHtml?:string) {
    try {
        let messagesAll = Helper.translations();
        await this.populate(); //Populate email with all settings that are common for all emails
        let myData = JSON.parse(JSON.stringify(this));
        myData.translations = JSON.parse(JSON.stringify(this.translations));
        myData.footer = JSON.parse(JSON.stringify(this.footer));
        myData.social = JSON.parse(JSON.stringify(this.social));
        myData.siteUrl = this.siteUrl;
        myData.siteAccess = messagesAll[iso].emailSiteAccess; //Add site Access string
        let myTrans = myData.translations.find((obj:any) => obj.iso == iso);
        myData.translations = [];
        myData.translations.push(myTrans);
        if(!myData.translations[0].content) myData.translations[0].content = "";
        if(!myData.translations[0].header) myData.translations[0].header = "";
        

        //Add extra html if required
        if (additionalHtml) {
            myData.translations[0].content = myData.translations[0].content + additionalHtml;
        }

        let html = pug.renderFile(path.join(process.cwd() + '/app/emails/emails.pug'), {data:myData,iso:iso});
        //CSS must be put inline for better support of all browsers
        html =  await InlineCss(html, {extraCss:this.createAdditionalCss(),applyStyleTags:true,applyLinkTags:true,removeStyleTags:false,removeLinkTags:true,url:"filePath"});
        return html;
    } catch (error) {
        console.log(error);
        return null;
    }
  }

  /**Returns the header of the email translated */
  public async getHeader(iso:string, additionalHtml?:string) {
    try {
        let myData = JSON.parse(JSON.stringify(this));
        myData.translations = JSON.parse(JSON.stringify(this.translations));
        let myTrans = myData.translations.find((obj:any) => obj.iso == iso);
        myData.translations = [];
        myData.translations.push(myTrans);
        if(!myData.translations[0].header) myData.translations[0].header = "";
        return myData.translations[0].header;
    } catch (error) {
        console.log(error);
        return null;
    }
  }


  /**Sends email to email recipients with a certain template, additional html if any, subject... */
  public static async send(iso:string, template:string, subject:string, to:string[], additionalHtml?:string) {
      try {
             let myEmail = await Email.findOne({where:{name:template}});
            if (!myEmail) return null;

            let html = await myEmail.getHtml(iso, additionalHtml);
            if (!html)  return null;
            const transporter = nodemailer.createTransport(AppConfig.emailSmtp);
            let myEmailT = {
                            from: AppConfig.emailSmtp.sender,
                            to: to,
                            subject: subject,
                            text: htmlToText.fromString(html),
                            html: html
            }
            await transporter.sendMail(myEmailT);
            return true;
      } catch (error) {
            return null;
      }
  }



  /**Seeds the table initially */
  public static seed() {
    async function _seed() {

        let myEmail = await Email.create({
            name: "reference",
            logo: "https://localhost:3000/public/images/defaults/no-photo-available.jpg",  
            isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele de courriel de reference pour tous les nouveaux modeles",title:"Mon titre",subtitle:"Mon soustitre",header:"<h1>Exemple entete email</h1>",content:"<h1>Exemple de contenu</h1>"});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Reference email template for all new models",title:"My title",subtitle:"My subtitle",header:"<h1>Example email Header</h1>",content:"<h1>Content example</h1>"});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo de referencia para todos los nuevos modelos",title:"Mi titulo",subtitle:"Mi subtitulo",header:"<h1>Ejemplo de cabecera email</h1>",content:"<h1>Ejemplo de contenido</h1>"});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model de referència per tots els nous models", title:"El meu titol",subtitle:"El meu subtitol",header:"<h1>Exemple de capçalera email</h1>",content:"<h1>Exemple de contingut</h1>"});             


        myEmail = await Email.create({
            name: "validate-email",
            logo: "https://localhost:3000/public/images/defaults/no-photo-available.jpg",  
            isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé lors de la validation de compte de courriel client",title:"titre 1",subtitle:"subtitre fr 1",header:"<h1>Entete email</h1>",content:"<h1>contenu 1</h1>"});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer to validate account",title:"title 1",subtitle:"subtitle en 1",header:"<h1>Email Header</h1>",content:"<h1>content 1</h1>"});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes para validar su cuenta de correo",title:"titulo 1",subtitle:"subititulo es 1",header:"<h1>Cabecera email</h1>",content:"<h1>contenido 1</h1>"});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat als clients per validar el compte de correu electronic",title:"titol 1",subtitle:"subititol 1",header:"<h1>Capçalera email</h1>",content:"<h1>contenido 1</h1>"});             

        myEmail = await Email.create({
          name: "reset-password",
          logo: "https://localhost:3000/public/images/defaults/no-photo-available.jpg", 
          isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé lors de la demande de nouveau mot de passe",title:"titre 1",subtitle:"subtitre fr 1",header:"<h1>Entete email</h1>",content:"<h1>contenu 1</h1>"});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer when new password has been asked",title:"title 1",subtitle:"subtitle en 1",header:"<h1>Email Header</h1>",content:"<h1>content 1</h1>"});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes cuando piden un nuevo password",title:"titulo 1",subtitle:"subititulo es 1",header:"<h1>Cabecera email</h1>",content:"<h1>contenido 1</h1>"});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat als clients quan demanen un nou password",title:"titol1",subtitle:"subititol1",header:"<h1>Capçalera email</h1>",content:"<h1>contingut</h1>"});             

        myEmail = await Email.create({
          name: "contact-reply",
          logo: "https://localhost:3000/public/images/defaults/no-photo-available.jpg", 
          isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé comme réponse automatique au formulaire de contact",title:"titre 1",subtitle:"subtitre fr 1",header:"<h1>Entete email</h1>",content:"<h1>contenu 1</h1>"});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer as automatic reply of contact form",title:"title 1",subtitle:"subtitle en 1",header:"<h1>Email Header</h1>",content:"<h1>content 1</h1>"});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes como respuesta automatica al formulario de contacto",title:"titulo 1",subtitle:"subititulo es 1",header:"<h1>Cabecera email</h1>",content:"<h1>contenido 1</h1>"});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat com a resposta automàtica al formulari de contacte",title:"titol",subtitle:"subititol",header:"<h1>Capçalera email</h1>",content:"<h1>contingut</h1>"});             

    }
    return _seed();
  }
}

