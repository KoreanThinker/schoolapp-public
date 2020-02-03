import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, ScrollView, TouchableWithoutFeedback, Alert, AsyncStorage, ActivityIndicator, TextInput, ToastAndroid, KeyboardAvoidingView, Platform, Modal, RefreshControl, Image, Linking } from 'react-native'
import { BaseButton } from 'react-native-gesture-handler';
import SettingBtn from '../Icons/profileSetting';
import { getStatusBarHeight } from "react-native-status-bar-height";
import Feather from '@expo/vector-icons/Feather';
import { Colors } from '../Components/Asset';
import gql from 'graphql-tag'
import { Mutation, Query } from 'react-apollo'
import { StackActions, NavigationActions } from 'react-navigation';
import AppData from '../app.json';

const resetAction2 = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
});

const facebookUrl = 'https://mobile.facebook.com/%EB%B3%B4%EC%A0%95%EA%B3%A0%EB%93%B1%ED%95%99%EA%B5%90-%EB%8F%99%EC%95%84%EB%A6%AC-%EC%8A%A4%ED%81%AC%EB%9E%A9-SchoolApp-2075994872508564/?_rdc=1&_rdr&refsrc=https%3A%2F%2Fm.facebook.com%2F%25EB%25B3%25B4%25EC%25A0%2595%25EA%25B3%25A0%25EB%2593%25B1%25ED%2595%2599%25EA%25B5%2590-%25EB%258F%2599%25EC%2595%2584%25EB%25A6%25AC-%25EC%258A%25A4%25ED%2581%25AC%25EB%259E%25A9-SchoolApp-2075994872508564%2F'
const playStoreUrl = AppData.expo.android.playStoreUrl;
const appStoreUrl = AppData.expo.ios.appStoreUrl;


const gradeList = ['1', '2', '3'];
let classList = [];
for (let i = 1; i <= 11; i++) classList.push(i.toString());
let numberList = [];
for (let i = 1; i <= 40; i++) numberList.push(i.toString());
const myWidth = Dimensions.get('window').width - 100;

const getResource = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        value
        values
        figures
    }
}
`

const checkNickName = gql`
query checkProfileName($name: String) {
    checkProfileName(name: $name)
}
`

const changeName = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        name
    }
}
`

const changeChoiceSubject = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        userChoiceSubjects {
            subjects
        }
    }
}
`

const changeNumbers = gql`
mutation updateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
        grade
        class_
        number
    }
}
`
const getProfile = gql`
query getProfile($userid: String!) {
    getProfile(userid: $userid) {
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

const getChoiceSubject = gql`
query getChoiceSubject($grade: Int!) {
    getChoiceSubject(grade: $grade) {
        choice {
            number
            choices
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
            userid: null,
        }
    }
    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        let name = await AsyncStorage.getItem('NAME');
        if (id === null || name === null) {
            Alert.alert('로그인 해주세요');
            this.props.navigation.goBack();
        }
        this.setState({ name: name, loading: false, userid: id });
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

        this.props.navigation.dispatch(resetAction2);
    }
    _onNameChanged(name) {
        this.setState({ name: name })
    }
    async setName(name) {
        await AsyncStorage.setItem('NAME', name);
    }
    _onNumberChanged(input) {
        this.setState({ grade: input.grade, class: input.class_, number: input.number, schoolNum: input.grade * 10000 + input.class_ * 100 + input.number });
    }
    getRankImage() {
        switch (this.state.ranking) {
            case 0: return <View />;
            case 1: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_1.png`)} />;
            case 2: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_2.png`)} />;
            case 3: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_3.png`)} />;
            case 4: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_4.png`)} />;
            case 5: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_5.png`)} />;
        }

    }
    _choiceSubjectChagned = (data) => {
        this.setState({ choiceSubject: data });
    }
    render() {
        return (
            this.state.loading
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator color='#ddd' size='large' />
                </View>
                :
                <Query query={getProfile} variables={{ userid: this.state.userid }} fetchPolicy='cache-and-network'
                    onCompleted={data => {
                        this.setState({
                            name: data.getProfile.name, ranking: data.getProfile.rank, postNum: data.getProfile.posts, commentNum: data.getProfile.comments, rankName: data.getProfile.rankName,
                            grade: data.getProfile.grade, class: data.getProfile.class_, number: data.getProfile.number, schoolNum: ((data.getProfile.grade * 10000) + (data.getProfile.class_ * 100) + (data.getProfile.number)), isFirst: false,
                            choiceSubject: data.getProfile.userChoiceSubjects,
                        });
                        this.setName(data.getProfile.name);
                    }}>
                    {({ loading, data, refetch }) => {
                        if (loading && this.state.isFirst) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                        return <View style={{ flex: 1, paddingTop: STATUSHEIGHT }}>
                            <View style={{ width: WIDTH, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fbfbfb' }}>
                                <BaseButton onPress={() => this.props.navigation.navigate("NameChange", { name: this.state.name, onNameChanged: (name) => this._onNameChanged(name), userid: this.state.userid })}>
                                    <View style={{ height: 50, paddingHorizontal: 20, justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.name}</Text>
                                    </View>
                                </BaseButton>
                                <BaseButton onPress={() => this.props.navigation.navigate("Setting", { lowData: () => { } })}>
                                    <View style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }}>
                                        <SettingBtn />
                                    </View>
                                </BaseButton>
                            </View>
                            <View style={{ flex: 1 }}>
                                <ScrollView overScrollMode='never' style={{ flex: 1, backgroundColor: 'white' }} showsVerticalScrollIndicator={false}
                                    refreshControl={
                                        <RefreshControl
                                            refreshing={this.state.refreshing}
                                            progressViewOffset={50}
                                            onRefresh={() => {
                                                this.setState({ refreshing: true });
                                                refetch().then(res => {
                                                    this.setState({ refreshing: false });
                                                });
                                            }}
                                        />}>
                                    <View style={{ backgroundColor: '#fbfbfb' }}>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('RankingInfo')}>
                                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {this.getRankImage()}
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('RankingInfo')}>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{this.state.rankName}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                    <View style={{ width: WIDTH, height: 20, backgroundColor: '#fbfbfb' }} />
                                    <View style={{ width: WIDTH, height: 48, flexDirection: "row", paddingHorizontal: 20, borderRadius: 20, borderColor: '#dbdbdb', borderWidth: 0.25, backgroundColor: 'white', marginTop: -20 }} />
                                    <View style={{ width: WIDTH, height: 20, marginTop: -20, backgroundColor: 'white' }} />
                                    <View style={{ width: WIDTH, flexDirection: 'row', paddingHorizontal: 20, marginTop: -40 }}>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('MyPost')} style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.postNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>게시물</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('MyComment')} style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.commentNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>댓글</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                        <TouchableWithoutFeedback onPress={() => {
                                            this.props.navigation.navigate("NumberChange", { grade: this.state.grade, class_: this.state.class, number: this.state.number, userid: this.state.userid, onNumberChanged: (input) => this._onNumberChanged(input) })
                                        }
                                        } style={{ flex: 1 }}>
                                            <View style={styles.numbersContainer}>
                                                <View style={styles.numbersInside}>
                                                    <Text style={{ fontSize: 16, fontWeight: 'bold', lineHeight: 20, marginBottom: 8 }}>{this.state.schoolNum}</Text>
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>학번</Text>
                                                </View>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>

                                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, marginTop: 10, justifyContent: 'space-between' }}>
                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <BaseButton onPress={() => this.props.navigation.navigate('EssentialSubject', { grade: this.state.grade })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                <Text>필수과목</Text>
                                            </BaseButton>
                                        </View>

                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <BaseButton onPress={() => this.props.navigation.navigate('ChoiceSubject', { choiceSubject: this.state.choiceSubject, choiceChangeHandle: this._choiceSubjectChagned, userid: this.state.userid, grade: this.state.grade })} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                <Text>선택과목</Text>
                                            </BaseButton>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20, justifyContent: 'space-between' }}>
                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <Query query={getResource} variables={{ key: 'schoolSchedule' }} fetchPolicy='cache-and-network'>
                                                {({ data, loading }) => {
                                                    return <BaseButton onPress={() => {
                                                        if (loading || !data.getResource.value) return;
                                                        this.props.navigation.navigate('Photo', { image: data.getResource.values, index: 0 })
                                                    }} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                        <Text>학사일정</Text>
                                                    </BaseButton>
                                                }}
                                            </Query>
                                        </View>

                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <BaseButton onPress={() => {
                                                Linking.openURL(facebookUrl);
                                            }} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                <Text>페이스북페이지</Text>
                                            </BaseButton>
                                        </View>
                                    </View>

                                    <View style={{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 40, justifyContent: 'space-between' }}>
                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <BaseButton onPress={() => {
                                                if (Platform.OS === 'android') {
                                                    Linking.openURL(playStoreUrl);
                                                } else {
                                                    Linking.openURL(appStoreUrl);
                                                }

                                            }} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                <Text>앱을 평가해 주세요</Text>
                                            </BaseButton>
                                        </View>
                                        <View style={{ borderRadius: 20, backgroundColor: '#f8f8f8', width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                            <BaseButton onPress={this._logOutHandle} style={{ width: (WIDTH - 40) / 2 - 10, height: (WIDTH - 40) / 2 - 10, alignItems: 'center', justifyContent: 'center' }} >
                                                <Text>로그아웃</Text>
                                            </BaseButton>
                                        </View>
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


export class nameChange extends Component {
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


export class numberChange extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '학번 변경',
        headerRight: (
            <BaseButton onPress={navigation.getParam('numberChangeHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                <Feather name='check' color={Colors.highlightBlue} size={24} />
            </BaseButton>
        ),
    });
    constructor(props) {
        super(props);
        this.state = {
            isUploading: false,
            grade: this.props.navigation.state.params.grade,
            class_: this.props.navigation.state.params.class_,
            number: this.props.navigation.state.params.number,
            visible: false,
            option: gradeList,
            selected: 0,
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ numberChangeHandle: this._numberChangeHandle });
    }

    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
    }
    _numberChangeHandle = () => {
        if (this.state.isUploading) return;

        this.setState({ isUploading: true });
        try {
            const input = {
                userid: this.props.navigation.state.params.userid,
                grade: this.state.grade,
                class_: this.state.class_,
                number: this.state.number
            }
            this.updateNameNumber({ variables: { input: input } }).then(res => {
                const input = {
                    grade: res.data.updateProfile.grade,
                    class_: res.data.updateProfile.class_,
                    number: res.data.updateProfile.number
                }
                this.props.navigation.state.params.onNumberChanged(input);
                this._setAsync(input);
            })
        } catch (error) {
            this._showMessage("실패");
            this.setState({ isUploading: false });
            this.props.navigation.goBack();
        }
    }
    async _setAsync(input) {
        await AsyncStorage.setItem('GRADE', JSON.stringify(input.grade));
        await AsyncStorage.setItem('CLASS', JSON.stringify(input.class_));
        await AsyncStorage.setItem('NUMBER', JSON.stringify(input.number));
        this.props.navigation.goBack();
    }
    _callBack = (data) => {
        if (this.state.selected === 0) {
            this.setState({ grade: data + 1 })
        } else if (this.state.selected === 1) {
            this.setState({ class_: data + 1 })
        } else {
            this.setState({ number: data + 1 })
        }
        this._modalClose();
    }
    render() {
        return (
            <Mutation mutation={changeNumbers} >
                {(updateProfile) => {
                    if (this.updateNameNumber === undefined) this.updateNameNumber = updateProfile;
                    return <View style={{ flex: 1 }}>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: WIDTH }}>
                                <View style={{ flexDirection: 'row', paddingHorizontal: 50, }}>
                                    <TouchableWithoutFeedback onPress={() => {
                                        if (this.state.isUploading || this.state.visible) return;
                                        this.setState({ visible: true, option: gradeList, selected: 0 })
                                    }} style={{ flex: 1 }}>
                                        <View style={{ flex: 1, alignItems: 'center', height: 80, justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{this.state.grade}</Text>
                                            <Text style={{ fontSize: 20 }}>학년</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={() => {
                                        if (this.state.isUploading || this.state.visible) return;
                                        this.setState({ visible: true, option: classList, selected: 1 })
                                    }} style={{ flex: 1 }}>
                                        <View style={{ flex: 1, alignItems: 'center', height: 80, justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{this.state.class_}</Text>
                                            <Text style={{ fontSize: 20 }}>반</Text>
                                        </View>
                                    </TouchableWithoutFeedback>

                                    <TouchableWithoutFeedback onPress={() => {
                                        if (this.state.isUploading || this.state.visible) return;
                                        this.setState({ visible: true, option: numberList, selected: 2 })
                                    }} style={{ flex: 1 }}>
                                        <View style={{ flex: 1, alignItems: 'center', height: 80, justifyContent: 'space-between' }}>
                                            <Text style={{ fontSize: 30, fontWeight: 'bold' }}>{this.state.number}</Text>
                                            <Text style={{ fontSize: 20 }}>번호</Text>
                                        </View>
                                    </TouchableWithoutFeedback>
                                </View>
                                <Text style={{ fontSize: 10, color: '#bbb', marginTop: 40, alignSelf: 'center' }}>바뀐 정보는 재접속 후 적용됩니다</Text>
                            </View>
                        </View>
                        <Modal visible={this.state.isUploading} transparent={true} onRequestClose={() => { }} >
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff80' }}>
                                <ActivityIndicator size='large' color='#ddd' />
                            </View>
                        </Modal>

                        {this.numberModal(this.state.option, this.state.visible, this._callBack)}
                    </View>
                }}
            </Mutation>
        )
    }
    _modalClose = () => {
        this.setState({ visible: false });
    }
    numberModal(data, visible, callBack) {
        return (
            <Modal
                animationType='fade'
                transparent={true}
                visible={visible}
                onRequestClose={this._modalClose}
            >
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={this._modalClose}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#80808080' }}>
                        <View style={{ width: myWidth, backgroundColor: 'white', borderRadius: 10, overflow: 'hidden', alignItems: 'center' }}>
                            <ScrollView style={{ maxHeight: 500 }} showsVerticalScrollIndicator={false}>
                                {data.map((info, index) =>
                                    <View key={index}>
                                        <TouchableWithoutFeedback onPress={() => callBack(index)}>
                                            <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, height: 50, width: myWidth, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 16 }}>{info}</Text>
                                            </View>
                                        </TouchableWithoutFeedback>
                                    </View>
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </TouchableWithoutFeedback>

            </Modal>
        )
    }
}

export class RankingInfoScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '랭킹 정보',
    });
    getRankImage(num) {
        switch (num) {
            case 0: return <View />;
            case 1: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_1.png`)} />;
            case 2: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_2.png`)} />;
            case 3: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_3.png`)} />;
            case 4: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_4.png`)} />;
            case 5: return <Image style={{ height: 280, width: 280 }} source={require(`../assets/rankImage/rank_5.png`)} />;
        }

    }
    render() {
        return (
            <Query query={getResource} variables={{ key: 'rank' }} fetchPolicy='cache-and-network'>
                {({ data, loading }) => {
                    if (loading) return <View style={{ flex: 1 }}>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(1)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>유딩</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>이 아이는 커서 뭐가 될까요</Text>
                        </View>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(2)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>초딩</Text>
                            </View>
                        </View>
                    </View>
                    return <ScrollView style={{ flex: 1, backgroundColor: '#fbfbfb' }}>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(1)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>유딩</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>이 아이는 커서 뭐가 될까요</Text>
                        </View>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(2)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>초딩</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>게시글 {data.getResource.figures[0]}개 · 댓글 {data.getResource.figures[1]}개 이상</Text>
                        </View>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(3)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>중고딩</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>게시글 {data.getResource.figures[2]}개 · 댓글 {data.getResource.figures[3]}개 이상</Text>
                        </View>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(4)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>대딩</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>게시글 {data.getResource.figures[4]}개 · 댓글 {data.getResource.figures[5]}개 이상</Text>
                        </View>
                        <View>
                            <View style={{ width: WIDTH, height: 300, alignItems: 'center', justifyContent: 'flex-end' }}>
                                {this.getRankImage(5)}
                            </View>
                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50 }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>박사</Text>
                            </View>
                            <Text style={{ fontSize: 14, alignSelf: 'center' }}>게시글 {data.getResource.figures[6]}개 · 댓글 {data.getResource.figures[7]}개 이상</Text>
                        </View>
                        <View style={{ height: 100 }} />
                    </ScrollView>
                }}
            </Query>
        )
    }
}


export class ChoiceSubjectScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '선택과목',
        headerRight: (
            <BaseButton onPress={navigation.getParam('choiceChangeHandle2')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                <Feather name='check' color={Colors.highlightBlue} size={24} />
            </BaseButton>
        ),
    });
    constructor(props) {
        super(props);
        let d = this.props.navigation.state.params.choiceSubject;
        if (d !== null) {
            for (let i = 0; i < d.length; i++) {
                delete d[i].__typename;
            }
        }
        this.state = {
            mySubject: d,
            subjectData: null,
            isUploading: false,
            loading: true
        }
    }
    componentDidMount() {
        this.props.navigation.setParams({ choiceChangeHandle2: this._changeHandle });


    }
    _changeHandle = () => {
        this.setState({ isUploading: true });
        const input = {
            userid: this.props.navigation.state.params.userid,
            userChoiceSubjects: this.state.mySubject,
        }
        this.updateChoiceSubjectMutation({ variables: { input: input } }).then(res => {
            this.setState({ isUploading: false });
            this.props.navigation.state.params.choiceChangeHandle(res.data.updateProfile.userChoiceSubjects);
            this.props.navigation.goBack();
        })
    }

    render() {
        return (
            <Query variables={{ grade: this.props.navigation.state.params.grade }} query={getChoiceSubject} fetchPolicy='network-only' onCompleted={data => {
                let d = data.getChoiceSubject.choice;
                let d2 = []
                for (let i = 0; i < d.length; i++) {
                    d2.push({ subjects: [] });
                    delete d[i].__typename;
                }
                let b = false;
                if (this.state.mySubject !== null) {
                    if (d.length === this.state.mySubject.length) {
                        for (let k = 0; k < this.state.mySubject.length; k++) {
                            for (let i = 0; i < this.state.mySubject[k].subjects.length; i++) {
                                if (d[k].choices.length > 0) {
                                    const word = this.state.mySubject[k].subjects[i];
                                    if (d[k].choices.indexOf(word) === -1) {
                                        b = true;
                                        break;
                                    }
                                }
                            }
                        }
                    } else {

                        b = true;
                    }
                }
                this.setState({ subjectData: d, loading: false, mySubject: this.state.mySubject === null || b ? d2 : this.state.mySubject });
            }}>
                {({ loading }) => {
                    if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <Mutation mutation={changeChoiceSubject} >
                        {(updateProfile) => {
                            if (this.updateChoiceSubjectMutation === undefined) this.updateChoiceSubjectMutation = updateProfile;
                            return <ScrollView style={{ flex: 1 }}>
                                {(!this.state.loading && this.state.mySubject && this.state.subjectData) ? this.state.subjectData.map((info, index) =>
                                    <View key={index} style={{ width: WIDTH, height: 70, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, alignItems: 'center' }}>
                                        <View style={{ width: WIDTH, height: 20, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14 }}>{info.number}개 선택{info.number === this.state.mySubject[index].subjects.length ? '' : ` (${info.number - this.state.mySubject[index].subjects.length}개 남음)`}</Text>
                                        </View>
                                        <View style={{ width: WIDTH, height: 50, flexDirection: 'row' }}>
                                            <ScrollView style={{ flex: 1 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                    <View style={{ width: 10 }} />
                                                    {this.state.mySubject[index].subjects && info.choices.map((info2, index2) =>
                                                        <TouchableWithoutFeedback key={index2} onPress={() => {
                                                            if (this.state.mySubject[index].subjects.length > 0) {
                                                                const c = this.state.mySubject[index].subjects.indexOf(info2); //눌려진지 확인
                                                                let d = this.state.mySubject.filter(s => true);
                                                                if (c > -1) { //눌려졌기에 삭제
                                                                    d[index].subjects.splice(c, 1);
                                                                    this.setState({ mySubject: d });
                                                                    return;
                                                                }
                                                                if (info.number === this.state.mySubject[index].subjects.length) return;//공간있는지 확인

                                                                d[index].subjects.push(info2); //공간있다면 push
                                                                this.setState({ mySubject: d });
                                                            } else {
                                                                let d = this.state.mySubject.filter(s => true);
                                                                d[index].subjects.push(info2);
                                                                this.setState({ mySubject: d });
                                                            }
                                                        }}>
                                                            <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? '#ddd' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? '#ddd' : 'white' }}>
                                                                <Text style={{ fontSize: 14, color: this.state.mySubject[index].subjects.length > 0 && this.state.mySubject[index].subjects.indexOf(info2) > -1 ? 'white' : 'black' }}>{info2}</Text>
                                                            </View>
                                                        </TouchableWithoutFeedback>
                                                    )}
                                                    <View style={{ width: 23 }} />
                                                </View>

                                            </ScrollView>
                                        </View>
                                    </View>
                                ) : null}
                                <Text style={{ fontSize: 10, color: '#bbb', marginTop: 10, alignSelf: 'center' }}>바뀐 정보는 재접속 후 적용됩니다</Text>
                                <Modal visible={this.state.isUploading} transparent={true} onRequestClose={() => { }} >
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff80' }}>
                                        <ActivityIndicator size='large' color='#ddd' />
                                    </View>
                                </Modal>
                            </ScrollView>
                        }}
                    </Mutation>
                }}
            </Query>
        )
    }
}


export class EssentialSubjectScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        title: '필수과목'
    });
    constructor(props) {
        super(props);
        this.state = {
            key: 'essentialSubject' + this.props.navigation.state.params.grade.toString(),
            data: null
        }
    }
    render() {
        return (
            <Query query={getResource} variables={{ key: this.state.key }} fetchPolicy='cache-and-network' onCompleted={data => {
                this.setState({ data: data.getResource.values });
            }}>
                {({ loading }) => {
                    if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                    return <ScrollView style={{ flex: 1 }}>
                        {this.state.data && this.state.data.map((info, index) => <View key={index} style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 20 }}>{info}</Text>
                        </View>)}

                    </ScrollView>
                }}
            </Query>
        )
    }
}
