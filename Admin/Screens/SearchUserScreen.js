import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, ScrollView, TouchableWithoutFeedback, Alert, AsyncStorage, ActivityIndicator, TextInput, ToastAndroid, KeyboardAvoidingView, Platform, Modal, RefreshControl, Image, Linking } from 'react-native'
import { BaseButton } from 'react-native-gesture-handler';
import SettingBtn from '../Icons/profileSetting';
import { getStatusBarHeight } from "react-native-status-bar-height";
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../Components/Asset';
import gql from 'graphql-tag'
import { Mutation, Query } from 'react-apollo'
import Constants from 'expo-constants';

let classList = [];
for (let i = 1; i <= 11; i++) classList.push(i.toString());
let numberList = [];
for (let i = 1; i <= 40; i++) numberList.push(i.toString());
const myWidth = Dimensions.get('window').width - 100;

const checkNickName = gql`
query checkProfileName($name: String) {
    checkProfileName(name: $name)
}
`

const changeName = gql`
mutation updateProfile($input: UpdateProfileInput!, $adminid: String) {
    updateProfile(input: $input, adminid: $adminid) {
        name
    }
}
`

const getProfile = gql`
query getProfile($userid: String!, $adminid: String) {
    getProfile(userid: $userid, adminid: $adminid) {
        name
        rank
        posts
        comments
        grade
        class_
        number
        rankName
        userChoiceSubjects {
            subjects
        }
    }
}
`


const WIDTH = Dimensions.get('window').width;
const STATUSHEIGHT = getStatusBarHeight();

export default class ProfileTabScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            name: '',
            ranking: 0,
            postNum: 0,
            commentNum: 0,
            schoolNum: 0,
            loading: true,
            grade: 0,
            class: 0,
            number: 0,
            choiceSubject: [{ subjects: [] }],
            refreshing: false,
            isFirst: true,
            rankName: '',
            userid: this.props.navigation.state.params.userid,
            adminid: ''
        }
    }
    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        this.setState({ loading: false, adminid: id });
    }
    _onNameChanged(name) {
        this.setState({ name: name });
    }
    render() {
        return (
            this.state.loading
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color='#ddd' size='large' />
                </View>
                :
                <Query query={getProfile} variables={{ userid: this.state.userid, adminid: `${this.state.adminid}(${Constants.deviceName})` }} fetchPolicy='network-only'
                    onCompleted={data => {
                        console.log(data);
                        if (data.getProfile === null) {
                            Alert.alert('없는 계정입니다');
                            this.props.navigation.goBack();
                            return;
                        }
                        this.setState({
                            name: data.getProfile.name, ranking: data.getProfile.rank, postNum: data.getProfile.posts, commentNum: data.getProfile.comments, rankName: data.getProfile.rankName,
                            grade: data.getProfile.grade, class: data.getProfile.class_, number: data.getProfile.number, schoolNum: ((data.getProfile.grade * 10000) + (data.getProfile.class_ * 100) + (data.getProfile.number)), isFirst: false,
                            choiceSubject: data.getProfile.userChoiceSubjects,
                        });
                    }}>
                    {({ loading, data, refetch }) => {
                        if (loading && this.state.isFirst) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                        return <View style={{ flex: 1 }}>
                            <View style={{ flex: 1 }}>
                                <Mutation mutation={changeName} >
                                    {(updateProfile) => {
                                        if (this.updateName === undefined) this.updateName = updateProfile;
                                        return null;
                                    }}
                                </Mutation>
                                <ScrollView overScrollMode='never' style={{ flex: 1, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            onRefresh={() => {
                                                this.setState({ refreshing: true });
                                                refetch().then(res => {
                                                    this.setState({ refreshing: false });
                                                });
                                            }}
                                        />}>
                                    <View style={{ backgroundColor: '#fbfbfb' }}>
                                        <View style={{ width: WIDTH, height: 50, justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>아이디 : {this.state.userid}</Text>
                                        </View>
                                        <BaseButton onPress={() => {
                                            Alert.alert(
                                                '닉네임을 강제변경',
                                                '닉네임은 "***"으로 변경됩니다',
                                                [
                                                    {
                                                        text: '취소',
                                                        style: 'cancel',
                                                    },
                                                    {
                                                        text: '네', onPress: () => {
                                                            const input = {
                                                                userid: this.props.navigation.state.params.userid,
                                                                name: '***',
                                                            }
                                                            this.updateName({ variables: { input: input, adminid: `${this.state.adminid}(${Constants.deviceName})` } }).then(response => {
                                                                refetch();
                                                            })
                                                        }
                                                    },
                                                ],
                                                { cancelable: false },
                                            );
                                        }}>
                                            <View style={{ width: WIDTH, height: 50, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>닉네임 : {this.state.name}</Text>
                                            </View>
                                        </BaseButton>
                                        <View style={{ width: WIDTH, height: 50, justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>랭크 : {this.state.rankName}</Text>
                                        </View>
                                    </View>
                                    <View style={{ width: WIDTH, height: 20, backgroundColor: '#fbfbfb' }} />
                                    <View style={{ width: WIDTH, height: 48, flexDirection: "row", paddingHorizontal: 20, borderRadius: 20, borderColor: '#dbdbdb', borderWidth: 0.25, backgroundColor: 'white', marginTop: -20 }} />
                                    <View style={{ width: WIDTH, height: 20, marginTop: -20, backgroundColor: 'white' }} />

                                    <View style={{ width: WIDTH, flexDirection: 'row', paddingHorizontal: 20, marginTop: -40 }}>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('A_SearchPost', { userid: this.state.userid })} style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.postNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>게시물</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('A_SearchComment', { userid: this.state.userid })} style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.commentNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>댓글</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.schoolNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>학번</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                </ScrollView>
                            </View>
                        </View >
                    }}
                </Query>
        )
    }
}

const styles = StyleSheet.create({
    numbersContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 14
    },
    numbersInside: {
        alignItems: 'center'
    }
})


export class A_NameChange extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '닉네임 변경',
        headerRight: (
            <BaseButton onPress={navigation.getParam('nickNameChangeHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                <Feather name='check' color={Colors.highlightBlue} size={24} />
            </BaseButton>
        ),
    });
    constructor(props) {
        super(props);
        this.state = {
            isUploading: false,
            nickName: this.props.navigation.state.params.name,
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ nickNameChangeHandle: this._changeHandle });
    }

    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
    }
    _changeHandle = () => {
        if (this.state.isUploading) return;
        if (this.state.nickName.length < 2 || this.state.nickName.length > 8) {
            this._showMessage("닉네임은 2~8글자입니다");
            this.nickNameInput.focus();
            return;
        }
        this.setState({ isUploading: true });
        try {
            const input = {
                userid: this.props.navigation.state.params.userid,
                name: this.state.nickName,
            }
            this.refetchCheckName().then(res => {
                if (res.data.checkProfileName) {
                    this.updateName({ variables: { input: input } }).then(response => {
                        AsyncStorage.setItem("NAME", response.data.updateProfile.name).then(res2 => {
                            this.setState({ isUploading: false });
                            this.props.navigation.state.params.onNameChanged(response.data.updateProfile.name);
                            this.props.navigation.goBack();
                        });
                    })
                } else {
                    this.setState({ isUploading: false });
                    this._showMessage("이미 사용중인 닉네임 입니다");
                    return;
                }
            })

        } catch (error) {
            this._showMessage("실패");
            this.setState({ isUploading: false });
            this.props.navigation.goBack();
        }
    }
    render() {
        return (
            <Query variables={{ name: this.state.nickName }} query={checkNickName} fetchPolicy='network-only'>
                {({ refetch }) => {
                    if (this.refetchCheckName === undefined) this.refetchCheckName = refetch;
                    return <Mutation mutation={changeName} >
                        {(updateProfile) => {
                            if (this.updateName === undefined) this.updateName = updateProfile;
                            return <KeyboardAvoidingView behavior="padding" enabled style={{ flex: 1 }}>
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <TextInput autoCapitalize='none' ref={ref => this.nickNameInput = ref} editable={!this.state.isUploading} maxLength={8} placeholder='2~8글자' value={this.state.nickName}
                                            onChangeText={text => {
                                                if (this.state.isUploading) return;
                                                if (text[text.length - 1] === ' ') {
                                                    this._showMessage("공백은 입력하실 수 없습니다");
                                                    return;
                                                }
                                                this.setState({ nickName: text })
                                            }}
                                            style={{ fontSize: 32, textAlign: 'center' }}
                                        />
                                    </View>
                                </View>
                                <Modal visible={this.state.isUploading} transparent={true} onRequestClose={() => { }} >
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff80' }}>
                                        <ActivityIndicator size='large' color='#ddd' />
                                    </View>
                                </Modal>
                            </KeyboardAvoidingView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}