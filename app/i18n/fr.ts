export const messages = {
    description:"Ça c'est une api",
    User: 'Utilisateur',
    cathegory: "catégorie",

    validationExists: (name = 'field') => `Manque le paramètre '${name}'`,
    validationDBExists: (name = 'field') => `${name} non trouvé dans la base de données`,
    validationDBMissing: (name = 'field') => `${name} déjà enregistré dans notre base de données`,

    validationMinLength:(name = 'field', value='value') => `Le champ '${name}' doit avoir au moins ${value} caractères`,
    validationMaxLength: (name = 'field', value='value') => `Le champ '${name}' doit avoir moins de  ${value} caractères`,
    validationPassword: (name = 'field') => `Le champ '${name}' doit avoir au moins une majuscule, une minuscule et un numéro et avoir plus de 5 caractères`,
    validationChecked:  (name = 'field') => `Le champ '${name}' doit être coché`,

    validationEmpty: (name = 'field') => `Le champ '${name}' ne peut pas être vide`,
    validationUnique: (name = 'field') => `${name} déjà existent dans la base de données`,
    validation: (name = 'field') => `Le champ '${name}' est incorrect`,
    validationNotFound: (name = 'field') => `Pas de '${name}' enregistrée dans nos bases de données avec les paramètres donnés`,
    validationSelfUser: 'Cette opération ne peut pas être effectué à votre propre compte',
    validationTerms: "Les conditions d'utilisation des données personnelles doivent être acceptés",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Fonctionnalité '${name}' pas encore disponible`,

    //auth
    authKubiiksRole : "Les droits de 'kubiiks' ne peuvent pas être modifiés",
    authTokenMissing: 'Authentification nécessaire pour accéder',
    authTokenInvalid: "Votre session n'est pas valide, connectez-vous a nouveau",
    authTokenInvalidRole: (name = 'field') => `Le droit '${name}' est requis pour cette opération`,
    authInvalidCredentials: 'Credentiels invalides',
    authTooManyTrials:  'Trop d\'essais invalides, essayez à nouveau dans quelques minutes',
    authAlreadyLoggedIn:  'Utilisateur déjà connecté',

    oauth2MissingField : (name = 'field') => `Erreur pendant l'authentification, impossible de récupérer le champ ${name} `,
    authEmailResetPassword: (name = 'field') => `Un courriel avec le nouveau mot de passe a été envoyé à : ${name}`,
    authEmailValidate: (name = 'field') => `Un courriel de validation de compte a été envoyé à : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Validation de votre adresse de courriel`,
    authEmailValidateError: "Le compte n'a pas pu être activé, contactez l'administrateur du site",
    authEmailValidateSuccess: 'Votre compte est désormais activé',
    authAccountNotActive: 'Vous devez confirmer votre adresse de courriel avant de pouvoir accéder',

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nouveau mot de passe`,
    emailSentOk:    (name = 'field') => `Un courriel a été envoyé à l'adresse : ${name}`,
    emailSentOkAll: (count = '0') => `Courriel envoyé à ${count} utilisateurs`,

    emailSentError: "Le courriel n'a pas pu être envoyé, contactez l'administrateur",
    emailSiteAccess : 'ALLER AU SITE',
    emailDeleteProtected: 'Les modèles de courriel du système ne peuvent pas être effacés',
    emailValidationLink: (name = 'field') => `<p>Merci de valider votre compte en cliquant sur ce <a href='${name}'>lien</a></p>`,
    emailResetPassword: (name = 'field') => `<p>Votre nouveau mot de passe : <span>${name}<span></p>`,
    emailResetPasswordSubject: (name = 'field') => `${name} : Demande de nouveau mot de passe`,

    //chat part
    chatWelcome: "Bienvenu a notre chat",
    chatLanguageSwitch: "Vous pouvez nous parler en français si vous preferez",
    chatJoinRoom: (name = '') => `${name} : Viens de rejoindre le chat`,
    chatLeaveRoom: (name = '') => `${name} : Viens de quitter le chat`,

    //notifications titles
    notificationContactEmail: 'Reçu un nouveau email de contact',    
    notificationNewChat: 'Un nouveau chat vient de démarrer',


    articleContentNotCreate: "Les articles de la catégorie 'content' ne peuvent pas être crées",
    articleContentNotDelete: "Les articles de la catégorie 'content' ne peuvent pas être effacés",
    articleDelete: 'Article supprimé',
    articleNewTitle: 'Mon titre',
    articleNewDescription: 'Ma description',
    articleNewContent:  '<p>Mon contenu</p>',

    apiRouteNotFound: "Le serveur n'a pas trouvé la requête demandé",

    newsletterSubscribed: "Vous êtes désormais enregistré pour recevoir nos bulletins d'information",
    newsletterUnsubscribed: "Vous ne recevrez plus nos bulletins d'information",
    newsletterMissing: "Ce compte de courriel n'est pas enregistré pour les bulletins d'information",

    fileTooLarge: "Fichier trop volumineux",

    messageSent: 'Votre message à bien été envoyé',
    saved : 'Modifications enregistrées correctement',

    unreadNotification: (unread: number) => `Vous avez ${unread === 0 ? 'no' : unread} notifications non lues`
  };