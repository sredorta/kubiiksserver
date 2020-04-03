export const messages = {
    description: "Esto es una api",
    User: 'Usuario',
    cathegory: "categoría",

    validationExists: (name = 'field') => `Falta el parámetro '${name}'`,
    validationDBExists: (name = 'field') => `'${name}' no encontrado en la base de datos`,
    validationDBMissing: (name = 'field') => `'${name}' ya existe en la base de datos`,

    validationMinLength:(name = 'field', value='value') => `El campo '${name}' debe tener como mínimo ${value} caracteres`,
    validationMaxLength: (name = 'field', value='value') => `El campo '${name}' debe tener menos de ${value} caracteres`,
    validationPassword: (name = 'field') => `El campo '${name}' debe tener como mínimo una mayúscula, una minúscula, un número y mas de 5 caracteres`,
    validationChecked:  (name = 'field') => `El campo '${name}' debe estar seleccionado`,

    validationEmpty: (name = 'field') => `El campo '${name}' no puede estar vacío`,
    validationUnique: (name = 'field') => `${name} ya existente en la base de datos`,
    validation: (name = 'field') => `El campo '${name}' es incorrecto`,
    validationNotFound: (name = 'field') => `No se ha encontrado ningún '${name}' en nuestra base de datos con los parámetros dados`,
    validationSelfUser: 'Esta operación no se puede ejecutar a su propia cuenta de usuario',
    validationTerms: "Las condiciones de utilización deben estar aceptadas",

    //Other system messages
    featureNotAvailable: (name = 'field') => `Funcionalidad '${name}' no disponible`,

    //Auth
    authKubiiksRole : "Los derechos de 'kubiiks' no son modificables",
    authTokenMissing: 'Autentificación necesaria para acceder',
    authTokenInvalid: 'Su sesión no es válida, conéctese de nuevo',
    authTokenInvalidRole: (name = 'field') => `Debes tener los derechos de '${name}' para acceder aquí`,
    authInvalidCredentials: 'Credenciales incorrectas',
    authTooManyTrials:  'Demasiados intentos fallados, inténtalo de nuevo en unos minutos',
    authAlreadyLoggedIn:  'Usted ya está conectado',

    oauth2MissingField : (name = 'field') => `Error de autentificación, imposible de recuperar el campo ${name} `,
    authEmailResetPassword: (name = 'field') => `Un correo electrónico ha sido enviado a : ${name}`,
    authEmailValidate: (name = 'field') => `Un correo electrónico de confirmación ha sido enviado a : ${name}`,
    authEmailValidateSubject: 'Verificación de la cuenta de correo',    
    authEmailValidateError: 'No se ha podido activar la cuenta, contacta con el administrador',
    authEmailValidateSuccess: 'La cuenta ha sido activada',
    authAccountNotActive: 'Tienes que validar la cuenta de correo electrónico antes de poder acceder',
    authEstablisPasswordError: "No se ha podido reinicializar la contraseña, contacte con el administrador",

    authEmailResetPasswordSubject: (name = 'field') => `${name} : Nueva contraseña`,
    emailSentOk:    (name = 'field') => `Un correo electrónico ha sido enviado a : ${name}`,
    emailSentOkAll: (count = '0') => `Correo enviado a ${count} usuarios`,

    emailSentError: 'No se ha podido enviar el correo, contacte con el administrador',
    emailSiteAccess : 'IR AL SITIO WEB',
    emailDeleteProtected: 'Los modelos de correo del sistema no se pueden borrar',
    emailValidationLink: (name = 'field') => `<p>Por favor valida tu cuenta clicando en el siguiente <a href='${name}'>enlace</a></p>`,
    emailResetPassword: (name = 'field') => `<p>Su nueva contraseña : <span>${name}<span></p>`,
    emailResetPasswordSubject: 'Recuperar mi cuenta',
    emailResetPasswordNoUser: "Ha habido una demanda de reinicializacion de contraseña para esta cuenta de correo electronico, esta cuenta no està en nuestras bases de datos",

    //chat part
    chatWelcome: "Bienvenido a nuestro chat",
    chatLanguageSwitch: "Nos puedes hablar en español si prefieres",
    chatJoinRoom: (name = '') => `${name} : Ha entrado en el chat`,
    chatLeaveRoom: (name = '') => `${name} : Se fue del chat`,

    //notifications titles
    notificationContactEmail: 'Recibido un nuevo correo electrónico de contacto',    
    notificationNewChat: 'Un nuevo chat viene de empezar',

    articleContentNotCreate: "Los artículos de la categoría 'content' no se pueden crear",
    articleContentNotDelete: "Los artículos de la categoría 'content' no se pueden borrar",
    articleDelete: 'Artículo eliminado correctamente',
    articleNewTitle: 'Mi titulo',
    articleNewDescription: 'Mi descripción',
    articleNewContent:  '<p>Mi contenido</p>',

    notificationNewTitle: 'Mi titulo de notificacion',
    notificationNewBody: 'Contenido de mi notificacion',
    notificationSendOk: 'Notificacion enviada correctamente',


    apiRouteNotFound: 'El servidor no encontró la petición',

    newsletterSubscribed: "A partir de ahora va a recibir los boletines informativos",
    newsletterUnsubscribed: "Ya no va a recibir los boletines informativos en ésta cuenta de correo electrónico",
    newsletterMissing: "Esta cuenta de correo electrónico no está dada de alta para los boletines informativos",

    fileTooLarge: "Fichero demasiado voluminoso",


    messageSent: 'Su mensaje ha sido enviado',
    saved : 'Modificaciones guardadas correctamente',

    unreadNotification: (unread: number) => `Tiene ${unread === 0 ? 'no' : unread} notificaciones no leídas`
    };