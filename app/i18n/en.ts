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
    authTokenMissing: 'Authentification is required and not provided',
    authTokenInvalid: 'Your session is not valid anymore, log in again',
    authTokenInvalidRole: (name = 'field') => `'${name}' rights are required`,
    authInvalidCredentials: 'Invalid credentials',
    authTooManyTrials:  'Too many failed trials, please try again in few minutes',
    authAlreadyLoggedIn:  'User already logged in',
    authEmailResetPassword: (name = 'field') => `An email with your new password has been sent to : ${name}`,
    authEmailValidate: (name = 'field') => `A validation email has been sent to : ${name}`,
    authEmailResetPasswordSubject: (name = 'field') => `${name} : Reset password`,
    authEmailValidateSubject: (name = 'field') => `${name} : Email account validation`,
    authEmailSentError: 'An error happened when sending the email, please contact the administrator',
    oauth2MissingField : (name = 'field') => `Authentication failed, no access given to field ${name}`,

    articleContentNotCreate: 'Content articles cannot be created',
    articleContentNotDelete: 'Content articles cannot be deleted',

    articleDelete: 'Article was successfully deleted',
    articleNewTitle: 'New article',
    articleNewDescription: 'Example of description',
    articleNewContent:  '<h1>New article</h1>',

    apiRouteNotFound: 'The server could not found the requested action',

    emailSiteAccess : 'GO TO SITE',



    messageSent: 'Your message has been sent',
    saved : 'Your modifications have been saved',

    title: 'Simple i18n implementation with TypeScript',
    greeting: (name = 'John Doe') => `Hello, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };