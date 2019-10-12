export const messages = {
    description:"Ça c'est une api",
    User: 'Utilizateur',
    cathegory: "cathegorie",

    validationExists: (name = 'field') => `Manque le parametre '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' non trouvé dans la base de données`,
    validationDBMissing: (name = 'field') => `'${name}' déjà enregistré dans notre base de données`,

    validationMinLength:(name = 'field', value='value') => `Le champ '${name}' doit avoir au moins ${value} characeters`,
    validationMaxLength: (name = 'field', value='value') => `Le champ '${name}' doit avoir moins de  ${value} characteres`,
    validationPassword: (name = 'field') => `Le champ '${name}' doit avoir au moins une majuscule, une minuscule et un numero et avoir plus de 5 characteres`,
    validationChecked:  (name = 'field') => `Le champ '${name}' doit etre coché`,

    validationEmpty: (name = 'field') => `Le champ '${name}' ne peut pas etre vide`,
    validationUnique: (name = 'field') => `${name} déjà existent dans la base de donnees`,
    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationNotFound: (name = 'field') => `Pas de '${name}' enregistrée dans nos bases de donnees avec les paramètres donnés`,
    validationSelfUser: 'Cette operation ne peut pas être effectué à votre propre compte',
    validationTerms: "Les conditions d'utilization des données personnelles doivent être accetés",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Functionalité '${name}' pas encore disponible`,

    //auth
    authKubiiksRole : "Les droits de 'kubiiks' ne peuvent pas être modifiés",
    authTokenMissing: 'Authentification necessaire pour acceder',
    authTokenInvalid: "Votre session n'est pas valide, connectez-vous a nouveau",
    authTokenInvalidRole: (name = 'field') => `Le droit '${name}' est requis pour cette operation`,
    authInvalidCredentials: 'Credentiels invalides',
    authTooManyTrials:  'Trop d\'essais invalides, essaye a nouveau dans quelques minutes',
    authAlreadyLoggedIn:  'Utilisateur déjà connecté',

    oauth2MissingField : (name = 'field') => `Erreur pendant l'authentification, impossible de recuperer le champ ${name} `,
    authEmailResetPassword: (name = 'field') => `Un courriel avec le nouvea mot de passe à été envoyé à : ${name}`,
    authEmailValidate: (name = 'field') => `Un courriel de validation de compte à été envoyé à : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Validation de votre addresse de courriel`,
    authEmailValidateError: "Le compte n'a pas pu etre active, contactez l'administrateur du site",
    authEmailValidateSuccess: 'Votre compte est desormais activé',
    authAccountNotActive: 'Vous devez confirmer votre addresse de courriel avant de pouvoir accéder',

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nouveau mot de passe`,
    emailSentOk:    (name = 'field') => `Un courriel à éte envoyé à l'adresse : ${name}`,
    emailSentOkAll: (count = '0') => `Courriel envoyé à ${count} recipients`,

    emailSentError: "Le courriel n'a pas pu etre envoyé, contactez l'administrateur",
    emailSiteAccess : 'ALLER AU SITE',
    emailDeleteProtected: 'Les modeles de courriel du systeme ne peuvent pas être effacés',
    emailValidationLink: (name = 'field') => `<p>Merci de valider votre compte en clickant sur ce <a href='${name}'>lien</a></p>`,
    emailResetPassword: (name = 'field') => `<p>Votre nouveau mot de passe : <span>${name}<span></p>`,
    emailResetPasswordSubject: (name = 'field') => `${name} : Demande de nouveau mot de passe`,

    //chat part
    chatWelcome: "Bienvenu a notre chat",
    chatLanguageSwitch: "Vous pouvez nous parler en francais si vous preferez",
    chatJoinRoom: (name = '') => `${name} : Viens de rejoindre le chat`,
    chatLeaveRoom: (name = '') => `${name} : Viens de quitter le chat`,

    //notifications titles
    notificationContactEmail: 'Reçu un nouveau email de contact',    
    notificationNewChat: 'Un nouveau chat vient de demarrer',


    articleContentNotCreate: "Les articles de la cathegorie 'content' ne peuvent pas être crees",
    articleContentNotDelete: "Les articles de la cathegorie 'content' ne peuvent pas être efaces",
    articleDelete: 'Article supprimé',
    articleNewTitle: 'Nouveau article',
    articleNewDescription: 'Example de description',
    articleNewContent:  '<h1>Nouveau article</h1>',

    apiRouteNotFound: "Le serveur n'a pas trouvé la requete demandé",

    newsletterSubscribed: "Vous êtes desormais enregistré pour recevoir nos bulletins d'information",
    newsletterUnsubscribed: "Vous ne recevrez plus nos bulletins d'information",
    newsletterMissing: "Ce compte de courriel n'est pas enregistré pour les bulletins d'information",

    fileTooLarge: "Fichier trop volumineux",

    messageSent: 'Votre message à bien été envoyé',
    saved : 'Modifications enregistrées correctement',


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };