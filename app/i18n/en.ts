export const messages = {
    description: 'This is an api',

    //Validation messages
    User: 'User',
    cathegory: "cathegory",
    validationExists: (name = 'field') => `Missing parameter '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' not found in the database`,
    validationDBMissing: (name = 'field') => `'${name}' already in the database`,

    validationMinLength: (name = 'field', value='value') => `Field '${name}' must have at least ${value} characters`,
    validationMaxLength: (name = 'field', value='value') => `Field '${name}' must have less than ${value} characters`,
    validationPassword: (name = 'field') => `Field '${name}' must have lowercases, uppercases, numbers and be more than 5 characters long`,
    validationChecked:  (name = 'field') => `Field '${name}' must be checked`,
    validationEmpty: (name = 'field') => `Field '${name}' cannot be empty`,
    validationUnique: (name = 'field') => `${name} already exists in the database`,
    validation: (name = 'field') => `Wrong value for field '${name}'`,
    validationNotFound: (name = 'field') => `${name} not found in the database with the given requirements`,
    validationSelfUser: 'Cannot do this operation on the current logged in account',
    validationTerms: "Terms and conditions must be accepted",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Feature '${name}' not yet supported`,

    //auth
    authKubiiksRole : "Rights for 'kubiiks' cannot be modified",
    authTokenMissing: 'Authentification is required and not provided',
    authTokenInvalid: 'Your session is not valid anymore, log in again',
    authTokenInvalidRole: (name = 'field') => `'${name}' rights are required`,
    authInvalidCredentials: 'Invalid credentials',
    authTooManyTrials:  'Too many failed trials, please try again in few minutes',
    authAlreadyLoggedIn:  'User already logged in',
    oauth2MissingField : (name = 'field') => `Authentication failed, no access given to field ${name}`,
    authEmailResetPassword: (name = 'field') => `An email with your new password has been sent to : ${name}`,
    authEmailValidate: (name = 'field') => `A validation email has been sent to : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Email account validation`,
    authEmailValidateError: 'The account could not be activated, contact the administrator',
    authEmailValidateSuccess: 'Your account has been activated',
    authAccountNotActive: 'You need to validate your email account before getting access',
    emailSentOk:    (name = 'field') => `An email has been sent to : ${name}`,
    emailSentOkAll: (count = '0') => `Sent email to ${count} recipients`,
    emailSentError: 'An error happened when sending the email, please contact the administrator',
    emailSiteAccess : 'GO TO SITE',
    emailDeleteProtected: 'System email templates cannot be deleted',
    emailValidationLink: (name = 'field') => `<p>Please validate your account by clicking to the foollowing <a href='${name}'>link</a></p>`,
    emailResetPassword: (name = 'field') => `<p>Your new password : <span>${name}<span></p>`,
    emailResetPasswordSubject: (name = 'field') => `${name} : Reset password`,


    //chat part
    chatWelcome: "Welcome to our chat",
    chatLanguageSwitch: "You can talk to us in english if you prefer",
    chatJoinRoom: (name = '') => `${name} : Joined the chat`,
    chatLeaveRoom: (name = '') => `${name} : Leaved the chat`,



    //notifications titles
    notificationContactEmail: 'New contact email recieved',
    notificationNewChat: 'New chat started',



    articleContentNotCreate: 'Content articles cannot be created',
    articleContentNotDelete: 'Content articles cannot be deleted',

    articleDelete: 'Article was successfully deleted',
    articleNewTitle: 'New article',
    articleNewDescription: 'Example of description',
    articleNewContent:  '<h1>New article</h1>',

    apiRouteNotFound: 'The server could not found the requested action',

    newsletterSubscribed: 'You are now registered to the newsletter',
    newsletterUnsubscribed: 'You are not registered to the newsletter anymore',
    newsletterMissing: "The email account you are providing is not registered",

    fileTooLarge: "File too large",


    messageSent: 'Your message has been sent',
    saved : 'Your modifications have been saved',

    title: 'Simple i18n implementation with TypeScript',
    greeting: (name = 'John Doe') => `Hello, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };