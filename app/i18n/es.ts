export const messages = {
    description: "Esto es una api",
    User: 'Usuario',
    validationExists: (name = 'field') => `Falta el parametro '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' no encontrado en la base de datos`,
    validationDBMissing: (name = 'field') => `'${name}' ya existe en la base de datos`,

    validationMinLength:(name = 'field', value='value') => `El campo '${name}' debe tener como minimo ${value} caracteres`,
    validationMaxLength: (name = 'field', value='value') => `El campo '${name}' debe tener menos de ${value} caracteres`,
    validationPassword: (name = 'field') => `El campo '${name}' debe tener como minimo una mayuscula, una minuscula, un numero y mas de 5 caracteres`,
    validationChecked:  (name = 'field') => `El campo '${name}' debe estar seleccionado`,

    validationEmpty: (name = 'field') => `El campo '${name}' no puede estar vacio`,
    validationUnique: (name = 'field') => `${name} ya existente en la base de datos`,
    validation: (name = 'field') => `El campo '${name}' est incorrecto`,
    validationNotFound: (name = 'field') => `No se ha encontrado ningun '${name}' en nuestra base de datos con los parametros dados`,
    validationSelfUser: 'Esta operación no se puede ejecutar a su propia cuenta de usuario',
    validationTerms: "Las condiciones dde utilizacion deben estar aceptadas",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Funcionalidad '${name}' no disponible`,

    //Auth
    authTokenMissing: 'Autentification necessaria para acceder',
    authTokenInvalid: 'Su session no es valida, connectese de nuevo',
    authTokenInvalidAdmin: 'Tienes que ser administrador para acceder aqui',
    authInvalidCredentials: 'Credenciales incorrectas',
    authTooManyTrials:  'Demasiados intentos fallados, intentalo de nuevo en unos minutos',
    authAlreadyLoggedIn:  'Usted ya esta connectado',

    authEmailResetPassword: (name = 'field') => `Un correo electronico con el nuevo password ha sido enviado a : ${name}`,
    authEmailValidate: (name = 'field') => `Un correo electronico de confirmacion a sido enviado a : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Verificacion de la cuenta de correo`,
    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nuevo password`,
    authEmailSentError: 'No se ha podido enviar el correo, contacte con el administrador',
    oauth2MissingField : (name = 'field') => `Error de autentificacion, impossible de recuperar el campo ${name} `,

    apiRouteNotFound: 'El servidor no encontró la petición',

    messageSent: 'Su mensaje a sido enviado',


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };