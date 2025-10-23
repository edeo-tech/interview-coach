import { View, Text, StyleSheet } from 'react-native';
import ColorsLight from '@/constants/ColorsLight';
import { TYPOGRAPHY } from '@/constants/Typography';

export default function PayScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pay</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ColorsLight.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    ...TYPOGRAPHY.heading1,
    color: ColorsLight.text.primary,
  },
});
