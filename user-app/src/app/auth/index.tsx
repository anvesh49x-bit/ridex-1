import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

const GREEN = '#0A9F4A';
const DARK = '#101820';
const MUTED = '#667085';
const BORDER = '#DDE2E7';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 45;

export default function AuthScreen() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const otpRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedPhone = phone.replace(/\D/g, '').slice(0, 10);

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    // Optional: if they change the phone number, we could reset the OTP state
    if (isOtpSent) {
      setIsOtpSent(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(0);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const digits = value.replace(/\D/g, '');

    // Support pasting the complete OTP
    if (digits.length > 1) {
      const pasted = digits.slice(0, OTP_LENGTH).split('');
      const nextOtp = Array(OTP_LENGTH).fill('');

      pasted.forEach((digit, i) => {
        nextOtp[i] = digit;
      });

      setOtp(nextOtp);

      const nextIndex = Math.min(pasted.length, OTP_LENGTH - 1);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const nextOtp = [...otp];
    nextOtp[index] = digits;
    setOtp(nextOtp);

    if (digits && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOtp = () => {
    if (formattedPhone.length !== 10) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    
    // Simulate sending OTP
    setIsOtpSent(true);
    setSecondsLeft(RESEND_SECONDS);
    
    // Auto-focus first OTP input slightly after render
    setTimeout(() => {
      otpRefs.current[0]?.focus();
    }, 100);
  };

  const handleResend = () => {
    if (secondsLeft > 0) return;

    setSecondsLeft(RESEND_SECONDS);
    setOtp(Array(OTP_LENGTH).fill(''));
    otpRefs.current[0]?.focus();
  };

  const handleVerify = () => {
    const completeOtp = otp.join('');

    if (completeOtp.length !== OTP_LENGTH) {
      Alert.alert('Incomplete OTP', 'Please enter the complete 6-digit OTP.');
      return;
    }

    Alert.alert(
      'RIDEX',
      'The authentication UI is ready. Supabase OTP verification will be connected next.'
    );
  };

  const resendLabel =
    secondsLeft > 0 ? `00:${String(secondsLeft).padStart(2, '0')}` : 'Resend OTP';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.brandText}>
            RID<Text style={styles.brandGreen}>EX</Text>
          </Text>
          <Text style={styles.heroTitle}>Your ride,</Text>
          <Text style={styles.heroTitleGreen}>your way</Text>
          <Text style={styles.heroSubtitle}>
            Affordable rides, trusted drivers,{'\n'}anytime anywhere.
          </Text>
        </View>

        {/* Inputs Section */}
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Enter mobile number</Text>
            <View style={styles.phoneContainer}>
              <View style={styles.countryCodeContainer}>
                <Text style={styles.flagIcon}>🇮🇳</Text>
                <Text style={styles.countryCode}>+91</Text>
              </View>
              <View style={styles.divider} />
              <TextInput
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                placeholder="00000 00000"
                placeholderTextColor={MUTED}
                maxLength={10}
                style={styles.phoneInput}
                selectionColor={GREEN}
              />
            </View>
          </View>

          {isOtpSent && (
            <View style={styles.inputGroup}>
              <View style={styles.otpHeader}>
                <Text style={styles.label}>Enter OTP</Text>
                <Pressable onPress={handleResend} disabled={secondsLeft > 0}>
                  <Text
                    style={[
                      styles.resendText,
                      secondsLeft > 0 && styles.resendTextDisabled,
                    ]}
                  >
                    {resendLabel}
                  </Text>
                </Pressable>
              </View>
              <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => {
                      otpRefs.current[index] = ref;
                    }}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={({ nativeEvent }) =>
                      handleOtpKeyPress(nativeEvent.key, index)
                    }
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[
                      styles.otpBox,
                      digit ? styles.otpBoxFilled : null,
                      index === 0 && !digit ? styles.otpBoxFocused : null,
                    ]}
                    selectionColor={GREEN}
                  />
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          {!isOtpSent ? (
            <Pressable
              onPress={handleSendOtp}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Send OTP</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={handleVerify}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            </Pressable>
          )}

          <View style={styles.legalContainer}>
            <Text style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  brandText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: DARK,
    marginBottom: 24,
  },
  brandGreen: {
    color: GREEN,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: DARK,
    letterSpacing: -1,
    lineHeight: 40,
  },
  heroTitleGreen: {
    fontSize: 36,
    fontWeight: '700',
    color: GREEN,
    letterSpacing: -1,
    lineHeight: 40,
  },
  heroSubtitle: {
    marginTop: 12,
    fontSize: 16,
    color: MUTED,
    lineHeight: 24,
    fontWeight: '400',
  },
  content: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
    marginBottom: 12,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FAFAFA',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '500',
    color: DARK,
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: BORDER,
    marginHorizontal: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: DARK,
    height: '100%',
  },
  otpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
  },
  resendTextDisabled: {
    color: MUTED,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 48,
    height: 56,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    fontSize: 20,
    fontWeight: '600',
    color: DARK,
    textAlign: 'center',
    backgroundColor: '#FAFAFA',
  },
  otpBoxFilled: {
    borderColor: GREEN,
    backgroundColor: '#F0F9F5',
    color: GREEN,
  },
  otpBoxFocused: {
    borderColor: DARK,
  },
  footer: {
    marginTop: 'auto',
  },
  primaryButton: {
    height: 56,
    backgroundColor: DARK,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonPressed: {
    opacity: 0.85,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  legalContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
  },
  legalText: {
    fontSize: 12,
    color: MUTED,
    textAlign: 'center',
    lineHeight: 18,
  },
  legalLink: {
    color: DARK,
    fontWeight: '500',
  },
});