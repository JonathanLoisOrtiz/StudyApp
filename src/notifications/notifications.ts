import * as Notifications from 'expo-notifications';

export async function requestNotificationPermission() {
  const settings = await Notifications.getPermissionsAsync();
  if (!settings.granted) {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleDailyReminder(hour = 8) {
  await Notifications.scheduleNotificationAsync({
    content: { title: 'Study reminder', body: 'You have cards due.' },
    trigger: { 
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour, 
      minute: 0, 
      repeats: true 
    }
  });
}

export async function clearStudyNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

interface DueBucket { time: number; count: number }

export async function scheduleDueBuckets(buckets: DueBucket[]) {
  // Limit to first 5 buckets to avoid spam
  const now = Date.now();
  for (const b of buckets.slice(0,5)) {
    if (b.time <= now) continue;
    const date = new Date(b.time);
    await Notifications.scheduleNotificationAsync({
      content: { title: 'Cards Due', body: `${b.count} cards ready to review` },
      trigger: { 
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date 
      }
    });
  }
}
