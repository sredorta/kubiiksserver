export const messages = {
    description: "Esto es una api",
    user: 'Usuario',
    validationMinLength:(name = 'field', value='value') => `El campo '${name}' debe tener como minimo ${value} caracteres`,
    validationMaxLength: (name = 'field', value='value') => `El campo '${name}' debe tener menos de ${value} caracteres`,
    validationPassword: (name = 'field') => `El campo '${name}' debe tener como minimo una mayuscula, una minuscula, un numero y mas de 5 caracteres`,
    validationEmpty: (name = 'field') => `El campo '${name}' no puede estar vacio`,
    validationUnique: (name = 'field') => `${name} ya existente en la base de datos`,
    validation: (name = 'field') => `El campo '${name}' est incorrecto`,
    validationNotFound: (name = 'field') => `No se ha encontrado ningun '${name}' con los parametros dados`,

    //Other system messages
    featureNotAvailable: (name = 'field') => `Funcionalidad '${name}' no disponible`,

    //Auth
    authTokenMissing: 'Autentification necessaria para acceder',
    authTokenInvalid: 'El token enviado es invalido',
    authEmailValidateSubject: (name = 'field') => `${name} : Verificacion de la cuenta de correo`,
    authEmailSentError: 'El email de verificacion no se pudo enviar, contacte con el administrador',


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };