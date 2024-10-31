class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}

const comparePassword = (options) => {
  const { password, confirmPassword } = options;
    if (password !== confirmPassword) {
      throw new CustomError('La contraseña y la confirmación de contraseña no coinciden');
    }
}

module.exports = {
  CustomError: CustomError,
  comparePassword: comparePassword
}; 