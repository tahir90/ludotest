import { COLORS } from "$constants/colors";
import { DEVICE_HEIGHT, DEVICE_WIDTH } from "$constants/dimensions";
import { StyleSheet } from "react-native";
import { RFValue } from 'react-native-responsive-fontsize';

export const styles = StyleSheet.create({
    img : {
        width : '100%',
        height : '100%',
        resizeMode : 'contain'
    },
    imgContainer : {
        width : DEVICE_WIDTH * 0.6,
        height : DEVICE_HEIGHT * 0.2,
        alignItems : 'center',
        justifyContent : 'center',
        alignSelf : 'center',
        marginVertical : 40,
    },
    labelStyle : {
        position : 'absolute',
        bottom : 40,
        color : COLORS.white,
        fontWeight : '800',
        opacity : 0.5,
        fontStyle : 'italic'
    },
    witchContainer : {
        position : 'absolute',
        top : '70%',
        left : '24%',
        zIndex: 1,
    },
    witch : {
        height : 250,
        width : 250,
        transform : [{rotate:'25deg'}]
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        paddingBottom: 100,
    },
    quickActionsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginHorizontal: 15,
        marginBottom: 15,
    },
    gameModesContainer: {
        marginHorizontal: 15,
        marginBottom: 20,
    },
    gameModesRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    numberIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    emojiIconWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    gameModeNumber: {
        fontSize: RFValue(40),
        color: COLORS.white,
        fontFamily: 'Philosopher-Bold',
        fontWeight: 'bold',
        textAlign: 'center',
        textAlignVertical: 'center',
        includeFontPadding: false,
        lineHeight: RFValue(40),
    },
    gameModeIcon: {
        fontSize: RFValue(35),
        textAlign: 'center',
        textAlignVertical: 'center',
    },
    legacyButtons: {
        alignItems: 'center',
        marginVertical: 20,
    },
    activityButtons: {
        position: 'absolute',
        right: 10,
        top: 200,
        alignItems: 'center',
    },
    activityButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.cardBackground + 'CC',
        borderWidth: 2,
        borderColor: COLORS.goldBorder + '60',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        position: 'relative',
    },
    activityIcon: {
        fontSize: RFValue(24),
    },
    activityBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: COLORS.error,
        borderRadius: 10,
        minWidth: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.white,
    },
    activityBadgeText: {
        color: COLORS.white,
        fontSize: RFValue(10),
        fontFamily: 'Philosopher-Bold',
        fontWeight: 'bold',
    },
});