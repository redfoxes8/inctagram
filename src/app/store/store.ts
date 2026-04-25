import { baseApi } from "@/shared/api/baseApi"
import { combineReducers, configureStore, UnknownAction } from "@reduxjs/toolkit"

const rootReducer = combineReducers({
  [baseApi.reducerPath]: baseApi.reducer,
})

const rootReducerWithLogout = (state: ReturnType<typeof rootReducer> | undefined, action: UnknownAction) => {
  if (action.type === "auth/logout") {
    state = undefined
  }
  return rootReducer(state, action)
}

export const store = () => {
  return configureStore({
    reducer: rootReducerWithLogout,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat(baseApi.middleware),
  })
}

export type AppStore = ReturnType<typeof store>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore["dispatch"]
