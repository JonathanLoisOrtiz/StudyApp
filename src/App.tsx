import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ClassesScreen from './screens/ClassesScreen';
import DeckListScreen from './screens/DeckListScreen';
import StudyScreen from './screens/StudyScreen';
import ManageCardsScreen from './screens/ManageCardsScreen';
import AddNoteScreen from './screens/AddNoteScreen';
import UploadNotesScreen from './screens/UploadNotesScreen';
import ImageNotesScreen from './screens/ImageNotesScreen';
import { requestNotificationPermission, scheduleDailyReminder } from './notifications/notifications';
import * as ImagePicker from 'expo-image-picker';
import PaletteScreen from './screens/PaletteScreen';
import HomeNavBar from './components/HomeNavBar';
import PhysicsDeckListScreen from './screens/PhysicsDeckListScreen';
import SplashScreen from './screens/SplashScreen';
import { View, TouchableOpacity, Text } from 'react-native';
import { Animated } from 'react-native';
import { pixelFont } from './theme/theme';
import useThemeStore from './state/themeStore';

const Stack = createNativeStackNavigator();

export default function App() {
  const { palette } = useThemeStore();
  React.useEffect(() => {
    (async () => {
      // Notifications
      await requestNotificationPermission();
      await scheduleDailyReminder(8);

      // Camera & Media Library permissions (first call will prompt, later calls are cached)
      try {
        const [{ status: camStatus }, { status: libStatus }] = await Promise.all([
          ImagePicker.requestCameraPermissionsAsync(),
          ImagePicker.requestMediaLibraryPermissionsAsync()
        ]);
        if (camStatus !== 'granted' || libStatus !== 'granted') {
          console.log('[Permissions] Camera or media library not granted');
        } else {
          console.log('[Permissions] Camera & media library granted');
        }
      } catch (e) {
        console.warn('Permission request error', e);
      }
    })();
  }, []);
  const navRef = useNavigationContainerRef();
  const [currentRoute, setCurrentRoute] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    const unsub = navRef.addListener('state', () => {
      setCurrentRoute(navRef.getCurrentRoute()?.name);
    });
    return unsub;
  }, [navRef]);

  return (
    <NavigationContainer ref={navRef}>
  <StatusBar style={palette.bg === '#181825' ? 'light' : 'dark'} backgroundColor={palette.pastelPurple} />
      <View style={{ flex:1 }}>
      <Stack.Navigator
        initialRouteName="Splash"
  screenOptions={({ navigation, route }) => ({
          headerStyle: {
            backgroundColor: palette.bg,
          },
          headerTintColor: palette.text,
          headerBackTitleVisible: false,
          headerTitleStyle: {
            fontWeight: 'bold',
            fontFamily: pixelFont.heavy,
          },
          headerShadowVisible: false,
          headerLeft: ({ canGoBack }) => {
            if (!canGoBack) return null;
            return (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ paddingHorizontal: 4, paddingVertical: 4 }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={{ fontSize: 26, lineHeight: 26, marginTop: -2, fontFamily: pixelFont.heavy, color: palette.text }}>‹</Text>
              </TouchableOpacity>
            );
          }
        })}
      >
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ title: '', headerShown: false, animation: 'fade' }}
        />
        <Stack.Screen 
          name="Classes" 
          component={ClassesScreen} 
          options={{ title: "Kiarita's Studying App", animation: 'fade' }}
        />
        <Stack.Screen 
          name="Decks" 
          component={DeckListScreen} 
          options={{ title: 'Chemistry Decks' }}
        />
        <Stack.Screen 
          name="PhysicsDecks" 
          component={PhysicsDeckListScreen} 
          options={{ title: 'Physics Decks' }}
        />
        <Stack.Screen 
          name="Study" 
          component={StudyScreen} 
          options={{ title: 'Study Session' }}
        />
        <Stack.Screen 
          name="ManageCards" 
          component={ManageCardsScreen} 
          options={{ title: 'Manage Cards' }} 
        />
        <Stack.Screen 
          name="AddNote" 
          component={AddNoteScreen} 
          options={{ title: 'Add Card' }} 
        />
        <Stack.Screen 
          name="UploadNotes" 
          component={UploadNotesScreen} 
          options={{ title: 'Generate from Notes' }} 
        />
        <Stack.Screen 
          name="ImageNotes" 
          component={ImageNotesScreen} 
          options={{ title: 'Image → Cards' }} 
        />
  {/* Settings screen removed */}
        <Stack.Screen 
          name="Palette" 
          component={PaletteScreen} 
          options={{ title: 'Palettes', headerLeft: () => null, headerBackVisible: false, animation: 'fade' }} 
        />
      </Stack.Navigator>
      {(currentRoute === 'Classes' || currentRoute === 'Palette') && (
        <HomeNavBar current={currentRoute as string} navigate={(r)=> navRef.navigate(r as never)} />
      )}
      </View>
    </NavigationContainer>
  );
}
