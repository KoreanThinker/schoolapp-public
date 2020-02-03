import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, TextInput, ToastAndroid, BackHandler, Alert, ActivityIndicator, Platform, AsyncStorage, Linking } from 'react-native'
import { Notifications } from 'expo';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import * as Permissions from 'expo-permissions';
import * as Facebook from 'expo-facebook';
import { Colors } from '../Components/Asset';
import { StackActions, NavigationActions } from 'react-navigation';
import * as IntentLauncher from 'expo-intent-launcher';

import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'

const HEIGHT = 34;

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});

const facebookAppId = "462425434310174";

const login = gql`
query login($userid: String!, $password: String!) {
        login(userid: $userid, password: $password) {
            resultVal
            profile {
                userid
                name
                password
                grade
                class_
                number
            }
        }
    }
`
const updateProfile = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        notificationToken
    }
}
`

export default class SignInScreen extends Component {
    static navigationOptions = { header: null, gesturesEnabled: false, }

    constructor(props) {
        super(props);
        this.state = {
            id: '',
            pw: '',
            checking: false,
            isFacebook: false,
            token: ""
        }

    }
    async getToken() {
        if (!Constants.isDevice) {
            return;
        }
        let { status } = await Permissions.askAsync(
            Permissions.NOTIFICATIONS,
        );
        if (status !== 'granted') {
            this.setState({ token: '*' });
            return;
        }
        let value = await Notifications.getExpoPushTokenAsync();
        this.setState({ token: value });
    }
    componentDidMount() {
        this.getToken();
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }
    onBackButtonPressAndroid = () => {
        ToastAndroid.show('회원가입을 해주세요', ToastAndroid.LONG);
        return true;
    }
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }
    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
    }
    async _seccess(data) {
        if (this.state.token === "") {
            Alert.alert(
                '알림설정오류',
                '재접속해주세요',
                [
                    { text: '네' },
                    { text: '취소', style: 'cancel', },
                ],
                { cancelable: false },
            );
            this.setState({ checking: false });
            return;
        }
        const input = {
            userid: data.userid,
            notificationToken: this.state.token,
        }
        await this.updateProfile({ variables: { input: input } });
        await AsyncStorage.setItem('ID', data.userid);
        await AsyncStorage.setItem('NAME', data.name);
        await AsyncStorage.setItem('PASSWORD', data.password);
        await AsyncStorage.setItem('GRADE', JSON.stringify(data.grade));
        await AsyncStorage.setItem('CLASS', JSON.stringify(data.class_));
        await AsyncStorage.setItem('NUMBER', JSON.stringify(data.number));
        this.props.navigation.dispatch(resetAction);
    }
    async FacebookLogin() {
        if (this.state.checking) return;
        try {
            this.setState({ isFacebook: true });
            const {
                type,
                token,
                expires,
                permissions,
                declinedPermissions,
            } = await Facebook.logInWithReadPermissionsAsync(facebookAppId, {
                permissions: ['public_profile'],
            });
            this.setState({ checking: true });
            if (type === 'success') {
                const response = await fetch(`https://graph.facebook.com/me?access_token=${token}`);
                const { id, name } = await response.json();
                this.setState({ id: 'facebook' + id, pw: 'facebook' });
                this.refetchLogin().then(res => {
                    if (res.data.login.resultVal === 1 || res.data.login.resultVal === 2) {
                        this.setState({ checking: false, isFacebook: false });
                        this.props.navigation.navigate('Policy', { userid: 'facebook' + id, password: 'facebook', token: this.state.token, type: 'facebook' })
                        return;
                    } else {
                        this._seccess(res.data.login.profile);
                        return;
                    }
                })
            } else {
                this.setState({ checking: false });
            }
        } catch ({ message }) {
            Alert.alert(`오류`);
            this.setState({ checking: false });
            this.setState({ isFacebook: false });
        }
    }
    render() {
        return (
            <Query variables={{ userid: this.state.id, password: this.state.pw }} query={login} fetchPolicy='network-only'>
                {({ refetch: refetchLogin }) => {
                    if (this.refetchLogin === undefined) this.refetchLogin = refetchLogin;
                    return <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} start={[0, 0]} end={[1, 1]} >
                        <Mutation mutation={updateProfile} >
                            {(updateProfile) => {
                                if (this.updateProfile === undefined) this.updateProfile = updateProfile
                                return null;
                            }}
                        </Mutation>
                        <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 40, color: 'white', marginBottom: 60, fontWeight: 'bold' }}>로그인</Text>
                            <View style={{ width: 200 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', marginBottom: 20 }}>
                                    <Text style={{ fontSize: 20, color: 'white' }}>ID</Text>
                                    <TextInput autoCapitalize='none' maxLength={12} ref={ref => this.signInId = ref} editable={!this.state.checking} numberOfLines={1} value={this.state.id} onChangeText={(text) => this.setState({ id: text })} style={{ width: 160, borderBottomColor: 'white', borderBottomWidth: 1, fontSize: 14, color: 'white', lineHeight: 20 }} />
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center' }}>
                                    <Text style={{ fontSize: 20, color: 'white' }}>PW</Text>
                                    <TextInput autoCapitalize='none' maxLength={13} ref={ref => this.signInPw = ref} editable={!this.state.checking} secureTextEntry={true} numberOfLines={1} value={this.state.pw} onChangeText={(text) => this.setState({ pw: text })} style={{ width: 160, borderBottomColor: 'white', borderBottomWidth: 1, fontSize: 14, color: 'white', lineHeight: 20 }} />
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => {
                                if (this.state.checking) return;
                                if (this.state.id.length === 0) {
                                    this._showMessage("아이디를 입력해주세요");
                                    this.signInId.focus();
                                    return;
                                } else if (this.state.pw.length === 0) {
                                    this._showMessage("비밀번호를 입력해주세요");
                                    this.signInPw.focus();
                                    return;
                                }

                                this.setState({ checking: true });

                                refetchLogin().then(res => {
                                    if (res.data.login.resultVal === 1) {
                                        this._showMessage("존제하지 않는 아이디입니다");
                                        this.setState({ checking: false });
                                        return;
                                    } else if (res.data.login.resultVal === 2) {
                                        this._showMessage("비밀번호가 다릅니다");
                                        this.setState({ checking: false });
                                        return;
                                    } else {
                                        this._seccess(res.data.login.profile);
                                    }
                                })
                            }} style={{ marginVertical: 60 }} activeOpacity={0.4}>
                                <View style={{ width: 170, height: HEIGHT, borderRadius: HEIGHT / 2, borderColor: 'white', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    {this.state.checking ? <ActivityIndicator size='small' color='white' /> : <Text style={{ fontSize: 14, color: 'white' }}>로그인</Text>}
                                </View>
                            </TouchableOpacity>
                            {/* <TouchableOpacity onPress={() => {
                                if (this.state.checking) return;
                                this._showMessage("미개발")
                            }} activeOpacity={0.4}>
                                <View style={{ width: 220, height: HEIGHT, borderRadius: HEIGHT / 2, borderColor: 'white', borderWidth: 1, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: 'white' }}>카카오 로그인</Text>
                                </View>
                            </TouchableOpacity> */}
                            <TouchableOpacity onPress={() => this.FacebookLogin()} activeOpacity={0.4}>
                                <View style={{ width: 220, height: HEIGHT, borderRadius: HEIGHT / 2, borderColor: 'white', borderWidth: 1, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: 'white' }}>페이스북 로그인</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.4} onPress={() => {
                                if (this.state.checking) return;

                                this.props.navigation.navigate('Policy', { token: this.state.token, type: 'normal' });
                            }}>
                                <View style={{ width: 220, height: HEIGHT, borderRadius: HEIGHT / 2, borderColor: 'white', borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14, color: 'white' }}>간편 회원가입</Text>
                                </View>
                            </TouchableOpacity>

                        </View>
                    </LinearGradient>
                }}
            </Query>
        )
    }
}

const styles = StyleSheet.create({})
