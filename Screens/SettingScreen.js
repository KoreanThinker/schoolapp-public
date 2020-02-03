import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, Text, TouchableWithoutFeedback, Linking, Platform, AsyncStorage, ActivityIndicator, ToastAndroid, Alert, Clipboard } from 'react-native'
import { BaseButton } from 'react-native-gesture-handler';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../Components/Asset'
import * as IntentLauncher from 'expo-intent-launcher';
import { StackActions, NavigationActions } from 'react-navigation';
import AppData from '../app.json';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'

const resetAction2 = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
});
const AdminRoute = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'A_Bottom' })],
});

const facebookUrl = 'https://mobile.facebook.com/%EB%B3%B4%EC%A0%95%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90-%EB%8F%99%EC%95%84%EB%A6%AC-%EC%8A%A4%ED%81%AC%EB%9E%A9-SchoolApp-2075994872508564/?_rdc=1&_rdr&refsrc=https%3A%2F%2Fm.facebook.com%2F%25EB%25B3%25B4%25EC%25A0%2595%25EA%25B3%25A0%25EB%2593%25B1%25ED%2595%2599%25EA%25B5%2590-%25EB%258F%2599%25EC%2595%2584%25EB%25A6%25AC-%25EC%258A%25A4%25ED%2581%25AC%25EB%259E%25A9-SchoolApp-2075994872508564%2F'
const privatePolicy = 'https://docs.google.com/document/d/e/2PACX-1vSzaYKB8mnL02RJ3Pd5Z-EIUUAyIew90SBoYvTyVR-jLy0UKPGQLw2ybWoAiUPOx8zvFGhxtwnUrCLC/pub';
const servicePolicy = 'https://docs.google.com/document/d/e/2PACX-1vSwzc62feLtZqODsW8GeOUnjpTBMNgXCe4nH0n4_oRQ7T6zAJ6rB-Ey1-VkxWxrZCNoUhTIAZ08qzxI/pub';
const policy = 'https://docs.google.com/document/d/e/2PACX-1vRZraLbKYCBYQ8rmQS_UgCatv2ER3uSvqVae256dHcewrt79gIh01qoYYwWigZoEvqWOfcHVGZxlQOA/pub';
const openSource = 'https://docs.google.com/document/d/e/2PACX-1vSl3G8lY65bjcJNHiw-z7wGsv5ZgkNunJAplPOzUDsU4woRAF1VmzkU1kJw1VaYjafT7QURO8e3D1PG/pub';

const getVersion = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        value
    }
}
`
const getProfile = gql`
query getProfile($userid: String!) {
    getProfile(userid: $userid) {
        isAlertOn
    }
}
`

const updateProfile = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        isAlertOn
    }
}
`
const checkAdminid = gql`
query checkAdminid($adminid: String!){
    checkAdminid(adminid: $adminid)
}
`

export default class SettingScreen extends Component {
    static navigationOptions = { title: '설정' };

    constructor(props) {
        super(props);
        this.state = {
            isDdayOn: false,
            isLowDataOn: false,
            isAlertOn: null,
            isScrollOn: false,
            loading: false,
            isHasId: true,
            isAdmin: false,
            userid: null,
        }
    }

    componentDidMount() {
        this._settingInitalize();
    }

    _settingInitalize = async () => {
        try {
            let lowData = await AsyncStorage.getItem('ISLOWDATA');
            let alert = await AsyncStorage.getItem('ISALERT');
            let id = await AsyncStorage.getItem('ID');
            if (id === null) this.setState({ isHasId: false });
            lowData = lowData === null ? false : lowData === 'true' ? true : false;
            alert = alert === null ? true : alert === 'true' ? true : false;

            this.setState({ isLowDataOn: lowData, loading: true, userid: id })
        } catch (error) {
        }
    }

    _dataHandle = async () => {
        const b = this.state.isLowDataOn;
        this.setState({ isLowDataOn: !this.state.isLowDataOn });
        await AsyncStorage.setItem('ISLOWDATA', !b ? 'true' : 'false');
        this.props.navigation.state.params.lowData(!b);

    }
    _alertHandle = async () => {
        const b = this.state.isAlertOn;
        this.setState({ isAlertOn: !this.state.isAlertOn });
        await AsyncStorage.setItem('ISALERT', !b ? 'true' : 'false');
        const input = {
            userid: this.state.userid,
            isAlertOn: !b
        }
        this.updateAlert({ variables: { input: input } });
    }
    _logOutHandle = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                { text: '네', onPress: () => this._logOutProcess() },
            ],
            { cancelable: false },
        );
    }

    async _logOutProcess() {

        await AsyncStorage.removeItem('ID');
        await AsyncStorage.removeItem('NAME');
        await AsyncStorage.removeItem('PASSWORD');
        this.setState({ isHasId: false });
        this.props.navigation.dispatch(resetAction2);
    }

    _version = (value) => {
        const url = Platform.OS === 'android' ? AppData.expo.android.playStoreUrl : AppData.expo.ios.appStoreUrl;
        let onlineVersion = value.substring(
            0,
            value.lastIndexOf(".")
        );
        let myVersion = AppData.expo.version.substring(
            0,
            AppData.expo.version.lastIndexOf(".")
        );
        if (onlineVersion === myVersion) {
            Alert.alert(
                `버전 ${AppData.expo.version}`,
                `최신버전입니다`,
                [
                    {
                        text: '취소',
                        style: 'cancel',
                    },
                    { text: '네' },
                ],
                { cancelable: false },
            );
        } else {
            Alert.alert(
                `버전 ${AppData.expo.version}`,
                `업데이트가 필요합니다`,
                [
                    {
                        text: '취소',
                        style: 'cancel',
                    },
                    { text: '네', onPress: () => Linking.openURL(url) },
                ],
                { cancelable: false },
            );
        }
    }
    render() {
        return (
            !this.state.loading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>
                :
                <View style={{ flex: 1 }}>
                    <Mutation mutation={updateProfile} >
                        {(updateProfile) => {
                            if (this.updateAlert === undefined) this.updateAlert = updateProfile;
                            return null;
                        }}
                    </Mutation>
                    <ScrollView style={{ flex: 1 }} >
                        <View style={{ marginTop: 15, paddingLeft: 20, height: 20, width: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#888', marginBottom: 5 }}>기능</Text>
                        </View>
                        <Toggle title='데이터 절약모드' state={this.state.isLowDataOn} onToggle={this._dataHandle} loading={false} />
                        <Query query={getProfile} variables={{ userid: this.state.userid }} fetchPolicy="network-only" onCompleted={data => {
                            this.setState({ isAlertOn: data.getProfile.isAlertOn === null ? true : data.getProfile.isAlertOn })
                        }}>
                            {({ loading, data }) => {
                                return <Toggle title='알림' state={this.state.isAlertOn} onToggle={this._alertHandle} loading={this.state.isAlertOn === null} />
                            }}
                        </Query>
                        <View style={{ marginTop: 10, paddingLeft: 20, height: 20, width: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#888' }}>권한</Text>
                        </View>
                        <Tab title='카메라 권한' onClicked={() => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:')
                            } else {
                                ToastAndroid.show('스크랩 > 권한 > 카메라 활성화', ToastAndroid.LONG);
                                IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS);
                            }
                        }} />
                        <Tab title='갤러리 권한' onClicked={() => {
                            if (Platform.OS === 'ios') {
                                Linking.openURL('app-settings:')
                            } else {
                                ToastAndroid.show('스크랩 > 권한 > 저장공간 활성화', ToastAndroid.LONG);
                                IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS);
                            }
                        }}
                        />

                        <View style={{ marginTop: 10, paddingLeft: 20, height: 20, width: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#888' }}>기타</Text>
                        </View>
                        <Tab title='페이스북 페이지로 이동' onClicked={() => Linking.openURL(facebookUrl)} />
                        <Query query={getVersion} variables={{ key: "version" }} fetchPolicy="network-only">
                            {({ loading, data }) => {
                                return <Tab title='버전확인' onClicked={() => {
                                    if (loading) return;
                                    this._version(data.getResource.value)
                                }} />
                            }}
                        </Query>
                        <Tab title='아이디확인' onClicked={() => {
                            if (this.state.userid !== null) {
                                Alert.alert(
                                    `${this.state.userid}`,
                                    '클립보드에 복사하기',
                                    [{ text: '복사', onPress: () => Clipboard.setString(this.state.userid) },
                                    {
                                        text: '닫기',
                                        style: 'cancel',
                                    },
                                    ],
                                    { cancelable: false },
                                )
                            }
                        }} />
                        {this.state.userid !== null && <Query query={checkAdminid} variables={{ adminid: this.state.userid }} fetchPolicy="network-only">
                            {({ loading, data }) => {
                                if (loading) return null;
                                return data.checkAdminid && <Tab title='관리자' onClicked={() => this.props.navigation.dispatch(AdminRoute)} />
                            }}
                        </Query>}

                        {/* <Tab title='문의하기' /> */}
                        {this.state.isHasId
                            ?
                            <Tab title='로그아웃' onClicked={this._logOutHandle} />
                            :
                            <Tab title='로그인' onClicked={this._logOutProcess} />}


                        <View style={{ marginTop: 10, paddingLeft: 20, height: 20, width: '100%', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#888' }}>약관 및 정책</Text>
                        </View>
                        <Tab title='이용약관' onClicked={() => Linking.openURL(servicePolicy)} />
                        <Tab title='개인정보처리방침' onClicked={() => Linking.openURL(privatePolicy)} />
                        {/* <Tab title='운영정책' onClicked={() => Linking.openURL(policy)} /> */}
                        <Tab title='오픈소스 라이선스' onClicked={() => Linking.openURL(openSource)} />
                    </ScrollView>
                </View>
        )
    }
}

class Toggle extends Component {
    render() {
        const { title, state, onToggle, loading } = this.props;
        return (
            <View>
                <View style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 14 }}>{title}</Text>
                    <View style={{ position: 'absolute', right: 20, top: 0, bottom: 0, alignItems: 'flex-end', justifyContent: 'center' }}>
                        {loading
                            ?
                            <ActivityIndicator size='small' color={Colors.highlightBlue} />
                            :
                            <TouchableWithoutFeedback onPress={onToggle}>
                                <FontAwesome name={state ? 'toggle-on' : 'toggle-off'} size={30} color={state ? Colors.red : Colors.lightGray} />
                            </TouchableWithoutFeedback>
                        }
                    </View>
                </View>
            </View>
        )
    }
}

class Tab extends Component {
    render() {
        const { title, onClicked } = this.props;
        return (
            <BaseButton onPress={onClicked}>
                <View accessible style={{ width: '100%', height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 }}>
                    <Text style={{ fontSize: 14 }}>{title}</Text>
                    <View style={{ position: 'absolute', right: 20, top: 0, bottom: 0, alignItems: 'flex-end', justifyContent: 'center' }}>
                    </View>
                </View>
            </BaseButton>
        )
    }
}

const styles = StyleSheet.create({})
