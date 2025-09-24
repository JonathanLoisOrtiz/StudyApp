# Anki Clone (iOS focused)

Medium parity goals:
- Decks & cards (basic front/back) local only
- Simplified Anki scheduler (graduation, lapses, ease factors)
- Daily reminder notifications (local) + optional schedule
- Gesture-friendly modern UI

Next steps to implement:
1. Install dependencies (run `npm install` or `yarn`).
2. Add React Navigation packages (currently missing) and gesture libs.
3. Implement persistent storage via expo-sqlite (currently in-memory). 
4. Expand scheduler to full daily queue building and bury/suspend logic.
5. Add theming (light/dark) and animations.

Planned packages still to add:
- @react-navigation/native
- @react-navigation/native-stack
- react-native-gesture-handler react-native-reanimated

Add them: `npx expo install @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated`

After that run: `npm run ios`
