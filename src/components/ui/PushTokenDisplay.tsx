import { usePushNotifications } from '@/src/hooks/usePushNotifications';
import { Clipboard01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Clipboard from 'expo-clipboard';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export function PushTokenDisplay() {
    const { expoPushToken } = usePushNotifications();
    const theme = useTheme();

    const copyToClipboard = async () => {
        if (expoPushToken) {
            await Clipboard.setStringAsync(expoPushToken);
            Toast.show({
                type: 'success',
                text1: 'Token Copied!',
                text2: 'Expo Push Token copied to clipboard',
            });
        }
    };

    if (!expoPushToken) {
        return null;
    }

    return (
        <Card style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
            <Card.Content>
                <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
                    Expo Push Token
                </Text>
                <Text
                    variant="bodySmall"
                    style={{
                        color: theme.colors.onSurface,
                        fontFamily: 'monospace',
                        marginBottom: 12
                    }}
                    numberOfLines={2}
                    ellipsizeMode="middle"
                >
                    {expoPushToken}
                </Text>
                <Button
                    mode="contained-tonal"
                    onPress={copyToClipboard}
                    icon={() => <HugeiconsIcon icon={Clipboard01Icon} size={18} color={theme.colors.primary} />}
                    style={{ alignSelf: 'flex-start' }}
                >
                    Copy Token
                </Button>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 8,
    },
});
