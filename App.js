import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Google from 'expo-auth-session/providers/google';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function App() {
	const [userInfo, setUserInfo] = useState(null);

	const [request, response, promptAsync] = Google.useAuthRequest({
		androidClientId: '10422512860-1r7jnr6phsgannlnp9qperq2dituqe2p.apps.googleusercontent.com',
		iosClientId: '10422512860-fce5re3phlthc11u07k3r52euds920e6.apps.googleusercontent.com',
		webClientId: '10422512860-sckpdhcl2t2o8ldbtr6r7nm8vfgl0o5u.apps.googleusercontent.com',
	});

	useEffect(() => {
		handleSingInWithGoogle();
	}, [response]);

	const handleSingInWithGoogle = async () => {
		const user = await AsyncStorage.getItem('@user');

		if (!user) {
			if (response?.type === 'success') {
				await getUserInfo(response.authentication.accessToken);
			}
		}

		setUserInfo(JSON.parse(user));
	};

	const getUserInfo = async token => {
		if (!token) return;

		try {
			const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
				headers: { Authorization: `Bearer ${token}` },
			});
			const user = await res.json();
			await AsyncStorage.setItem('@user', JSON.stringify(user));
			setUserInfo(user);
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<View style={styles.container}>
			<Text>{JSON.stringify(userInfo, null, 2)}</Text>
			{userInfo ? <Text>Welcome back</Text> : <Text>Create your account</Text>}
			<Button title='Continue with Google' onPress={() => promptAsync()} />
			<StatusBar style='auto' />
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
