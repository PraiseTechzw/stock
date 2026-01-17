import { useCustomers } from '@/src/hooks/useCustomers';
import { useProducts } from '@/src/hooks/useProducts';
import { useSales } from '@/src/hooks/useSales';
import {
    Alert02Icon,
    CheckmarkCircle02Icon,
    CreditCardIcon,
    Invoice01Icon,
    PackageIcon,
    PrinterIcon,
    Share01Icon,
    UserEdit01Icon,
    Wallet01Icon
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';
import * as Print from 'expo-print';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Dialog, IconButton, List, Portal, RadioButton, Surface, Text, TextInput, Title, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

export default function OrderDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { orders, getOrderItems, getPaymentsForOrder, addPayment } = useSales();
    const { customers } = useCustomers();
    const { products } = useProducts();
    const theme = useTheme();

    const order = orders.find(o => o.id === parseInt(id));
    const { data: items } = getOrderItems(parseInt(id));
    const { data: paymentsHistory } = getPaymentsForOrder(parseInt(id));
    const customer = customers.find(c => c.id === order?.customerId);

    const [paymentVisible, setPaymentVisible] = React.useState(false);
    const [paymentAmount, setPaymentAmount] = React.useState('');
    const [paymentMethod, setPaymentMethod] = React.useState('cash');

    const totalPaid = paymentsHistory?.reduce((sum, p) => sum + p.amount, 0) || 0;
    const balance = (order?.totalAmount || 0) - totalPaid;

    const handleAddPayment = async () => {
        if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
            Toast.show({
                type: 'error',
                text1: 'Invalid Amount',
                text2: 'Please enter a valid positive payment amount.',
                position: 'bottom',
                bottomOffset: 40,
            });
            return;
        }
        try {
            await addPayment(parseInt(id), parseFloat(paymentAmount), paymentMethod);

            Toast.show({
                type: 'success',
                text1: 'Payment Recorded',
                text2: `$${paymentAmount} payment added to Order #${id}`,
                position: 'bottom',
                bottomOffset: 40,
            });

            setPaymentVisible(false);
            setPaymentAmount('');
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Save Failed',
                text2: 'Could not record payment.',
                position: 'bottom',
                bottomOffset: 40,
            });
        }
    };

    const generateInvoiceHtml = () => {
        const itemRows = items?.map(item => {
            const product = products.find(p => p.id === item.productId);
            return `
        <tr>
          <td>${product?.name || 'Unknown'}</td>
          <td style="text-align: center;">${item.quantity}</td>
          <td style="text-align: right;">$${item.price.toFixed(2)}</td>
          <td style="text-align: right;">$${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
        }).join('');

        const paymentRows = paymentsHistory?.map(p => `
            <tr>
                <td style="color: #666; font-size: 0.9em;">Payment (${p.paymentMethod})</td>
                <td style="text-align: center;">1</td>
                <td style="text-align: right;">-$${p.amount.toFixed(2)}</td>
                <td style="text-align: right;">-$${p.amount.toFixed(2)}</td>
            </tr>
        `).join('');

        return `
      <html>
        <head>
          <style>
            body { font-family: 'Inter', sans-serif; color: #333; padding: 40px; }
            .header { border-bottom: 2px solid ${theme.colors.primary}; padding-bottom: 20px; margin-bottom: 40px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; text-transform: uppercase; font-size: 11px; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .totals { margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px; }
            .row { display: flex; justify-content: flex-end; gap: 40px; margin-bottom: 10px; }
            .label { color: #666; }
            .value { font-weight: bold; min-width: 100px; text-align: right; }
            .grand-total { font-size: 24px; color: ${theme.colors.primary}; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; text-transform: uppercase; margin-top: 10px; }
            .paid { background: #e8f5e9; color: #2e7d32; }
            .pending { background: #fff3e0; color: #ef6c00; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin:0; color: ${theme.colors.primary}; font-size: 32px;">INVOICE</h1>
            <p style="margin: 5px 0; color: #666;">Order #${order?.id} | ${new Date(order?.created_at || '').toLocaleDateString()}</p>
            <div class="status ${balance <= 0 ? 'paid' : 'pending'}">${balance <= 0 ? 'Fully Paid' : 'Payment Pending'}</div>
          </div>
          <div class="info">
            <div>
              <p style="text-transform: uppercase; font-size: 11px; color: #666; margin-bottom: 5px;">Billed To</p>
              <h3 style="margin:0;">${customer?.name || 'Walk-in Customer'}</h3>
              <p style="margin:5px 0;">${customer?.address || ''}</p>
              <p style="margin:5px 0;">${customer?.phone || ''}</p>
            </div>
            <div style="text-align: right;">
              <p style="text-transform: uppercase; font-size: 11px; color: #666; margin-bottom: 5px;">Payment Details</p>
              <p style="margin:5px 0;">Total Order: $${order?.totalAmount?.toFixed(2)}</p>
              <p style="margin:5px 0;">Total Paid: $${totalPaid.toFixed(2)}</p>
              <h3 style="margin:5px 0; color: ${balance <= 0 ? '#2e7d32' : '#d32f2f'};">Balance Due: $${balance.toFixed(2)}</h3>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${paymentRows}
            </tbody>
          </table>
          <div class="totals">
            <div class="row">
              <span class="label">Total Amount</span>
              <span class="value">$${order?.totalAmount?.toFixed(2)}</span>
            </div>
            <div class="row">
              <span class="label">Total Paid</span>
              <span class="value">-$${totalPaid.toFixed(2)}</span>
            </div>
            <div class="row grand-total">
              <span class="label" style="color:#333;">Balance Due</span>
              <span class="value">$${balance.toFixed(2)}</span>
            </div>
          </div>
        </body>
      </html>
    `;
    };

    const handlePrint = async () => {
        try {
            const html = generateInvoiceHtml();
            await Print.printAsync({ html });
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    const handleShare = async () => {
        try {
            const html = generateInvoiceHtml();
            const { uri } = await Print.printToFileAsync({ html });
            await Sharing.shareAsync(uri);
        } catch (error) {
            Alert.alert('Error', 'Failed to share PDF');
        }
    };

    if (!order) return (
        <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
            <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>Order not found</Text>
        </View>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <Stack.Screen options={{ title: 'Order Details' }} />
            <View style={styles.content}>

                <Surface style={[styles.statusBanner, {
                    backgroundColor: balance <= 0 ? theme.colors.primary : theme.colors.errorContainer,
                    borderColor: balance <= 0 ? theme.colors.primary : theme.colors.error
                }]} elevation={4}>
                    <View>
                        <Text variant="labelSmall" style={{ color: balance <= 0 ? 'rgba(255,255,255,0.7)' : theme.colors.error, fontWeight: '900' }}>
                            {balance <= 0 ? 'PAYMENT STATUS' : 'BALANCE DUE'}
                        </Text>
                        <Text variant="headlineMedium" style={{ color: balance <= 0 ? '#fff' : theme.colors.error, fontWeight: '900' }}>
                            {balance <= 0 ? 'FULLY PAID' : `$${balance.toFixed(2)}`}
                        </Text>
                    </View>
                    <HugeiconsIcon
                        icon={balance <= 0 ? CheckmarkCircle02Icon : Alert02Icon}
                        size={24}
                        color={balance <= 0 ? '#fff' : theme.colors.error}
                    />
                </Surface>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Title style={{ fontWeight: 'bold' }}>Customer</Title>
                            <IconButton
                                icon={() => <HugeiconsIcon icon={UserEdit01Icon} size={24} color={theme.colors.primary} />}
                                onPress={() => router.push(`/customers/${order.customerId}`)}
                            />
                        </View>
                        <View style={styles.customerBox}>
                            <Surface style={[styles.avatar, { backgroundColor: theme.colors.primaryContainer }]} elevation={0}>
                                <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 20 }}>
                                    {(customer?.name || 'W')[0]}
                                </Text>
                            </Surface>
                            <View>
                                <Text variant="titleLarge" style={{ fontWeight: 'bold' }}>{customer?.name || 'Walk-in Customer'}</Text>
                                {customer?.phone && <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{customer.phone}</Text>}
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Title style={{ fontWeight: 'bold' }}>Items (${order.totalAmount?.toFixed(2)})</Title>
                        </View>
                        {items?.map((item) => {
                            const product = products.find(p => p.id === item.productId);
                            return (
                                <List.Item
                                    key={item.id}
                                    title={product?.name}
                                    titleStyle={{ fontWeight: 'bold' }}
                                    description={`${item.quantity} x $${item.price.toFixed(2)}`}
                                    left={props => <List.Icon {...props} icon={() => <HugeiconsIcon icon={PackageIcon} size={24} color={theme.colors.primary} />} />}
                                    right={() => <Text variant="titleMedium" style={{ fontWeight: 'bold' }}>${(item.price * item.quantity).toFixed(2)}</Text>}
                                    style={{ paddingHorizontal: 0 }}
                                />
                            );
                        })}
                    </Card.Content>
                </Card>

                <Card style={[styles.card, { backgroundColor: theme.colors.surface, borderRadius: 24 }]}>
                    <Card.Content>
                        <View style={styles.cardHeader}>
                            <Title style={{ fontWeight: 'bold' }}>Payments</Title>
                            {balance > 0 && (
                                <Button
                                    mode="contained-tonal"
                                    onPress={() => setPaymentVisible(true)}
                                    style={{ borderRadius: 12 }}
                                    icon="plus"
                                >
                                    Add
                                </Button>
                            )}
                        </View>
                        {paymentsHistory?.map((p) => (
                            <List.Item
                                key={p.id}
                                title={`$${p.amount.toFixed(2)}`}
                                titleStyle={{ fontWeight: 'bold' }}
                                description={`${p.paymentMethod.replace('_', ' ')} | ${new Date(p.date || '').toLocaleDateString()}`}
                                left={(props) => {
                                    let icon = Wallet01Icon;
                                    if (p.paymentMethod === 'bank_transfer') icon = Invoice01Icon;
                                    if (p.paymentMethod === 'card') icon = CreditCardIcon;
                                    return <List.Icon {...props} icon={() => <HugeiconsIcon icon={icon} size={24} color={theme.colors.primary} />} />;
                                }}
                                style={{ paddingHorizontal: 0 }}
                            />
                        ))}
                        {paymentsHistory?.length === 0 && (
                            <View style={styles.emptyBox}>
                                <Text style={{ color: theme.colors.onSurfaceVariant }}>No payment history recorded</Text>
                            </View>
                        )}
                    </Card.Content>
                </Card>

                <View style={styles.actions}>
                    <Button
                        mode="contained"
                        onPress={handlePrint}
                        icon={() => <HugeiconsIcon icon={PrinterIcon} size={20} color="#fff" />}
                        style={styles.actionBtn}
                        contentStyle={{ height: 56 }}
                    >
                        Generate PDF
                    </Button>
                    <Button
                        mode="outlined"
                        onPress={handleShare}
                        icon={() => <HugeiconsIcon icon={Share01Icon} size={20} color={theme.colors.primary} />}
                        style={styles.actionBtn}
                        contentStyle={{ height: 56 }}
                    >
                        Share
                    </Button>
                </View>

                <Portal>
                    <Dialog
                        visible={paymentVisible}
                        onDismiss={() => setPaymentVisible(false)}
                        style={{ borderRadius: 28 }}
                    >
                        <Dialog.Title style={{ fontWeight: 'bold' }}>Record Payment</Dialog.Title>
                        <Dialog.Content>
                            <TextInput
                                label="Payment Amount"
                                mode="outlined"
                                value={paymentAmount}
                                onChangeText={setPaymentAmount}
                                keyboardType="numeric"
                                style={{ marginBottom: 20 }}
                                activeOutlineColor={theme.colors.primary}
                                left={<TextInput.Affix text="$" />}
                            />
                            <Text variant="labelLarge" style={{ marginBottom: 12, fontWeight: 'bold', color: theme.colors.onSurfaceVariant }}>METHOD</Text>
                            <RadioButton.Group onValueChange={value => setPaymentMethod(value)} value={paymentMethod}>
                                {['cash', 'bank_transfer', 'card'].map(m => (
                                    <List.Item
                                        key={m}
                                        title={m.replace('_', ' ').toUpperCase()}
                                        onPress={() => setPaymentMethod(m)}
                                        left={props => <RadioButton value={m} />}
                                        style={{ paddingVertical: 4 }}
                                    />
                                ))}
                            </RadioButton.Group>
                        </Dialog.Content>
                        <Dialog.Actions style={{ padding: 16 }}>
                            <Button onPress={() => setPaymentVisible(false)} style={{ marginRight: 8 }}>Cancel</Button>
                            <Button mode="contained" onPress={handleAddPayment} style={{ borderRadius: 12, paddingHorizontal: 24 }}>Save Payment</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBanner: {
        padding: 24,
        borderRadius: 28,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        borderWidth: 2,
    },
    card: {
        marginBottom: 20,
        elevation: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    customerBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyBox: {
        padding: 20,
        alignItems: 'center',
        opacity: 0.5,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 16,
    },
});
