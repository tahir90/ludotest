import { ImageBackground, StyleSheet, SafeAreaView, View } from 'react-native'
import React from 'react'
import { IMAGES } from '$assets/images'
import { DEVICE_HEIGHT, DEVICE_WIDTH } from '$constants/dimensions'
import { COLORS } from '$constants/colors'
import LinearGradient from 'react-native-linear-gradient'

const Wrapper: React.FC<{ children: any, style?: any }> = ({ children, style }) => {
    return (
        <ImageBackground
            source={IMAGES.Background}
            resizeMode={'cover'}
            style={StyleSheet.absoluteFillObject}
        >
            <LinearGradient
                colors={[COLORS.darkPurpleBg + 'DD', COLORS.purpleGradientStart + 'CC', COLORS.deepPurple + 'DD']}
                style={StyleSheet.absoluteFillObject}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            />
            <SafeAreaView style={[styles.container, { ...style }]}>
                {children}
            </SafeAreaView>
        </ImageBackground>
    )
}

export default Wrapper

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    safeArea : {
        width : DEVICE_WIDTH,
        height : DEVICE_HEIGHT
    }
})