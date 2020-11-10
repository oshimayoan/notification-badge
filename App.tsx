import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function App() {
  let [counter, setCounter] = useState(0)

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });

  useEffect(() => {
    Notifications.setBadgeCountAsync(counter).then(() => console.log('>>set badge done'));
  }, [counter])

  let increase = () => setCounter(counter + 1);

  let showNotif = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "Counter",
        body: "You should expect the badge to increase",
      },
      trigger: {
        seconds: 1,
      }
    }).catch((e) => console.error('>>notifications', e));
  }

  return (
    <View style={styles.container}>
      <Text>Counter: {counter}</Text>
      <Button title="Increase counter" onPress={increase} />
      <Button title="Show Notification" onPress={showNotif} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
