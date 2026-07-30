const accessTokenKey = 'codeconnect.auth.accessToken'

export const authStorage = {
  clearAccessToken() {
    window.sessionStorage.removeItem(accessTokenKey)
  },
  getAccessToken() {
    return window.sessionStorage.getItem(accessTokenKey)
  },
  setAccessToken(accessToken: string) {
    window.sessionStorage.setItem(accessTokenKey, accessToken)
  },
}

export { accessTokenKey }
