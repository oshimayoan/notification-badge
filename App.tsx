import { StatusBar } from 'expo-status-bar';
import React, {useState, useEffect} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

TaskManager.defineTask('counterBadge', ({data, error}) => {
  if (error) {
    console.error('>> error defining task', error);
    return;
  }
  console.log('>> running task');
  (async () => {
    let notifCount = (await Notifications.getPresentedNotificationsAsync()).length;
    console.log('>> counting available notif', notifCount);
    Notifications.setBadgeCountAsync(notifCount).then(() => console.log('>>set badge done'));
    // Notifications.scheduleNotificationAsync({
      // content: {
        // title: "Counter",
        // body: "You should expect the badge to increase",
      // },
      // trigger: {
        // seconds: 1,
      // }
    // }).catch((e) => console.error('>>notifications', e));
  })();
});

function registerTask() {
  console.log('>> start to get background task status');
  BackgroundFetch.getStatusAsync().then((status) => {
    console.log('>>getting background task status');
    switch (status) {
      case BackgroundFetch.Status.Restricted:
      case BackgroundFetch.Status.Denied:
        console.log('>> background task is', status);
        return;
      default:
        console.log('>> background task is AVAILABLE');
        break;
    }

    console.log('>> registering task');
    BackgroundFetch.registerTaskAsync('counterBadge', {
      minimumInterval: 5,
      stopOnTerminate: false,
    })
      .then(() => console.log('>> task registered'))
      .catch(e => console.error('>> failed to register task', e));
  }).catch(e => console.error('>>error getting background task status', e));
}

export default function App() {
  let [counter, setCounter] = useState(0)
  let [token, setToken] = useState('')

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: true,
    }),
  });

  useEffect(() => {
    console.log('>> registering');
    registerTask();
    console.log('>> registering push notif token');
    registerForPushNotifications().then(setToken);
  }, []);

  useEffect(() => {
    let listener = Notifications.addNotificationReceivedListener(_notification => {
      console.log('>> new push notif received while on foreground');
      let newCounter = counter + 1;
      console.log('>> change badge counter to', newCounter);
      Notifications.setBadgeCountAsync(newCounter);
      setCounter(newCounter);
    });
    return () => listener.remove();
  }, []);

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

  let registerForPushNotifications = async () => {
    let token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('>> push notif token is', token);
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
    return token;
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
