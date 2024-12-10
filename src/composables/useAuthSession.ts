import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Session timeout in minutes
const SESSION_TIMEOUT = 30;
const STORAGE_KEY = 'auth_session_timestamp';
const SYNC_CHANNEL = 'auth_sync_channel';

export function useAuthSession() {
  const router = useRouter();
  const authStore = useAuthStore();

  const sessionTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const activityTimer = ref<ReturnType<typeof setTimeout> | null>(null);
  const isActive = ref(true);
  const broadcastChannel = typeof BroadcastChannel !== 'undefined' 
    ? new BroadcastChannel(SYNC_CHANNEL) 
    : null;

  // Update session timestamp
  const updateSessionTimestamp = () => {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
    broadcastChannel?.postMessage({ type: 'activity' });
  };

  // Reset session timer
  const resetSessionTimer = () => {
    if (sessionTimer.value) {
      clearTimeout(sessionTimer.value);
    }
    
    updateSessionTimestamp();
    
    // Set new timeout
    sessionTimer.value = setTimeout(async () => {
      const lastActivity = Number(localStorage.getItem(STORAGE_KEY) || '0');
      const timeSinceActivity = Date.now() - lastActivity;

      if (timeSinceActivity >= SESSION_TIMEOUT * 60 * 1000) {
        console.log('Session timeout - logging out');
        await authStore.logout();
        router.push('/login');
        broadcastChannel?.postMessage({ type: 'logout' });
      }
    }, SESSION_TIMEOUT * 60 * 1000);
  };

  // Handle user activity
  const handleUserActivity = () => {
    if (activityTimer.value) {
      clearTimeout(activityTimer.value);
    }
    
    // Debounce activity handling
    activityTimer.value = setTimeout(() => {
      if (authStore.isAuthenticated) {
        resetSessionTimer();
      }
    }, 1000);
  };

  // Setup activity listeners
  const setupActivityListeners = () => {
    if (!isActive.value) return;

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
  };

  // Remove activity listeners
  const removeActivityListeners = () => {
    window.removeEventListener('mousemove', handleUserActivity);
    window.removeEventListener('keydown', handleUserActivity);
    window.removeEventListener('click', handleUserActivity);
    window.removeEventListener('scroll', handleUserActivity);
    window.removeEventListener('touchstart', handleUserActivity);

    if (sessionTimer.value) {
      clearTimeout(sessionTimer.value);
      sessionTimer.value = null;
    }
    if (activityTimer.value) {
      clearTimeout(activityTimer.value);
      activityTimer.value = null;
    }
  };

  // Handle sync messages from other tabs
  const handleSyncMessage = (event: MessageEvent) => {
    if (!isActive.value) return;

    switch (event.data.type) {
      case 'activity':
        if (authStore.isAuthenticated) {
          resetSessionTimer();
        }
        break;
      case 'logout':
        authStore.logout();
        router.push('/login');
        break;
    }
  };

  // Initialize session management
  const initializeSession = () => {
    if (authStore.isAuthenticated) {
      resetSessionTimer();
      setupActivityListeners();
      broadcastChannel?.addEventListener('message', handleSyncMessage);
    }
  };

  // Watch for auth state changes
  const handleAuthChange = (isAuthenticated: boolean) => {
    if (isAuthenticated) {
      resetSessionTimer();
      setupActivityListeners();
      broadcastChannel?.addEventListener('message', handleSyncMessage);
    } else {
      removeActivityListeners();
      broadcastChannel?.removeEventListener('message', handleSyncMessage);
    }
  };

  // Setup
  onMounted(() => {
    initializeSession();
    
    // Watch auth state
    let lastAuthState = authStore.isAuthenticated;
    const authCheckInterval = setInterval(() => {
      const currentAuthState = authStore.isAuthenticated;
      if (currentAuthState !== lastAuthState) {
        handleAuthChange(currentAuthState);
        lastAuthState = currentAuthState;
      }
    }, 1000);

    // Check for existing session on load
    const lastActivity = Number(localStorage.getItem(STORAGE_KEY) || '0');
    const timeSinceActivity = Date.now() - lastActivity;
    if (timeSinceActivity >= SESSION_TIMEOUT * 60 * 1000 && authStore.isAuthenticated) {
      authStore.logout();
      router.push('/login');
    }

    // Cleanup function
    return () => {
      isActive.value = false;
      clearInterval(authCheckInterval);
      removeActivityListeners();
      broadcastChannel?.removeEventListener('message', handleSyncMessage);
      broadcastChannel?.close();
    };
  });

  return {
    resetSessionTimer,
    handleUserActivity,
  };
}
