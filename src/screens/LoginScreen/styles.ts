import { StyleSheet } from 'react-native';
import { COLORS } from '$constants/colors';
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '$constants/dimensions';
import { RFValue } from 'react-native-responsive-fontsize';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: DEVICE_WIDTH * 0.5,
    height: DEVICE_HEIGHT * 0.15,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: RFValue(28),
    fontFamily: 'Philosopher-Bold',
    color: COLORS.white,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: RFValue(16),
    color: COLORS.lightText,
    textAlign: 'center',
    opacity: 0.8,
  },
  buttonsContainer: {
    width: '100%',
    maxWidth: 400,
  },
  primaryButton: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: COLORS.goldBorder,
    marginBottom: 20,
    shadowColor: COLORS.gold,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 8,
  },
  gradientButton: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: RFValue(18),
    fontFamily: 'Philosopher-Bold',
    color: COLORS.white,
    textAlign: 'center',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.lightGrey,
    opacity: 0.3,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: RFValue(14),
    color: COLORS.lightText,
    opacity: 0.6,
    fontFamily: 'Philosopher-Bold',
  },
  socialButtonsContainer: {
    width: '100%',
  },
  socialButtonWrapper: {
    marginBottom: 15,
  },
  socialButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.lightGrey + '40',
    overflow: 'hidden',
    shadowColor: COLORS.black,
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  socialGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    fontSize: RFValue(16),
    fontFamily: 'Philosopher-Bold',
    color: COLORS.darkText,
    textAlign: 'center',
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: RFValue(14),
    color: COLORS.lightText,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: RFValue(12),
    color: COLORS.lightText,
    opacity: 0.6,
    textAlign: 'center',
  },
});


