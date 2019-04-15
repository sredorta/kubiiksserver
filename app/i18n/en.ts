export const messages = {
    description: 'This is an api',
    user: 'User',
    firstName: "First name",
    lastName: "Last name",
    email: "Email",
    password: "Password",
    phone: "phone",
    mobile: "cell phone",
    validationMinLength: (name = 'field', value='value') => `${name} must have at least ${value} characters`,
    validationMaxLength: (name = 'field', value='value') => `${name} must have less than ${value} characters`,
    validationPassword: (name = 'field') => `The ${name} must have lowercases, uppercases, numbers and be more than 5 characters long`,
    validationEmpty: (name = 'field') => `${name} cannot be empty`,
    validationUnique: (name = 'field') => `${name} already exists in the database`,
    validation: (name = 'field') => `Wrong value for for field '${name}'`,
    validationParamsSequelize: (name= 'field') => `Wrong database value for field '${name}'`,
    validationUniqueSequelize: 'Unique constraint violated in database',
    validationNotNullSequelize: (name= 'field') => `Field '${name}' cannot be empty`,

    title: 'Simple i18n implementation with TypeScript',
    greeting: (name = 'John Doe') => `Hello, ${name}.`,
    unreadNotification: (unread: number) => `You have ${unread === 0 ? 'no' : unread} unread message${unread === 1 ? '' : 's'}.`
  };