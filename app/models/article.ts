import {Table, Column, Model, PrimaryKey, AutoIncrement, AllowNull, Unique, Default, DefaultScope,Scopes,HasMany} from 'sequelize-typescript';
import {DataTypes} from 'sequelize';
import {AppConfig} from '../utils/Config';
import { ArticleTranslation } from './article_translation';


export const ArticleN = 'Not a model';
export const NArticle = 'Not a model';


@DefaultScope({
    //where : {isAdmin : false},   //TODO: Handle published or not
    attributes: {exclude : []},
    include: [() => ArticleTranslation]
  })
@Scopes({
    full: {
        attributes: {exclude : []},
        include: [() => ArticleTranslation]
    }
  })
@Table({timestamps:true})
export class Article extends Model<Article> {

  @AllowNull(true)
  @Column(DataTypes.STRING(50))
  key!: string;

  @AllowNull(false)
  @Column(DataTypes.STRING(50))
  cathegory!: string;

  @AllowNull(true)
  @Column(DataTypes.STRING(300))
  image!: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataTypes.BOOLEAN)
  public!: boolean;  

  @HasMany(() => ArticleTranslation, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true})
  translations!: ArticleTranslation[];  

  /**Sanitize output by removing all languages except requested one */
  public sanitize(iso:string,scope:"summary" | "full") {
    let result : any = JSON.parse(JSON.stringify(this));  
    if (this.translations.length>0) {
      let myTranslation = this.translations.find(obj => obj.iso == iso);
      if (myTranslation) {
        result.translations = [];
        result.translations.push(JSON.parse(JSON.stringify(myTranslation)));
      }
    }
    switch (scope) {
        case "summary":
            let index : number =0;
            for (let translation of result.translations) {
                delete translation.content;
                index = index+1;
            }
            break;
        default: {}        
    }
    return result;
  }  

  /**Seeds the table initially */
  public static seed() {
    async function _seed() {

        let myArticle = await Article.create({
                cathegory: "realisations",
                image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>conteido 1</h1>"});             

        myArticle = await Article.create({
            cathegory: "realisations",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 2",description:"description fr 2",content:"<h1>contenu 2</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2",description:"description en 2",content:"<h1>content 2</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2",description:"descripcion es 2",content:"<h1>conteido 2</h1>"});             

        myArticle = await Article.create({
            cathegory: "realisations",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 3",description:"description fr 3",content:"<h1>contenu 3</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 3",description:"description en 3",content:"<h1>content 3</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 3",description:"descripcion es 3",content:"<h1>conteido 3</h1>"});             

        myArticle = await Article.create({
          cathegory: "prix",
          image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre prix 1",description:"description fr 1",content:"<h1>contenu 1</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1",description:"description en 1",content:"<h1>content 1</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1",description:"descripcion es 1",content:"<h1>conteido 1</h1>"});             

        myArticle = await Article.create({
            cathegory: "prix",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre prix 2",description:"description fr 2",content:"<h1>contenu 2</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2",description:"description en 2",content:"<h1>content 2</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2",description:"descripcion es 2",content:"<h1>conteido 2</h1>"});             


        myArticle = await Article.create({
            cathegory: "blog",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 1 blog",description:"description fr 1 blog",content:"<h1>contenu 1 blog</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 1 blog",description:"description en 1 blog",content:"<h1>content 1 blog</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 1 blog",description:"descripcion es 1 blog",content:"<h1>conteido 1 blog</h1>"});             

        myArticle = await Article.create({
            cathegory: "blog",
            image:"https://localhost:3000/public/images/content/logo50x50.jpg"
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"titre 2 blog",description:"description fr 2 blog",content:"<h1>contenu 1 blog</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"title 2 blog",description:"description en 2 blog",content:"<h1>content 1 blog</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"titulo 2 blog",description:"descripcion es 2 blog",content:"<h1>conteido 1 blog</h1>"});             

        //////////////////////////////////////////////////////////////////////////
        //CONTENT PART
        //////////////////////////////////////////////////////////////////////////

        //SIGNUP
        myArticle = await Article.create({
            cathegory: "content",
            key: "signup-header",
            image:null,
            public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Se connecter: Entete de s'enregistrer",description:"Entete de la page se connecter. On essaye avec un texte tres long pour voir si tout va bien",content:"<h1>contenu 1 content</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Signup: Signup header",description:"Signup header content",content:"<h1>content 1 content</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Conectarse: Cabecera de conectarse",description:"Contenido de la cabecera de connectarse",content:"<h1>conteido 1 content</h1>"});             

        myArticle = await Article.create({
            cathegory: "content",
            key: "signup-side",
            image:null,
            public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Se connecter: Contenu lateral",description:"Contenu lateral de la page de connexion. Ce contenu aparait seulement sur ecrans de grande taille et non sur mobiles",content:"<h1>contenu 2 cote</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Signup: Side content",description:"Only appears in large screens",content:"<h1>content 2 content</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Conectarse: Contenido lateral",description:"Solo aparece en pantallas grandes",content:"<h1>conteido 2 content</h1>"});             

        //CONTACT
        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-header",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Titre dans contact",description:"Part superieur de contact",content:"<h1>contactez-nous</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Title in contact",description:"Header part of contact",content:"<h1>contact-us</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Titulo en contacto",description:"Parte superior en contacto",content:"<h1>contactanos</h1>"});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-footer",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Pied de page contact",description:"Part inferieur de contact",content:"<h1>pied de page contact</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Footer contact",description:"Contact inferior part",content:"<h1>footer contact</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Pie de pagina contacto",description:"Parte inferior en contacto",content:"<h1>pie de pagina contacto</h1>"});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-phone",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Contact: Telephone entreprise",description:"Section d'info de numero de telephone dans contactez-nous",content:"<h1>telephone</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Contact: Company's phone",description:"Contact comapny's imformation part for phone",content:"<h1>phone</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Contacto: Telefono empresa",description:"Parte de informacion de telefono en contacto",content:"<h1>telefono</h1>"});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-time",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Contact: Horaires",description:"Horaires en contact",content:"<h1>horaires</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Contact: Timetable",description:"Timetable in contact",content:"<h1>timetable</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Contacto: Horarios",description:"Horarios en contacto",content:"<h1>horarios</h1>"});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-form",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Contact: Entete de formulaire",description:"Part inferieur de contact",content:"<h1>pied de page contact</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Contact: Form header",description:"Contact inferior part",content:"<h1>footer contact</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Contacto: Cabecera de formulario",description:"Parte inferior en contacto",content:"<h1>pie de pagina contacto</h1>"});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "contact-address",
          image:null,
          public:true
        });                    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Contact: Adresse",description:"Part inferieur de contact",content:"<h1>pied de page contact</h1>"});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Contact: Address",description:"Contact inferior part",content:"<h1>footer contact</h1>"});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Contacto: Direccion",description:"Parte inferior en contacto",content:"<h1>pie de pagina contacto</h1>"});             


        //LEGAL PART
        myArticle = await Article.create({
          cathegory: "content",
          key: "legal-user-data",
          image: null,
          public:true
        });
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Conditions utilization donnees personnelles", description:"Aparait pendant creation de compte", content:'<b style=""><font size="5">COLLECTE ET UTILISATION DES DONNÉES À CARACTÈRE PERSONNEL</font></b><div><hr id="null"></div><div><div><br></div><div>La collecte des données à caractère personnel pour les prestations proposées par le site ainsi que leur traitement sont effectués dans le respect de la loi « Informatique, Fichiers et Libertés » du 6 janvier 1978 modifiée et ses décrets d’application.</div></div><div><br></div><div><div>La collecte des données à caractère personnel concernant les utilisateurs du site a pour finalités principales l’identification des utilisateurs pour la fourniture des services et prestations proposés sur le site.</div></div><div><br></div><div><div>Les données récoltées ne sont jamais transmis à des tiers sauf si le client a donné son consentement préalable et ce sous réserve que les tiers se soient clairement engagés à respecter toutes les dispositions de la Loi du 6 janvier 1978 modifiée.</div></div><div><br></div><div>En application de la loi, toute personne ayant transmis des données à caractère personnel dispose d’un droit d’accès, de rectification et de suppression des données ainsi que d’un droit d’opposition au traitement des données à caractère personnel la concernant. A tout moment, vous pouvez demander à exercer ce droit en nous contactant.<br></div><div><br></div><div><div>Les visiteurs du site sont informés que pour les besoins de la navigation sur ce site,&nbsp; nous pouvons avoir recours à la collecte automatique de certaines informations relatives aux utilisateurs à l\'aide des cookies. Si l\'utilisateur du site ne souhaite pas l’utilisation de cookies par Autoradios-GPS, il peut refuser l’activation des cookies par le biais des options proposés par son navigateur internet. Pour des raisons techniques, si l\'utilisateur désactive les cookies dans son navigateur, certaines prestations proposées sur le site pourront ne pas lui être accessibles.</div></div><div><br></div>'});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Personal data usage conditions", description:"It appears during signup", content:'<div><font size="5"><b>PERSONAL DATA USAGE AND STORAGE</b></font></div><div><hr id="null"><br></div><div>The personal data is collected and stored respecting the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>The personal data is collected for user identification among others.</div><div><br></div><div>The collected data will never be given to third parties except if the user has given a waiver and only in the case that the third parties are commited to respect the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>Following the law, any person that has sent personal data has access to such data and is able to modify or suppress such data. At any moment, you can ask for this right by contacting us.</div><div><br></div><div>Site visitors are informed that for a better navigation experience, we might be collecting some information using cookies or equivalent. An option to the visitor is offered so that can disable such feature. For technical reasons, by disabling the usage of cookies some features might not be available to the user.</div><div><br></div><div><br></div>'});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Condiciones de utilizacion datos personales", description:"Aparece cuando creamos una cuenta", content:'<div><font size="5"><b>PERSONAL DATA USAGE AND STORAGE ESPAÑOL !!!!</b></font></div><div><hr id="null"><br></div><div>The personal data is collected and stored respecting the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>The personal data is collected for user identification among others.</div><div><br></div><div>The collected data will never be given to third parties except if the user has given a waiver and only in the case that the third parties are commited to respect the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>Following the law, any person that has sent personal data has access to such data and is able to modify or suppress such data. At any moment, you can ask for this right by contacting us.</div><div><br></div><div>Site visitors are informed that for a better navigation experience, we might be collecting some information using cookies or equivalent. An option to the visitor is offered so that can disable such feature. For technical reasons, by disabling the usage of cookies some features might not be available to the user.</div><div><br></div><div><br></div>'});             

        myArticle = await Article.create({
          cathegory: "content",
          key: "legal-sales",
          image: null,
          public:true
        });
        await ArticleTranslation.create({articleId:myArticle.id, iso:"fr",title:"Conditions generales de vente", description:"Aparait avant une comande", content:'<b style=""><font size="5">CONDITIONS GENERALES DE VENTE</font></b><div><hr id="null"></div><div><div><br></div><div>La collecte des données à caractère personnel pour les prestations proposées par le site ainsi que leur traitement sont effectués dans le respect de la loi « Informatique, Fichiers et Libertés » du 6 janvier 1978 modifiée et ses décrets d’application.</div></div><div><br></div><div><div>La collecte des données à caractère personnel concernant les utilisateurs du site a pour finalités principales l’identification des utilisateurs pour la fourniture des services et prestations proposés sur le site.</div></div><div><br></div><div><div>Les données récoltées ne sont jamais transmis à des tiers sauf si le client a donné son consentement préalable et ce sous réserve que les tiers se soient clairement engagés à respecter toutes les dispositions de la Loi du 6 janvier 1978 modifiée.</div></div><div><br></div><div>En application de la loi, toute personne ayant transmis des données à caractère personnel dispose d’un droit d’accès, de rectification et de suppression des données ainsi que d’un droit d’opposition au traitement des données à caractère personnel la concernant. A tout moment, vous pouvez demander à exercer ce droit en nous contactant.<br></div><div><br></div><div><div>Les visiteurs du site sont informés que pour les besoins de la navigation sur ce site,&nbsp; nous pouvons avoir recours à la collecte automatique de certaines informations relatives aux utilisateurs à l\'aide des cookies. Si l\'utilisateur du site ne souhaite pas l’utilisation de cookies par Autoradios-GPS, il peut refuser l’activation des cookies par le biais des options proposés par son navigateur internet. Pour des raisons techniques, si l\'utilisateur désactive les cookies dans son navigateur, certaines prestations proposées sur le site pourront ne pas lui être accessibles.</div></div><div><br></div>'});  
        await ArticleTranslation.create({articleId:myArticle.id, iso:"en",title:"Sales terms and conditions", description:"It appears before order", content:'<div><font size="5"><b>GENERAL SALES CONDITIONS</b></font></div><div><hr id="null"><br></div><div>The personal data is collected and stored respecting the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>The personal data is collected for user identification among others.</div><div><br></div><div>The collected data will never be given to third parties except if the user has given a waiver and only in the case that the third parties are commited to respect the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>Following the law, any person that has sent personal data has access to such data and is able to modify or suppress such data. At any moment, you can ask for this right by contacting us.</div><div><br></div><div>Site visitors are informed that for a better navigation experience, we might be collecting some information using cookies or equivalent. An option to the visitor is offered so that can disable such feature. For technical reasons, by disabling the usage of cookies some features might not be available to the user.</div><div><br></div><div><br></div>'});    
        await ArticleTranslation.create({articleId:myArticle.id, iso:"es",title:"Condiciones generales de venta", description:"Aparece cuando hacemos una compra", content:'<div><font size="5"><b>CONDICIONES GENERALES DE VENTA</b></font></div><div><hr id="null"><br></div><div>The personal data is collected and stored respecting the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>The personal data is collected for user identification among others.</div><div><br></div><div>The collected data will never be given to third parties except if the user has given a waiver and only in the case that the third parties are commited to respect the french law « Informatique, Fichiers et Libertés » of 6th january 1978 and all its ammendements.</div><div><br></div><div>Following the law, any person that has sent personal data has access to such data and is able to modify or suppress such data. At any moment, you can ask for this right by contacting us.</div><div><br></div><div>Site visitors are informed that for a better navigation experience, we might be collecting some information using cookies or equivalent. An option to the visitor is offered so that can disable such feature. For technical reasons, by disabling the usage of cookies some features might not be available to the user.</div><div><br></div><div><br></div>'});             

    }
    return _seed();
  }
}

