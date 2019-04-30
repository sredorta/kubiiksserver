export const messages = {
    description: 'This is an api',

    //Validation messages
    User: 'User',
    validationMinLength: (name = 'field', value='value') => `Field '${name}' must have at least ${value} characters`,
    validationMaxLength: (name = 'field', value='value') => `Field '${name}' must have less than ${value} characters`,
    validationPassword: (name = 'field') => `Field '${name}' must have lowercases, uppercases, numbers and be more than 5 characters long`,
    validationEmpty: (name = 'field') => `Field '${name}' cannot be empty`,
    validationUnique: (name = 'field') => `${name} already exists in the database`,
    validation: (name = 'field') => `Wrong value for for field '${name}'`,
    validationNotFound: (name = 'field') => `${name} not found in the database with the given requirements`,

    //Other system messages
    featureNotAvailable: (name = 'field') => `Feature '${name}' not yet supported`,

    //auth
    authTokenMissing: 'Authentification is required and not provided',
    authTokenInvalid: 'The token provided is invalid',
    authTokenInvalidAdmin: 'Administrator rights are required',
    authInvalidCredentials: 'Invalid credentials',
    authEmailResetPassword: (name = 'field') => `An email with your new password has been sent to : ${name}`,
    authEmailValidate: (name = 'field') => `A validation email has been sent to : ${name}`,
    authEmailResetPasswordSubject: (name = 'field') => `${name} : Reset password`,
    authEmailValidateSubject: (name = 'field') => `${name} : Email account validation`,
    authEmailSentError: 'An error happened when sending the email, please contact the administrator',
    oauth2MissingField : (name = 'field') => `Authentication failed, no access given to field ${name}`,

    apiRouteNotFound: 'The server could not found the requested action',


    title: 'Simple i18n implementation with TypeScript',
    greeting: (name = 'John Doe') => `Hello, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };