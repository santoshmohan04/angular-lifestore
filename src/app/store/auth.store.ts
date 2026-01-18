import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState, withHooks } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService, AuthResponseData } from '../services/auth.service';

// Auth State Interface
export interface AuthState {
  user: AuthResponseData | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// Storage key for persisting auth state
const AUTH_STORAGE_KEY = 'authdata';

// Helper function to load persisted state
function loadAuthFromStorage(): Partial<AuthState> {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      const user = JSON.parse(storedAuth) as AuthResponseData;
      return {
        user,
        token: user.access_token
      };
    }
  } catch (error) {
    console.error('Failed to load auth from storage:', error);
  }
  return { user: null, token: null };
}

// Helper function to persist state
function saveAuthToStorage(user: AuthResponseData | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem('prodList');
    }
  } catch (error) {
    console.error('Failed to save auth to storage:', error);
  }
}

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  ...loadAuthFromStorage()
};

// Auth Signal Store
export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  
  // Computed Signals
  withComputed((store) => ({
    // Check if user is authenticated
    isAuthenticated: computed(() => !!store.token() && !!store.user()),
    
    // Check if user is logged in (alias for isAuthenticated)
    isLoggedIn: computed(() => !!store.token() && !!store.user()),
    
    // Get user email
    userEmail: computed(() => store.user()?.user.email || null),
    
    // Get user display name
    userDisplayName: computed(() => {
      const user = store.user();
      return user ? `${user.user.firstName} ${user.user.lastName}` : null;
    }),
    
    // Get user ID
    userId: computed(() => store.user()?.user.id || null),
    
    // Check if currently loading
    isLoading: computed(() => store.loading()),
    
    // Check if there's an error
    hasError: computed(() => !!store.error()),
  })),
  
  // Methods
  withMethods((store, authService = inject(AuthService), router = inject(Router)) => {
    
    const methods = {
      // Login method
      login: rxMethod<{ email: string; password: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((credentials) => {
            return authService.login(credentials).pipe(
              tap((authData: AuthResponseData) => {
                // Save to state
                patchState(store, {
                  user: authData,
                  token: authData.access_token,
                  loading: false,
                  error: null
                });
                
                // Persist to localStorage
                saveAuthToStorage(authData);
                
                // Navigate to products page
                router.navigate(['/products']);
              }),
              catchError((error) => {
                const errorMessage = error.message || 'Login failed';
                patchState(store, {
                  loading: false,
                  error: errorMessage
                });
                return of(null);
              })
            );
          })
        )
      ),
      
      // Signup method
      signup: rxMethod<{ firstName: string; lastName: string; email: string; password: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((signupData) => {
            return authService.signup(signupData).pipe(
              tap((authData: AuthResponseData) => {
                // Save to state
                patchState(store, {
                  user: authData,
                  token: authData.access_token,
                  loading: false,
                  error: null
                });
                
                // Persist to localStorage
                saveAuthToStorage(authData);
                
                // Navigate to products page
                router.navigate(['/products']);
              }),
              catchError((error) => {
                const errorMessage = error.message || 'Signup failed';
                patchState(store, {
                  loading: false,
                  error: errorMessage
                });
                return of(null);
              })
            );
          })
        )
      ),
      
      // Change password method
      changePassword: rxMethod<{ password: string }>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap((payload) => {
            return authService.chngpswd(payload).pipe(
              tap((response: any) => {
                patchState(store, {
                  loading: false,
                  error: null
                });
                
                // Update user data if needed
                const currentUser = store.user();
                if (currentUser && response.user) {
                  const updatedUser = { ...currentUser, ...response.user };
                  patchState(store, { user: updatedUser });
                  saveAuthToStorage(updatedUser);
                }
              }),
              catchError((error) => {
                const errorMessage = error.message || 'Password change failed';
                patchState(store, {
                  loading: false,
                  error: errorMessage
                });
                return of(null);
              })
            );
          })
        )
      ),
      
      // Logout method
      logout(): void {
        // Clear state
        patchState(store, {
          user: null,
          token: null,
          loading: false,
          error: null
        });
        
        // Clear storage
        saveAuthToStorage(null);
        
        // Navigate to auth page
        router.navigate(['/auth']);
      },
      

      
      // Set error manually
      setError(error: string | null): void {
        patchState(store, { error });
      },
      
      // Clear error
      clearError(): void {
        patchState(store, { error: null });
      },
      
      // Reset state
      reset(): void {
        patchState(store, {
          user: null,
          token: null,
          loading: false,
          error: null
        });
        saveAuthToStorage(null);
      }
    };
    
    return methods;
  }),
  
  // Lifecycle hooks
  withHooks({
    onInit(store) {
      // State is automatically loaded from localStorage via initialState
    },
    onDestroy() {
      // Cleanup is handled via logoutTimer$ Subject
    }
  })
);
