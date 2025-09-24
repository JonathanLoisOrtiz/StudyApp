import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import useThemeStore from '../state/themeStore';
import useDeckStore from '../state/deckStore';
import { pixelFont, cardShadow } from '../theme/theme';
import OCRService from '../services/OCRService';
import GPT4ALLService, { GeneratedCard } from '../services/GPT4ALLService';

export default function ImageNotesScreen({ route, navigation }: any) {
  const { palette } = useThemeStore();
  const { addCard, decks } = useDeckStore();
  const [images, setImages] = useState<string[]>([]);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState(route.params?.deckId || decks[0]?.id);

  const pickImages = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        allowsMultipleSelection: true,
        selectionLimit: 6,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1
      });
      if (!res.canceled) {
        setImages(prev => [
          ...prev,
          ...res.assets.map((a: ImagePicker.ImagePickerAsset) => a.uri)
        ]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Image pick failed');
    }
  };

  const captureImage = async () => {
    try {
      const res = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: false });
      if (!res.canceled) {
        setImages(prev => [...prev, ...res.assets.map(a => a.uri)]);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Camera capture failed');
    }
  };

  const runOCR = async () => {
    if (!images.length) {
      Alert.alert('No Images', 'Select at least one note photo.');
      return;
    }
    // Only allow images already resolved to file system paths (file://)
    const fileImages = images.filter(u => u.startsWith('file://'));
    const skipped = images.length - fileImages.length;
    if (!fileImages.length) {
      Alert.alert('No Local Files', 'Only local file:// images are allowed for OCR. Export or save your photos to Files first.');
      return;
    }
    setIsProcessing(true);
    try {
      const result = await OCRService.extractText(fileImages);
      setOcrText(result.text);
      if (result.warnings?.length) {
        Alert.alert('Notice', result.warnings.join('\n'));
      }
      if (skipped > 0) {
        Alert.alert('Skipped', `${skipped} image(s) skipped (not file://).`);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'OCR failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateCards = async () => {
    if (!ocrText.trim()) {
      Alert.alert('No Text', 'Run OCR first.');
      return;
    }
    setIsProcessing(true);
    try {
      const cards = await GPT4ALLService.generateCards(ocrText, 8);
      setGeneratedCards(cards);
      if (!cards.length) Alert.alert('No Cards', 'Could not derive cards.');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Card generation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const saveCards = async () => {
    if (!selectedDeckId || !generatedCards.length) return;
    try {
      for (const c of generatedCards) {
        await addCard(selectedDeckId, c.front, c.back);
      }
      Alert.alert('Saved', `${generatedCards.length} cards added.`, [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Saving failed');
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: palette.bg, padding: 16 },
    title: { fontSize: 24, fontFamily: pixelFont.heavy, color: palette.text, textAlign: 'center', marginBottom: 16 },
  button: { backgroundColor: palette.accent, borderColor: palette.border, borderWidth: 2, borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 12, ...cardShadow },
    alt: { backgroundColor: palette.info },
    warn: { backgroundColor: palette.success },
    buttonText: { color: '#fff', fontFamily: pixelFont.heavy, fontSize: 15 },
    row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
    thumb: { width: 90, height: 90, margin: 4, borderRadius: 8, borderWidth: 2, borderColor: palette.border },
    preview: { backgroundColor: palette.panel, borderColor: palette.border, borderWidth: 2, borderRadius: 8, padding: 10, maxHeight: 140 },
    section: { fontSize: 18, fontFamily: pixelFont.heavy, color: palette.text, marginVertical: 10 },
    deckChip: { backgroundColor: palette.panel, borderColor: palette.border, borderWidth: 2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, marginRight: 8, marginBottom: 8 },
    deckChipActive: { backgroundColor: palette.accent },
    deckChipText: { color: palette.text, fontFamily: pixelFont.fontFamily },
    deckChipTextActive: { color: '#fff', fontFamily: pixelFont.heavy },
    card: { backgroundColor: palette.panel, borderColor: palette.border, borderWidth: 2, borderRadius: 12, padding: 12, marginBottom: 8 },
    front: { color: palette.text, fontFamily: pixelFont.heavy, marginBottom: 4 },
    back: { color: palette.subtle, fontFamily: pixelFont.fontFamily },
    save: { backgroundColor: palette.success, borderColor: palette.border, borderWidth: 2, borderRadius: 12, padding: 16, alignItems: 'center', ...cardShadow, marginTop: 10 }
  });

  const availableDecks = decks.filter(d => d.name !== 'Default');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Image → Cards</Text>
      <TouchableOpacity style={styles.button} onPress={pickImages}>
        <Text style={styles.buttonText}>🖼️ Pick Images</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.alt]} onPress={captureImage}>
        <Text style={styles.buttonText}>📷 Capture Photo</Text>
      </TouchableOpacity>
      {!!images.length && (
        <View style={styles.row}>
          {images.map((u, i) => <Image key={i} source={{ uri: u }} style={styles.thumb} />)}
        </View>
      )}
      <TouchableOpacity style={[styles.button, styles.alt]} disabled={isProcessing} onPress={runOCR}>
        {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🔍 Run OCR</Text>}
      </TouchableOpacity>
      {!!ocrText && (
        <>
          <Text style={styles.section}>Extracted Text Preview</Text>
          <ScrollView style={styles.preview} nestedScrollEnabled>
            <Text style={{ color: palette.text, fontFamily: pixelFont.fontFamily }}>
              {ocrText.length > 600 ? ocrText.slice(0, 600) + '…' : ocrText}
            </Text>
          </ScrollView>
          <TouchableOpacity style={[styles.button, styles.warn]} disabled={isProcessing} onPress={generateCards}>
            {isProcessing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>🤖 Generate Cards</Text>}
          </TouchableOpacity>
        </>
      )}
      {!!generatedCards.length && (
        <>
          <Text style={styles.section}>Generated Cards ({generatedCards.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {availableDecks.map(d => (
              <TouchableOpacity key={d.id} style={[styles.deckChip, selectedDeckId === d.id && styles.deckChipActive]} onPress={() => setSelectedDeckId(d.id)}>
                <Text style={[styles.deckChipText, selectedDeckId === d.id && styles.deckChipTextActive]}>{d.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {generatedCards.map((c, i) => (
            <View key={i} style={styles.card}>
              <Text style={styles.front}>{c.front}</Text>
              <Text style={styles.back}>{c.back}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.save} onPress={saveCards}>
            <Text style={styles.buttonText}>💾 Save All</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
