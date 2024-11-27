import { ref } from 'vue'
import { googleConfig } from '@/config/google'

const isAuthenticated = ref(false)
const user = ref(null)
const isAdmin = ref(false)

// List of admin email addresses
const ADMIN_EMAILS = [
  'richard@woundcaregrafts.com',
  // Add other admin emails here
]

export const useAuth = () => {
  const initGoogleAuth = () => {
    return new Promise((resolve, reject) => {
      try {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: googleConfig.clientId,
          scope: googleConfig.scope,
          callback: (response) => {
            if (response.error) {
              reject(response)
              return
            }
            handleAuthResponse(response)
            resolve(response)
          },
        })
        window.tokenClient = client
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  const handleAuthResponse = (response) => {
    if (response.access_token) {
      // Get user info using the access token
      fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          'Authorization': `Bearer ${response.access_token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        user.value = {
          id: data.sub,
          name: data.name,
          email: data.email,
          token: response.access_token
        }
        isAdmin.value = ADMIN_EMAILS.includes(data.email)
        isAuthenticated.value = true
      })
      .catch(error => {
        console.error('Error fetching user info:', error)
      })
    }
  }

  const login = async () => {
    try {
      if (!window.tokenClient) {
        await initGoogleAuth()
      }
      window.tokenClient.requestAccessToken()
    } catch (error) {
      console.error('Google Auth Error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Revoke the token
      if (user.value?.token) {
        const url = `https://oauth2.googleapis.com/revoke?token=${user.value.token}`
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })
      }

      // Clear local state
      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false

      // Clear Google's auth state
      google.accounts.oauth2.revoke(user.value?.token, () => {
        console.log('Token revoked')
      })
    } catch (error) {
      console.error('Logout Error:', error)
      throw error
    }
  }

  return {
    isAuthenticated,
    isAdmin,
    user,
    login,
    logout,
    initGoogleAuth
  }
}
