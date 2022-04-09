import { configureStore } from '@reduxjs/toolkit'
import patternSlice from './patternSlice'
import GameControlsSlice from './gameControlsSlice'

export const store = configureStore({
  reducer: {
    pattern: patternSlice,
    controls: GameControlsSlice,
  },
})