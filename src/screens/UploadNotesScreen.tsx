import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import useThemeStore from '../state/themeStore';
import useDeckStore from '../state/deckStore';
import { pixelFont, cardShadow } from '../theme/theme';
import GPT4ALLService, { GeneratedCard } from '../services/GPT4ALLService';

export default function UploadNotesScreen({ route, navigation }: any) {
  const { palette } = useThemeStore();
  const { addCard, decks } = useDeckStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState(route.params?.deckId || decks[0]?.id);

  const styles = React.useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.bg,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontFamily: pixelFont.heavy,
      color: palette.text,
      textAlign: 'center',
      marginBottom: 24,
    },
    uploadButton: {
      backgroundColor: palette.accent,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 16,
      ...cardShadow,
    },
    button: {
      backgroundColor: palette.accent,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      marginTop: 12,
      ...cardShadow,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontFamily: pixelFont.heavy,
      fontSize: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: pixelFont.heavy,
      color: palette.text,
      marginBottom: 12,
    },
    previewText: {
      backgroundColor: palette.panel,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 8,
      padding: 12,
      color: palette.text,
      fontFamily: pixelFont.fontFamily,
      maxHeight: 120,
    },
    deckSelector: {
      marginBottom: 16,
    },
    label: {
      color: palette.text,
      fontFamily: pixelFont.fontFamily,
      marginBottom: 8,
      fontSize: 16,
    },
    deckChip: {
      backgroundColor: palette.panel,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginRight: 8,
    },
    deckChipActive: {
      backgroundColor: palette.accent,
      borderColor: palette.border,
    },
    deckChipText: {
      color: palette.text,
      fontFamily: pixelFont.fontFamily,
      fontSize: 14,
    },
    deckChipTextActive: {
      color: '#fff',
      fontFamily: pixelFont.heavy,
    },
    cardPreview: {
      backgroundColor: palette.panel,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 12,
      padding: 12,
      marginBottom: 8,
      ...cardShadow,
    },
    cardFront: {
      color: palette.text,
      fontFamily: pixelFont.heavy,
      fontSize: 16,
      marginBottom: 6,
    },
    cardBack: {
      color: palette.subtle,
      fontFamily: pixelFont.fontFamily,
      fontSize: 14,
    },
    saveButton: {
      backgroundColor: palette.success,
      borderColor: palette.border,
      borderWidth: 2,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      ...cardShadow,
    },
    processingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    processingText: {
      color: palette.text,
      fontFamily: pixelFont.fontFamily,
      marginTop: 8,
      textAlign: 'center',
    },
  }), [palette]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const file = result.assets[0];
        if (file.mimeType?.includes('text') || file.name?.endsWith('.txt')) {
          const text = await FileSystem.readAsStringAsync(file.uri);
          setExtractedText(text);
        } else {
          Alert.alert('Unsupported Format', 'Please upload a .txt file');
        }
      }
    } catch (err: any) {
      console.error('Document picker error:', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const generateCards = async () => {
    if (!extractedText.trim()) {
      Alert.alert('Error', 'No text to process');
      return;
    }

    setIsProcessing(true);
    try {
      const cards = await GPT4ALLService.generateCards(extractedText, 8);
      setGeneratedCards(cards);
      
      if (cards.length === 0) {
        Alert.alert('No Cards Generated', 'Unable to generate cards from this text. Try with more detailed notes or definitions.');
      }
    } catch (error) {
      console.error('Card generation error:', error);
      Alert.alert('Error', 'Failed to generate cards. Please try again or check your text format.');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCards = async () => {
    if (!selectedDeckId || generatedCards.length === 0) return;

    try {
      for (const card of generatedCards) {
        await addCard(selectedDeckId, card.front, card.back);
      }
      Alert.alert('Success', `Added ${generatedCards.length} cards to deck!`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Save cards error:', error);
      Alert.alert('Error', 'Failed to save cards');
    }
  };

  const availableDecks = decks.filter(d => d.name !== 'Default');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Generate Cards from Notes</Text>
      
      <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
        <Text style={styles.buttonText}>📄 Upload Notes (.txt)</Text>
      </TouchableOpacity>

      {extractedText ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extracted Text Preview:</Text>
          <ScrollView style={styles.previewText} nestedScrollEnabled>
            <Text style={{ color: palette.text, fontFamily: pixelFont.fontFamily }}>
              {extractedText.length > 500 ? extractedText.substring(0, 500) + '...' : extractedText}
            </Text>
          </ScrollView>
          
          <TouchableOpacity 
            style={[styles.button, isProcessing && styles.buttonDisabled]} 
            onPress={generateCards}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <View style={styles.processingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={[styles.processingText, { color: '#fff' }]}>
                  Processing notes...
                </Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>🤖 Generate Cards</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      {generatedCards.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Generated Cards ({generatedCards.length})</Text>
          
          {/* Deck Selector */}
          <View style={styles.deckSelector}>
            <Text style={styles.label}>Add to deck:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {availableDecks.map(deck => (
                <TouchableOpacity
                  key={deck.id}
                  style={[
                    styles.deckChip,
                    selectedDeckId === deck.id && styles.deckChipActive
                  ]}
                  onPress={() => setSelectedDeckId(deck.id)}
                >
                  <Text style={[
                    styles.deckChipText,
                    selectedDeckId === deck.id && styles.deckChipTextActive
                  ]}>
                    {deck.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Card Previews */}
          {generatedCards.map((card, index) => (
            <View key={index} style={styles.cardPreview}>
              <Text style={styles.cardFront}>{card.front}</Text>
              <Text style={styles.cardBack}>{card.back}</Text>
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={saveCards}>
            <Text style={styles.buttonText}>💾 Save All Cards</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
