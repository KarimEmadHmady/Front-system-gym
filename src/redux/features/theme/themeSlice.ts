import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'auto' | 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'auto',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    toggleTheme(state) {
      const next: Record<ThemeMode, ThemeMode> = {
        auto: 'dark',
        dark: 'light',
        light: 'auto',
      };
      state.mode = next[state.mode];
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;

export default themeSlice.reducer;
