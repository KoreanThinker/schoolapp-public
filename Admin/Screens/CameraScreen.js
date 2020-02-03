import React, { Component } from 'react';
import { Text, View, TouchableOpacity, Dimensions, Alert, TouchableWithoutFeedback, ActivityIndicator, Linking, Platform, ToastAndroid, Image } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';
import * as Permissions from 'expo-permissions';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Camera } from 'expo-camera';
import { Colors } from '../Components/Asset'
import LightOn from '../Icons/cameraLightOn.svg';
import LightOff from '../Icons/cameraLightOff.svg';
import SnapIcon from '../Icons/cameraSnap.svg';
import TurnIcon from '../Icons/cameraTurn.svg';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const STATUSBARHEIGHT = getStatusBarHeight();

export default class CameraScreen extends Component {
    static navigationOptions = { title: '카메라' };


    constructor(props) {
        super(props);
        this.state = {
            hasCameraPermission: null,
            type: Camera.Constants.Type.back,
            lightOn: false,
            isFirst: true,
        };
    }


    async componentDidMount() {
        Permissions.getAsync(Permissions.CAMERA).then(response => {
            if (response.status !== 'granted') {
                Permissions.askAsync(Permissions.CAMERA).then(response2 => {
                    this.setState({ hasCameraPermission: response2.status === 'granted' });
                });
            } else if (response.status === 'granted') {
                this.setState({ hasCameraPermission: true })
            }
        })

    }
    _snap = async () => {
        if (this.state.isFirst) {
            this.setState({ isFirst: false });
            const photo = await this.camera.takePictureAsync();
            this.props.navigation.state.params.changePhoto(photo.uri, 1);
            this.props.navigation.goBack();
        }

    }
    _light = () => {
        if (this.state.isFirst) {
            this.setState({
                lightOn: !this.state.lightOn
            })
        }
    }
    _turn = () => {
        if (this.state.isFirst) {
            this.setState({
                type:
                    this.state.type === Camera.Constants.Type.back
                        ? Camera.Constants.Type.front
                        : Camera.Constants.Type.back,
            });
        }
    }



    render() {
        const { hasCameraPermission } = this.state;
        if (hasCameraPermission === null) {
            return <View />;
        } else if (!hasCameraPermission) {
            return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TouchableOpacity onPress={() => {
                    if (Platform.OS === 'ios') {
                        Alert.alert(
                            '권한',
                            '사진 > 카메라 활성화',
                            [
                                { text: 'OK', onPress: () => Linking.openURL('app-settings:') },
                                {
                                    text: '취소',
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    } else {
                        Alert.alert(
                            '권한',
                            '스크랩 > 권한 > 카메라 활성화',
                            [
                                { text: 'OK', onPress: () => IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS) },
                                {
                                    text: '취소',
                                    style: 'cancel',
                                },
                            ],
                            { cancelable: false },
                        );
                    }
                }}>
                    <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>카메라 권한 설정하기</Text>
                </TouchableOpacity>
            </View>;
        } else {
            return (
                <View style={{ flex: 1 }}>
                    <Camera autoFocus style={{ width: WIDTH, height: WIDTH }} type={this.state.type} ref={ref => { this.camera = ref; }} ratio='1:1' flashMode={this.state.lightOn ? 'on' : 'off'}>
                    </Camera>
                    {/* {!this.state.isFirst && Platform.OS == 'android' &&
                        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: WIDTH, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
                            <ActivityIndicator size="large" color="#888" />
                        </View>} */}

                    <View style={{ width: WIDTH, height: HEIGHT - WIDTH - 50 - STATUSBARHEIGHT, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 72 }}>
                        <TouchableOpacity onPress={this._turn}>
                            <TurnIcon />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this._snap}>

                            {!this.state.isFirst ? <ActivityIndicator size="large" color="#888" /> : <SnapIcon />}

                        </TouchableOpacity>
                        <TouchableWithoutFeedback onPress={this._light}>
                            {this.state.lightOn ? <LightOn /> : <LightOff />}
                        </TouchableWithoutFeedback>
                    </View>
                </View>
            );
        }
    }
}