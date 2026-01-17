import { CameraView, useCameraPermissions } from 'expo-camera';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, Text, useTheme } from 'react-native-paper';

interface Props {
    visible: boolean;
    onClose: () => void;
    onScan: (data: string) => void;
}

export const BarcodeScannerModal = ({ visible, onClose, onScan }: Props) => {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const theme = useTheme();

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        setScanned(true);
        onScan(data);
        onClose();
        setTimeout(() => setScanned(false), 1000);
    };

    if (!permission) return null;

    if (!permission.granted) {
        return (
            <Portal>
                <Modal visible={visible} onDismiss={onClose} contentContainerStyle={[styles.errorModal, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Text variant="titleMedium" style={{ marginBottom: 12, textAlign: 'center', fontWeight: 'bold' }}>Camera Permission Required</Text>
                    <Text variant="bodyMedium" style={{ marginBottom: 24, textAlign: 'center', color: theme.colors.onSurfaceVariant }}>We need your permission to show the camera for scanning barcodes.</Text>
                    <Button mode="contained" onPress={requestPermission} style={{ borderRadius: 12, width: '100%' }} contentStyle={{ height: 48 }}>Grant Permission</Button>
                    <Button onPress={onClose} style={{ marginTop: 8 }}>Close</Button>
                </Modal>
            </Portal>
        );
    }

    return (
        <Portal>
            <Modal visible={visible} onDismiss={onClose} contentContainerStyle={styles.container}>
                <View style={styles.scannerWrapper}>
                    <CameraView
                        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        barcodeScannerSettings={{
                            barcodeTypes: ['qr', 'ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e'],
                        }}
                        style={StyleSheet.absoluteFillObject}
                    />
                    <View style={styles.overlay}>
                        <View style={styles.unfocusedContainer}></View>
                        <View style={styles.middleContainer}>
                            <View style={styles.unfocusedContainer}></View>
                            <View style={[styles.focusedContainer, { borderColor: theme.colors.primary }]}></View>
                            <View style={styles.unfocusedContainer}></View>
                        </View>
                        <View style={styles.unfocusedContainer}></View>
                    </View>

                    <View style={styles.topActions}>
                        <Text variant="titleLarge" style={styles.scanText}>Scan Barcode</Text>
                    </View>

                    <Button
                        mode="contained"
                        onPress={onClose}
                        style={[styles.closeButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                        labelStyle={{ color: '#fff' }}
                    >
                        Cancel
                    </Button>
                </View>
            </Modal>
        </Portal>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'black',
        padding: 0,
        margin: 0,
        flex: 1,
    },
    scannerWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    errorModal: {
        padding: 24,
        margin: 24,
        alignItems: 'center',
    },
    topActions: {
        position: 'absolute',
        top: 60,
        width: '100%',
        alignItems: 'center',
    },
    scanText: {
        color: '#fff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
    closeButton: {
        position: 'absolute',
        bottom: 60,
        alignSelf: 'center',
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    overlay: {
        flex: 1,
    },
    unfocusedContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    middleContainer: {
        flexDirection: 'row',
        height: 250,
    },
    focusedContainer: {
        flex: 4,
        borderWidth: 2,
        borderRadius: 24,
    },
});
