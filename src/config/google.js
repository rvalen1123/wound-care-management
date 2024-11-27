export const googleConfig = {
  clientId: process.env.VUE_APP_GOOGLE_CLIENT_ID,
  scope: 'https://www.googleapis.com/auth/spreadsheets.readonly email profile openid',
  prompt: 'consent',
  plugin_name: 'Wound Care Management'
}
