export class SessionValidationError extends Error {
  constructor() {
    super('Não foi possível validar a sessão.')
    this.name = 'SessionValidationError'
  }
}
