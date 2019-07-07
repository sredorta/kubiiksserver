export const messages = {
    description: "Esto es una api",
    User: 'Usuario',
    cathegory: "categoria",

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
    authKubiiksRole : "Los derechos de 'kubiiks' no son modificables",
    authTokenMissing: 'Autentification necessaria para acceder',
    authTokenInvalid: 'Su session no es valida, connectese de nuevo',
    authTokenInvalidRole: (name = 'field') => `Tienes que tener los derechos de '${name}' para acceder aqui`,
    authInvalidCredentials: 'Credenciales incorrectas',
    authTooManyTrials:  'Demasiados intentos fallados, intentalo de nuevo en unos minutos',
    authAlreadyLoggedIn:  'Usted ya esta connectado',

    oauth2MissingField : (name = 'field') => `Error de autentificacion, impossible de recuperar el campo ${name} `,
    authEmailResetPassword: (name = 'field') => `Un correo electronico con el nuevo password ha sido enviado a : ${name}`,
    authEmailValidate: (name = 'field') => `Un correo electronico de confirmacion a sido enviado a : ${name}`,
    authEmailValidateSubject: (name = 'field') => `${name} : Verificacion de la cuenta de correo`,    
    authEmailValidateError: 'La cuenta no ha podido ser activada, contacta con el administrador',
    authEmailValidateSuccess: 'La cuenta ha sido activada',
    authAccountNotActive: 'Tienes que validar la cuenta de correo electronico antes de poder acceder',

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nuevo password`,
    emailSentOk:    (name = 'field') => `Un correo electronico ha sido enviado a : ${name}`,
    emailSentError: 'No se ha podido enviar el correo, contacte con el administrador',
    emailSiteAccess : 'IR AL SITIO WEB',
    emailDeleteProtected: 'Los modelos de correo del systema no se pueden borrar',
    emailValidationLink: (name = 'field') => `<p>Por favor valida tu cuenta clickando en el siguiente <a href='${name}'>link</a></p>`,
    emailResetPassword: (name = 'field') => `<p>Su nuevo password : <span>${name}<span></p>`,
    emailResetPasswordSubject: (name = 'field') => `${name} : Nuevo password`,

    //chat part
    chatWelcome: "BOT: Bienvenido a nuestro chat",
    chatLanguageSwitch: "BOT: Nos puedes hablar en español si prefieres",
    chatJoinRoom: (name = '') => `${name} : Ha entrado en el chat`,
    chatLeaveRoom: (name = '') => `${name} : Se fue del chat`,

    //notifications titles
    notificationContactEmail: 'Recivido un nuevo email de contacto',    

    articleContentNotCreate: "Los articulos de la categoria 'content' no se pueden crear",
    articleContentNotDelete: "Los articulos de la categoria 'content' no se pueden borrar",
    articleDelete: 'Articulo eliminado correctamente',
    articleNewTitle: 'Nuevo articlulo',
    articleNewDescription: 'Ejemplo de descripcion',
    articleNewContent:  '<h1>Nuevo articulo</h1>',

    apiRouteNotFound: 'El servidor no encontró la petición',




    messageSent: 'Su mensaje a sido enviado',
    saved : 'Modificaciones guardadas correctamente',


    title: 'Implementation simple de i18n avec TypeScript',
    greeting: (name = 'John Doe') => `Bonjour, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
    };