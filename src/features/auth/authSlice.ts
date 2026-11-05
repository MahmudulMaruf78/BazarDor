import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { DemoSession } from '@/data/adapters/localStorage/sessionStore'
import type { RoleKey } from '@/constants/roles'
import {
  readDemoSession,
  resolveDemoDisplayName,
  signInDemoUser,
  signOutDemoUser,
} from './demoAuthService'

export type AuthState = {
  status: 'unknown' | 'anonymous' | 'authenticated'
  session: DemoSession | null
  displayName: string | null
}

const initialState: AuthState = {
  status: 'unknown',
  session: null,
  displayName: null,
}

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const stored = await readDemoSession()
  if (!stored.ok) throw new Error(stored.error.message)
  if (!stored.data) return { session: null, displayName: null }
  const displayName = await resolveDemoDisplayName(stored.data.userId)
  return { session: stored.data, displayName }
})

export const signInDemo = createAsyncThunk('auth/signInDemo', async (userId: string) => {
  const result = await signInDemoUser(userId)
  if (!result.ok) throw new Error(result.error.message)
  const displayName = await resolveDemoDisplayName(result.data.userId)
  return { session: result.data, displayName }
})

export const signOutDemo = createAsyncThunk('auth/signOutDemo', async () => {
  const result = await signOutDemoUser()
  if (!result.ok) throw new Error(result.error.message)
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.pending, (state) => {
        state.status = 'unknown'
      })
      .addCase(hydrateAuth.fulfilled, (state, action: PayloadAction<{ session: DemoSession | null; displayName: string | null }>) => {
        state.session = action.payload.session
        state.displayName = action.payload.displayName
        state.status = action.payload.session ? 'authenticated' : 'anonymous'
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.session = null
        state.displayName = null
        state.status = 'anonymous'
      })
      .addCase(signInDemo.fulfilled, (state, action) => {
        state.session = action.payload.session
        state.displayName = action.payload.displayName
        state.status = 'authenticated'
      })
      .addCase(signOutDemo.fulfilled, (state) => {
        state.session = null
        state.displayName = null
        state.status = 'anonymous'
      })
  },
})

export const authReducer = authSlice.reducer

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status
export const selectAuthSession = (state: { auth: AuthState }) => state.auth.session
export const selectAuthRole = (state: { auth: AuthState }): RoleKey | null =>
  state.auth.session?.role ?? null
export const selectAuthDisplayName = (state: { auth: AuthState }) => state.auth.displayName
