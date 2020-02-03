import React, { Component } from 'react'
import { Text, View, ScrollView, TouchableOpacity, Dimensions, Switch, Alert, ToastAndroid, Platform, TouchableWithoutFeedback, Linking } from 'react-native'
import { Colors } from '../Components/Asset';

const WIDTH = Dimensions.get('window').width;

const useUrl = 'https://docs.google.com/document/d/e/2PACX-1vSwzc62feLtZqODsW8GeOUnjpTBMNgXCe4nH0n4_oRQ7T6zAJ6rB-Ey1-VkxWxrZCNoUhTIAZ08qzxI/pub';
const privacyUrl = 'https://docs.google.com/document/u/1/d/e/2PACX-1vSzaYKB8mnL02RJ3Pd5Z-EIUUAyIew90SBoYvTyVR-jLy0UKPGQLw2ybWoAiUPOx8zvFGhxtwnUrCLC/pub';

export default class PolicyScreen extends Component {
    static navigationOptions = {
        title: '약관/정책',
    };

    constructor(props) {
        super(props);
        this.state = {
            agree1: false,
            agree2: false,
        }
    }
    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
    }
    render() {
        return (
            <ScrollView>
                <View>
                    <View style={{ width: WIDTH }}>
                        <View style={{ width: WIDTH, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 20, borderBottomColor: '#dbdbdb', borderRadius: 0.5, marginLeft: 20, }}>이용약관</Text>
                            <TouchableWithoutFeedback onPress={() => Linking.openURL(useUrl)}>
                                <Text style={{ fontSize: 14, color: '#888', textDecorationLine: 'underline', marginLeft: 10, marginRight: 20 }}>자세히보기</Text>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ width: WIDTH - 40, height: 50, alignSelf: 'center', borderColor: '#dbdbdb', borderTopWidth: 0.5, borderBottomWidth: 0.5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Text style={{ fontSize: 14 }}>동의</Text>
                                <Switch style={{ marginLeft: 10 }} value={this.state.agree1} onValueChange={value => this.setState({ agree1: value })} />
                            </View>
                        </View>
                    </View>
                    <View style={{ width: WIDTH }}>
                        <View style={{ width: WIDTH, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 20, borderBottomColor: '#dbdbdb', borderRadius: 0.5, marginLeft: 20 }}>개인정보처리방침</Text>
                            <TouchableWithoutFeedback onPress={() => Linking.openURL(privacyUrl)}>
                                <Text style={{ fontSize: 14, color: '#888', textDecorationLine: 'underline', marginLeft: 10, marginRight: 20 }}>자세히보기</Text>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ width: WIDTH - 40, height: 50, alignSelf: 'center', borderColor: '#dbdbdb', borderTopWidth: 0.5, borderBottomWidth: 0.5 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                <Text style={{ fontSize: 14 }}>동의</Text>
                                <Switch style={{ marginLeft: 10 }} value={this.state.agree2} onValueChange={value => this.setState({ agree2: value })} />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity style={{ alignSelf: 'center', height: 50, justifyContent: 'center' }} onPress={() => {
                        if (!this.state.agree1 || !this.state.agree2) {
                            this._showMessage('동의가 필요합니다');
                            return;
                        }
                        if (this.props.navigation.state.params.type === 'normal') {
                            this.props.navigation.navigate('SignUp', { token: this.props.navigation.state.params.token });
                        } else if (this.props.navigation.state.params.type === 'facebook') {
                            this.props.navigation.navigate('SignUpFacebook', { userid: this.props.navigation.state.params.userid, password: this.props.navigation.state.params.password, token: this.props.navigation.state.params.token });
                        }
                    }}>
                        <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>다음</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView >
        )
    }
}
