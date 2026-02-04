import { Text, View } from 'react-native';
import { ScaledSheet } from 'react-native-size-matters';
import AuthHeader from '../../components/AuthHeader';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <AuthHeader title="Profile" />
            <View style={styles.content}>
                <Text>Profile Screen Coming Soon</Text>
            </View>
        </View>
    );
}

const styles = ScaledSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        paddingTop: '40@vs',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
