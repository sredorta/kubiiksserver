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
import { EmailBuilder } from '../classes/EmailBuilder';

export const EmailN = 'Not a model';
export const NEmail = 'Not a model';


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


  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string) {
    let myTrans : EmailTranslation | undefined;
    let result = JSON.parse(JSON.stringify(this));
    delete result.translations;

    //Replace value of Setting with current language
    if (this.translations.length>0) {
      myTrans = this.translations.find(obj => obj.iso == iso);
      if (myTrans) {
        result.description=myTrans.description;
        result.data = myTrans.data;
      }
    }
    return result;
  }  

  /**Returns the html of the final email */
  public async getHtml(translation:EmailTranslation) {
    try {
        let builder = new EmailBuilder(translation);
        let html = builder.getHtml();
        return html;
    } catch (error) {
        console.log(error);
        return null;
    }
  }




  /**Sends email to email recipients with a certain template, additional html if any, subject... */
  public static async send(iso:string, template:string, subject:string, to:string[]) {
      try {
            let myEmail = await Email.findOne({where:{name:template}});
            if (!myEmail) throw new Error("Email template not found");
            let myTrans = myEmail.translations.find(obj => obj.iso == iso);
            if (!myTrans) throw new Error("Translation not found !");
            let builder = new EmailBuilder(myTrans);
            let html = builder.getHtml();
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
    const defaultData = JSON.stringify(
      {"id":0,"type":"container","bgColor":"#ffffff","txtColor":"black","width":"700","font":"Verdana","fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"14px","blocks":[{"id":1,"type":"block","position":1,"format":"double_2080","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":2,"type":"cell","width":"20%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":10,"paddingLeft":10,"paddingRight":10,"paddingBottom":10,"hAlign":"left","vAlign":"top","widgets":[{"id":6,"position":1,"type":"widget","format":"image","textarea":"Text","url":"","imageUrl":"https://localhost:4300/server/public/images/email/logo-round__1584886485065.png","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]},{"id":3,"type":"cell","width":"80%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":20,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"middle","widgets":[{"id":7,"position":1,"type":"widget","format":"text","textarea":"<p>KUBIIKS</p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"34px","font":"Arial"},{"id":8,"position":2,"type":"widget","format":"text","textarea":"<p><span style=\"color:#808080;\">Créateur d'éperiences web</span></p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"22px"}]}]},{"id":4,"type":"block","position":2,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":5,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[]}]},{"id":9,"type":"block","position":3,"format":"double_7030","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":10,"type":"cell","width":"70%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"right","vAlign":"top","widgets":[{"id":12,"position":1,"type":"widget","format":"text","textarea":"<p><span style=\"color:#c0c0c0;\">Suivez-nous</span></p>","url":"","imageUrl":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontSize":"26px"}]},{"id":11,"type":"cell","width":"30%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"center","vAlign":"top","widgets":[{"id":13,"position":1,"type":"widget","format":"button","textarea":"Text","url":"https://www.facebook.com","imageUrl":"https://localhost:4300/server/public/images/email/facebook__1584893306544.png","txtBtn":"Facebook","typeBtn":"image_button","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":48},{"id":14,"position":2,"type":"widget","format":"button","textarea":"Text","url":"https://www.linkedin.com","imageUrl":"https://localhost:4300/server/public/images/email/linkedin__1584892935792.png","txtBtn":"Linkedin","typeBtn":"image_button","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":48}]}]}]}
      );
      
      //{"id":0,"type":"container","bgColor":"#808080","txtColor":"black","width":"700","font":"Verdana","fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"14px","blocks":[]});//{"id":1,"type":"block","position":1,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":2,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[{"id":3,"position":1,"type":"widget","format":"text","textarea":"Text here we are","url":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600,"fontBold":false,"fontItalic":false,"fontUnderline":false,"fontSize":"26px","font":"Courier New"},{"id":7,"position":2,"type":"widget","format":"text","textarea":"Text klsdfajsdfalkj sfdlkjfsd lsdfakj lsdafkj lsadfkjd fsalkjds faljdsfa ldsfkja lsdfkajlkdfsj dflskjd slfkjdfslkjdfsa lkdfsj lkdfasj ldsfkj dflkj","url":"","txtBtn":"Text","typeBtn":"link","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]}]},{"id":4,"type":"block","position":2,"format":"simple","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"cells":[{"id":5,"type":"cell","width":"100%","bgColor":null,"txtColor":null,"font":null,"fontSize":null,"fontBold":null,"fontItalic":null,"fontUnderline":null,"paddingTop":0,"paddingLeft":0,"paddingRight":0,"paddingBottom":0,"hAlign":"left","vAlign":"top","widgets":[{"id":6,"position":1,"type":"widget","format":"button","textarea":"Text","url":"http://www.google.com","txtBtn":"Text","typeBtn":"stroked","colorBtn":"red","bgColorBtn":"blue","imgAlt":"Alt text","imgWidth":600}]}]}]});

    async function _seed() {

        let myEmail = await Email.create({
            name: "reference",
            isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele de courriel de reference pour tous les nouveaux modeles",title:"Mon titre",data:defaultData});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Reference email template for all new models",title:"My title",data:defaultData});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo de referencia para todos los nuevos modelos",title:"Mi titulo",data:defaultData});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model de referència per tots els nous models", title:"El meu titol",data:defaultData});             


        myEmail = await Email.create({
            name: "validate-email",
            isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé lors de la validation de compte de courriel client",title:"titre 1",data:defaultData});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer to validate account",title:"title 1",data:defaultData});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes para validar su cuenta de correo",title:"titulo 1",data:defaultData});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat als clients per validar el compte de correu electronic",title:"titol 1",data:defaultData});             

        myEmail = await Email.create({
          name: "reset-password",
          isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé lors de la demande de nouveau mot de passe",title:"titre 1",data:defaultData});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer when new password has been asked",title:"title 1",data:defaultData});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes cuando piden un nuevo password",title:"titulo 1",data:defaultData});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat als clients quan demanen un nou password",title:"titol1",data:defaultData});             

        myEmail = await Email.create({
          name: "contact-reply",
          isProtected: true  
        });                    
        await EmailTranslation.create({emailId:myEmail.id, iso:"fr",description:"Modele envoyé comme réponse automatique au formulaire de contact",title:"titre 1",data:defaultData});  
        await EmailTranslation.create({emailId:myEmail.id, iso:"en",description:"Model sent to customer as automatic reply of contact form",title:"title 1",data:defaultData});    
        await EmailTranslation.create({emailId:myEmail.id, iso:"es",description:"Modelo enviado a los clientes como respuesta automatica al formulario de contacto",title:"titulo 1",data:defaultData});             
        await EmailTranslation.create({emailId:myEmail.id, iso:"ca",description:"Model enviat com a resposta automàtica al formulari de contacte",title:"titol",subtitle:"subititol",data:defaultData});             

    }
    return _seed();
  }
}

