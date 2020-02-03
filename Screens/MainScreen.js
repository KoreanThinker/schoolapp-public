import React, { Component, PureComponent } from 'react'
import { StyleSheet, View, ScrollView, StatusBar, Dimensions, Text, TouchableOpacity, Platform, AsyncStorage, Image, ActivityIndicator, TouchableWithoutFeedback, RefreshControl, ToastAndroid, Alert, Linking, FlatList, Modal } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height'
import { LinearGradient } from 'expo-linear-gradient';
import { Notifications } from 'expo';
import * as Font from 'expo-font';
import { Colors } from '../Components/Asset';
import { BaseButton } from 'react-native-gesture-handler';
import BookmarkFill from '../Icons/bookmarkFill.svg';
import BookmarkEmpty from '../Icons/bookmarkEmpty.svg';
import HeartFill from '../Icons/heartFill.svg';
import HeartEmpty from '../Icons/heartEmpty.svg';
import Dots from '../Icons/threeDots.svg';
import MenuBell from '../Icons/menuBell';
import MenuBookmark from '../Icons/menuBookmark';
import MenuSetting from '../Icons/menuSetting';
import MyActionSheet from '../Components/MyActionSheet';
import MenuSearch from '../Icons/menuSearch';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import Hyperlink from 'react-native-hyperlink'
import { StackActions, NavigationActions } from 'react-navigation';
import { Ionicons } from '@expo/vector-icons';
import BannerScroll from '../Components/BannerScroll';
import AppData from '../app.json';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});
const resetAction2 = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'SignIn' })],
});
const notiActionComment = StackActions.reset({
    index: 1,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' }), NavigationActions.navigate({ routeName: 'Alert' }),],
});
const notiActionNotification = StackActions.reset({
    index: 1,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' }), NavigationActions.navigate({ routeName: 'Notification' }),],
});

const LIMIT = 10;
const playStoreUrl = AppData.expo.android.playStoreUrl;
const appStoreUrl = AppData.expo.ios.appStoreUrl;
const getListPost = gql`
query listPosts($limit: Int, $nextToken: String, $userid: String) {
    listPosts(limit: $limit, nextToken: $nextToken, userid: $userid) {
        nextToken
        items {
            postid
            tags
            userid
            name
            time
            description
            pics
            ratio
            isLiked
            likeNum
            isBookmarked
            commentNum
            rank
        }
    }
}
`
const removePost = gql`
mutation deletePost($postid: String) {
    deletePost(postid: $postid) {
        createdAt
    }
}
`
const getProfile = gql`
query getProfile($userid: String!) {
    getProfile(userid: $userid) {
        password
    }
}
`

const getVersion = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        value
    }
}
`

const report = gql`
mutation createReport($input: CreateReportFormInput!) {
    createReport(input: $input) {
        id
    }
}
`
const getEvent = gql`
query getEvent {
    getEvent {
        title
        pics
        ratio
        description
        isOn
        isComment
        commentNum
        version
        postid
    }
}
`

const Bus = [
    '35',
    '690',
    '720'
];
const MaxRatio = 2;
const MinRatio = 0.7;
const STATUSBARHEIGHT = getStatusBarHeight();
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const SCROLLUNIT = (636 - WIDTH) / 4;

export default class MainScreen extends Component {
    static navigationOptions = {
        header: null,
        tabBarOnPress: ({ navigation, defaultHandler }) => {
            if (navigation.isFocused()) navigation.getParam('mainScrollUp')();
            else defaultHandler();
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            lowDataMode: true,
            isNewAlert: true,
            refreshing: false,
            isFirst: true,
            isMoring: false,
            data: null,
            Fontloading: false,
            userid: null,
            tokenValue: "",
            xOffset: SCROLLUNIT * 2 + ((WIDTH - 318) / 2),
            grade: 1,
            class_: 1,
            nextToken: '',
            eventModalVisible: false,
            eventVersion: null,
            eventPage: 1,
            isFirstModal: true,
            isNoMore: false,
            isEventDesLong: false,
            eventData: null,
        }
        this.isMoring = false;
    }

    async componentDidMount() {
        this.props.navigation.setParams({ mainScrollUp: this._scrollUpClicked });
        let id = await AsyncStorage.getItem('ID');
        if (id === null) {
            this.props.navigation.dispatch(resetAction2);
            return;
        }
        let isNotiHandle = await AsyncStorage.getItem('NOTIHANDLE');
        if (isNotiHandle === null) this.listener = Notifications.addListener(this.handleNotification);
        let pw = await AsyncStorage.getItem('PASSWORD');
        if (id !== null) this.checkPW(pw, 0);
        let lowData = await AsyncStorage.getItem('ISLOWDATA');
        let newAlert = await AsyncStorage.getItem('NEWALERT');
        await Font.loadAsync({
            'nanumbarungothic': require('../assets/fonts/NanumBarunGothic.ttf'),
            'nanumbarungothic-bold': require('../assets/fonts/NanumBarunGothic-bold.ttf'),
            'segoe-ui': require('../assets/fonts/Segoe-Ui.ttf')
        });
        let grade = await AsyncStorage.getItem('GRADE');
        let class_ = await AsyncStorage.getItem('CLASS');
        lowData = lowData === null ? false : lowData === 'true' ? true : false;
        let eventV = await AsyncStorage.getItem('EVENTVERSION');
        this.setState({ lowDataMode: lowData, Fontloading: true, userid: id, isNewAlert: newAlert ? true : false, grade: JSON.parse(grade), class_: JSON.parse(class_), eventVersion: eventV === null ? 0 : eventV });

    }
    componentWillUnmount() {
        this.listener && this.listener.remove();
    }
    checkPW = async (pw, index) => {
        if (index > 40) return;
        setTimeout(() => {
            if (this.checkPassWord === undefined || this.state.userid === null) this.checkPW(pw, index + 1);
            else {
                this.checkPassWord({ variables: { userid: this.state.userid } }).then(res => {
                    if (!res.data) return;
                    if (res.data.getProfile.password !== pw) {
                        this._showMessage('비밀번호가 바꿨습니다');
                        this.props.navigation.dispatch(resetAction2);
                        this.setState({ Fontloading: true }); //혹시몰라 예외처리
                    }
                    return;
                })
            }
        }, 500);
    }
    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
    }

    handleNotification = ({ origin, data }) => {
        const d = JSON.stringify(data);
        if (origin === 'selected') {
            if (d.postType === 'postNotification') {
                this.props.navigation.dispatch(notiActionNotification);
            } else {
                this.props.navigation.dispatch(notiActionComment);
                this.removeAlert();
            }
        } else if (origin === 'received') {
            if (d.postType === 'postNotification') {

            } else {
                this.setAlert();
            }
        }
    };
    async removeAlert() {
        const alertState = await AsyncStorage.getItem('NEWALERT');
        if (alertState) await AsyncStorage.removeItem('NEWALERT');
    }
    async setAlert() {
        this.setState({ isNewAlert: true });
        await AsyncStorage.setItem('NEWALERT', 'true');
    }
    _lowDataHandle = (data) => {
        this.setState({ lowDataMode: data });
    }
    _scrollUpClicked = () => {
        this.mainScroll.scrollToOffset({ offset: 0, animated: true })
    }

    _fetchMore = () => {
        if (this.isMoring || this.state.nextToken === null) return;
        this.setState({ isMoring: true });
        this.isMoring = true;
        this.fetchMore({
            variables: {
                limit: LIMIT,
                nextToken: this.state.nextToken
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                this.setState({ isMoring: false });
                this.isMoring = false;
                if (!fetchMoreResult) return prev;
                const post = {
                    listPosts: {
                        __typename: prev.listPosts.__typename,
                        nextToken: fetchMoreResult.listPosts.nextToken,
                        items: [...prev.listPosts.items, ...fetchMoreResult.listPosts.items],
                    },
                }
                return post;
            }
        })
    }



    render() {

        return (
            !this.state.Fontloading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                :
                <Query query={getListPost} variables={{ limit: LIMIT, nextToken: "", userid: this.state.userid }} fetchPolicy="network-only"
                    onCompleted={data => {
                        this.setState({ data: data.listPosts.items, nextToken: data.listPosts.nextToken, isFirst: false });
                    }}>
                    {({ loading, error, data, fetchMore, refetch }) => {

                        if (this.mainRefetch === undefined) {
                            this.mainRefetch = refetch;
                        }
                        if (this.fetchMore === undefined) this.fetchMore = fetchMore;

                        return (
                            <View style={{ flex: 1 }}
                                onStartShouldSetResponder={() => false}
                                onResponderStart={() => console.log(1)}
                            >
                                {this.state.userid !== null && <Query query={getProfile} variables={{ userid: this.state.userid }} fetchPolicy="network-only">
                                    {({ refetch }) => {
                                        if (this.checkPassWord === undefined) this.checkPassWord = refetch;
                                        return null;
                                    }}
                                </Query>}
                                <Query query={getVersion} variables={{ key: "version" }} fetchPolicy="network-only" onCompleted={data => {
                                    if (this.versionCheckFirst !== undefined) return;
                                    this.versionCheckFirst = false;
                                    let myVersion = AppData.expo.version.substring(
                                        0,
                                        AppData.expo.version.lastIndexOf(".")
                                    );
                                    let onlineVersion = data.getResource.value.substring(
                                        0,
                                        data.getResource.value.lastIndexOf(".")
                                    );
                                    try {
                                        if (myVersion !== onlineVersion) {
                                            Alert.alert(
                                                '최신버전이 출시됬습니다',
                                                '스토어에서 다운받아 보세요',
                                                [
                                                    {
                                                        text: '취소',
                                                        onPress: () => { },
                                                        style: 'cancel',
                                                    },
                                                    { text: '네', onPress: () => Linking.openURL(Platform.OS === 'ios' ? appStoreUrl : playStoreUrl) },
                                                ],
                                                { cancelable: false },
                                            );
                                        }
                                    } catch (error) {
                                        throw error;
                                    }

                                }}>
                                    {() => {
                                        return null;
                                    }}
                                </Query>
                                <StatusBar barStyle={Platform.OS == "android" ? "light-content" : "dark-content"} backgroundColor='#00000080' translucent={true} />

                                <FlatList
                                    progressViewOffset={100}
                                    // initialNumToRender={1}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.setState({ refreshing: true });
                                        refetch().then(res => {
                                            this.setState({ refreshing: false });
                                        });
                                    }}
                                    onEndReached={this._fetchMore}
                                    onEndReachedThreshold={3}
                                    showsVerticalScrollIndicator={false}
                                    ref={(ref) => this.mainScroll = ref}
                                    keyExtractor={(item, index) => item.postid}
                                    data={this.state.data}
                                    ListFooterComponent={() =>
                                        <View>
                                            {error ? <View style={{ width: '100%', height: 100, alignItems: 'center', justifyContent: 'center' }}>
                                                <View style={{ alignItems: 'center' }}>

                                                    <Text style={{ fontSize: 20, color: Colors.red }}>오류</Text>
                                                    <TouchableWithoutFeedback onPress={() => {
                                                        if (this.state.refreshing) return;
                                                        this.setState({ refreshing: true });
                                                        refetch().then(res => {
                                                            this.setState({ refreshing: false });
                                                        });
                                                    }}>
                                                        <Text style={{ fontSize: 14, color: Colors.highlightBlue, marginTop: 4 }}>재시도</Text>
                                                    </TouchableWithoutFeedback>
                                                </View>

                                            </View> : this.state.nextToken ? <View style={{ width: WIDTH, alignItems: 'center', height: 50, justifyContent: 'center' }}>
                                                <ActivityIndicator color='#ddd' size='large' />
                                            </View> : null}
                                        </View>
                                    }

                                    ListEmptyComponent={() => <View style={{ height: 50, width: WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color='#ddd' size='large' />
                                    </View>}
                                    renderItem={({ item }) => {
                                        const info = item;
                                        return <Mutation mutation={removePost}>
                                            {(deletePost) => (
                                                <Mutation mutation={report}>
                                                    {(reportPost) => (
                                                        this.state.data && this.state.id !== null ?
                                                            <View style={styles.Cards}>
                                                                <Card refresh={() => {
                                                                    this.setState({ refreshing: true });
                                                                    refetch().then(res => {
                                                                        this.setState({ refreshing: false });
                                                                    });
                                                                }} isLiked={info.isLiked} likeHandle={() => {
                                                                    const c = this.state.data.filter(() => true);
                                                                    c[index].likeNum = c[index].isLiked ? c[index].likeNum - 1 : c[index].isLiked + 1;
                                                                    c[index].isLiked = !c[index].isLiked;
                                                                    this.setState({ data: c });
                                                                }} rank={info.rank} postid={info.postid} report={reportPost} remove={deletePost} navigation={this.props.navigation} name={info.name} date={info.time} likeNum={info.likeNum} tag={info.tags} myid={this.state.userid} userid={info.userid} content={info.description} image={info.pics} ratio={info.ratio} lowDataMode={this.state.lowDataMode} commentNum={info.commentNum} isBookmarked={info.isBookmarked} />
                                                            </View>
                                                            : null)}
                                                </Mutation>
                                            )}</Mutation>
                                    }}
                                    ListHeaderComponent={() => {
                                        return <View>
                                            <LinearGradient colors={['#C2C7FB', '#FCBEC0']} style={styles.TopContainer} start={[0, 0]} end={[1, 1]} >

                                                <View style={styles.TitleContainer}>
                                                    <Text style={{ fontSize: 30, color: 'white', fontFamily: 'segoe-ui' }}>BOJEONG</Text>
                                                    <Text style={{ marginLeft: 6, marginTop: 12, fontSize: 14, color: '#ffffff80', fontFamily: 'segoe-ui' }}>SCHOOLAPP</Text>
                                                </View>

                                                <View style={styles2.Container}>
                                                    <BannerScroll grade={this.state.grade} class_={this.state.class_} navigation={this.props.navigation} />
                                                </View>

                                                <View style={styles.BottomContainer} />
                                            </LinearGradient>

                                            {this.state.isEventing && <View style={{ height: 30, alignSelf: 'center', alignItems: 'center', flexDirection: 'row' }}>
                                                <TouchableOpacity onPress={() => {
                                                    console.log(this.state.eventData);
                                                    if (this.state.eventData !== null) {
                                                        this.setState({ eventModalVisible: true });
                                                    }
                                                }}>
                                                    <Text style={{ color: Colors.highlightBlue }}>이벤트 진행중</Text>
                                                </TouchableOpacity>
                                            </View>}

                                            <View style={{
                                                alignSelf: 'center', width: WIDTH - 40, height: 40, borderRadius: 20, backgroundColor: 'white', marginTop: 20, marginBottom: 40,
                                                shadowColor: "#000",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 1,
                                                },
                                                shadowOpacity: 0.22,
                                                shadowRadius: 2.22,
                                                elevation: 3,
                                            }}>
                                                <View style={{ flex: 1, flexDirection: 'row', overflow: 'hidden', borderRadius: 20 }}>
                                                    <BaseButton onPress={() => this.props.navigation.navigate("Search")} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <MenuSearch />
                                                    </BaseButton>
                                                    <BaseButton onPress={() => {
                                                        this.removeAlert();
                                                        this.props.navigation.navigate("Alert");
                                                        setTimeout(() => {
                                                            this.setState({ isNewAlert: false });
                                                        }, 300);
                                                    }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <MenuBell />
                                                        {this.state.isNewAlert &&
                                                            <View style={{ backgroundColor: Colors.red, borderRadius: 4, height: 8, width: 8, borderWidth: 1, borderColor: 'white', position: 'absolute', top: 20, left: (WIDTH - 40) / 8 + 2 }} />
                                                        }
                                                    </BaseButton>
                                                    <BaseButton onPress={() => this.props.navigation.navigate("Bookmark")} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <MenuBookmark />
                                                    </BaseButton>
                                                    <BaseButton onPress={() => this.props.navigation.navigate("Setting", { lowData: this._lowDataHandle })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <MenuSetting />
                                                    </BaseButton>
                                                </View>
                                            </View>


                                        </View>
                                    }}
                                />

                                {this.state.eventVersion !== null && <Query query={getEvent} fetchPolicy='network-only'
                                    onCompleted={data => {
                                        if (data.getEvent.isOn && this.state.eventVersion !== data.getEvent.version.toString()) {
                                            this.setState({ eventModalVisible: true });
                                        } else {
                                            this.setState({ isFirstModal: false });
                                        }
                                        this.setState({ isEventing: data.getEvent.isOn, eventData: data });
                                    }}>
                                    {({ loading, data }) => {
                                        return null;
                                    }}
                                </Query>}

                                <Modal
                                    transparent={true}
                                    visible={this.state.eventModalVisible}
                                    animationType='fade'
                                    onRequestClose={() => {
                                        this.setState({ eventModalVisible: false, isFirstModal: false });
                                    }}
                                >
                                    {this.state.eventData !== null && <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#80808080' }}>
                                        <View>
                                            <View style={{
                                                width: WIDTH - 40, backgroundColor: 'white', borderRadius: 20, shadowColor: "#000",
                                                shadowOffset: {
                                                    width: 0,
                                                    height: 2,
                                                },
                                                shadowOpacity: 0.25,
                                                shadowRadius: 3.84,
                                                elevation: 5,
                                            }}>
                                                <View style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                                    <Text style={{ fontSize: 16 }}>{this.state.eventData.getEvent.title}</Text>
                                                </View>
                                                <View style={{ width: '100%' }}>
                                                    <View style={styles.ImageContainer}>
                                                        <ScrollView overScrollMode={"never"} horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false} onScroll={(event) => {
                                                            const page = Math.round(event.nativeEvent.contentOffset.x / (WIDTH - 40)) + 1;
                                                            this.setState({
                                                                eventPage: page
                                                            })
                                                        }} scrollEventThrottle={16}>
                                                            {this.state.eventData.getEvent.pics.map(
                                                                (source, index) => (
                                                                    <TouchableOpacity activeOpacity={1} key={index} onPress={() => {
                                                                        this.setState({ eventModalVisible: false, isFirstModal: false });
                                                                        this.props.navigation.navigate('Photo', { image: this.state.eventData.getEvent.pics, index: (this.state.eventPage - 1) });
                                                                    }}>
                                                                        <Image source={{ uri: source }} style={{ width: WIDTH - 40, height: (WIDTH - 40) }} />
                                                                    </TouchableOpacity>
                                                                )
                                                            )}
                                                        </ScrollView>
                                                        {this.state.eventData.getEvent.pics.length > 1 ?
                                                            <View style={styles.ImageNav}><Text style={{ color: 'white', fontSize: 12 }}>{this.state.eventPage}/{this.state.eventData.getEvent.pics.length}</Text></View> : null}
                                                    </View>
                                                </View>
                                                <View style={{ width: '100%' }}>
                                                    <View style={{ paddingTop: 5, paddingBottom: 5, paddingLeft: 20, paddingRight: 20, }}>
                                                        <View style={{ width: '100%', marginBottom: 5, }}>
                                                            <ScrollView style={{ width: '100%', maxHeight: 100 }} overScrollMode='never'>
                                                                <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                                                                    <Text>{this.state.eventData.getEvent.description}</Text>
                                                                </Hyperlink>
                                                            </ScrollView>
                                                            <Text style={styles.ContentData}>
                                                                댓글{this.state.eventData.getEvent.commentNum === null ? 0 : this.state.eventData.getEvent.commentNum}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                                <View style={{ width: '100%', height: 40, borderRadius: 20, overflow: 'hidden' }}>
                                                    <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={{ flex: 1, flexDirection: 'row' }} start={[0, 0]} end={[1, 1]} >
                                                        <TouchableOpacity activeOpacity={1} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row' }} onPress={() => {
                                                            this.setState({ eventModalVisible: false, isFirstModal: false });
                                                            this.props.navigation.navigate('Comment', { type: 'event', postid: this.state.eventData.getEvent.postid });
                                                        }}>
                                                            <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>댓글</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity activeOpacity={1} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'row' }} onPress={() => {
                                                            this.setState({ eventModalVisible: false, isFirstModal: false });
                                                            if (this.state.isNoMore) {
                                                                AsyncStorage.setItem('EVENTVERSION', this.state.eventData.getEvent.version.toString());
                                                            }
                                                        }}>
                                                            <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>닫기</Text>
                                                        </TouchableOpacity>
                                                    </LinearGradient>
                                                </View>
                                            </View>

                                            {this.state.isFirstModal && <View style={{ alignSelf: 'flex-end', marginTop: 6, marginRight: 10, alignItems: 'center', flexDirection: 'row' }}>
                                                <Text style={{ fontSize: 14, marginRight: 4, color: '#444' }}>다시 보지 않기</Text>
                                                <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ isNoMore: !this.state.isNoMore })}>
                                                    <Ionicons name={`ios-radio-button-${this.state.isNoMore ? 'on' : 'off'}`} size={20} color='#444' />
                                                </TouchableOpacity>
                                            </View>}
                                        </View>
                                    </View>}
                                </Modal>


                            </View>
                        );
                    }}
                </Query>
        )
    }
}

const likePost = gql`
mutation likePost($postid: String, $userid: String, $isLiked: Boolean) {
    likePost(postid: $postid, userid: $userid, isLiked: $isLiked) {
        isLiked
    }
}
`
const bookmarkPost = gql`
mutation bookmarkPost($postid: String, $userid: String, $isBookmarked: Boolean) {
    bookmarkPost(postid: $postid, userid: $userid, isBookmarked: $isBookmarked) {
        isBookmarked
    }
}
`

class Card extends Component {
    constructor(props) {
        super(props);
        this.state = {
            myPage: 1,
            isOverflow: false,
            readMoreClicked: false,
            isLiked: this.props.isLiked,
            isBookmarked: this.props.isBookmarked,
            like: this.props.likeNum,
            view: false,
            visible: false,
            isDeleting: false,
        }
    }
    _imageClicked(source) {
        if (this.state.isDeleting) return;
        this.props.navigation.navigate('Photo', { image: this.props.image, index: (this.state.myPage - 1) });
    }
    _scrollHandle = (event) => {
        const page = Math.round(event.nativeEvent.contentOffset.x / (WIDTH - 40)) + 1;
        this.setState({
            myPage: page
        })
    }
    _involkedLayout = (event) => {
        if (event.nativeEvent.layout.height > 40) {
            this.setState({
                isOverflow: true,
            });
        }
    }
    _readmoreHandle = () => {
        this.setState({
            readMoreClicked: true,
        })
    }
    _likeHandle = () => {
        if (this.state.isDeleting) return;
        this.setState({
            like: !this.state.isLiked ? this.state.like + 1 : this.state.like - 1,
            isLiked: !this.state.isLiked,
        })
    }
    _bookmarkHandle = () => {
        if (this.state.isDeleting) return;
        this.setState({
            isBookmarked: !this.state.isBookmarked
        })
    }
    _commentHandle = () => {
        this.props.navigation.navigate('Comment', { postid: this.props.postid });
    }
    _removeHandle() {
        this.setState({ isDeleting: true });
        this.props.remove({ variables: { postid: this.props.postid } }).then(() => {
            this.setState({ isDeleting: false })
            this.props.navigation.dispatch(resetAction);
        })
    }
    _callBack(data) {
        if (data === 0) {
            if (this.props.myid === this.props.userid) {
                if (Platform.OS === 'ios') {
                    this._removeHandle();
                    return;
                }
                Alert.alert(
                    '경고',
                    '정말 삭제하시겠습니까',
                    [
                        {
                            text: '취소',
                            style: 'cancel',
                        },
                        {
                            text: '네', onPress: () => this._removeHandle()
                        },
                    ],
                    { cancelable: false },
                );
                return;
            } else {
                const input = {
                    postid: this.props.postid,
                    postType: 'mainPost',
                    message: this.props.myid + '님이 ' + this.props.name + '님의 게시물을 신고하셨습니다',
                    shortage: this.props.content,
                }
                this.setState({ clickedComment: null, clickedComment2: null });


                this.props.report({ variables: { input: input } }).then(() => {
                    if (Platform.OS === 'android') {
                        ToastAndroid.show('접수되었습니다', ToastAndroid.SHORT);
                    } else {
                        Alert.alert("접수되었습니다");
                    }
                })
            }
        } else {
            this.props.navigation.navigate('Detail', { postid: this.props.postid })
        }

    }
    getRankImage(n) {
        switch (n) {
            case 0: return <View />;
            case 1: return <Image style={{ height: 28, width: 28 }} source={require(`../assets/rankImage/rank_1.png`)} />;
            case 2: return <Image style={{ height: 28, width: 28 }} source={require(`../assets/rankImage/rank_2.png`)} />;
            case 3: return <Image style={{ height: 28, width: 28 }} source={require(`../assets/rankImage/rank_3.png`)} />;
            case 4: return <Image style={{ height: 28, width: 28 }} source={require(`../assets/rankImage/rank_4.png`)} />;
            case 5: return <Image style={{ height: 28, width: 28 }} source={require(`../assets/rankImage/rank_5.png`)} />;
        }

    }
    render() {
        const { name, date, commentNum, content, image, tag, ratio, lowDataMode, rank } = this.props;
        const newTag = tag.filter(word => word !== '*');
        const tagList = newTag.length > 0 ? <View style={styles.TagContainer}>
            {newTag.map(
                (text, index) => {
                    if (text === '*') return;
                    return (
                        <View key={index} style={styles.TagList}>
                            <View style={{
                                width: 4, height: 4, borderRadius: 2, marginRight: 4,
                                backgroundColor: (index % 2 == 0 ? Colors.blue : Colors.red)
                            }} />
                            <Text style={{ fontSize: 14 }}>{text}</Text>
                        </View>)
                }
            )}
        </View> : null;

        const imageList = image != null && image.length > 0 ? image.map(
            (source, index) => (
                <TouchableOpacity activeOpacity={1} key={index} onPress={() => this._imageClicked(source)}>
                    <Image source={{ uri: source }} style={{ width: WIDTH - 40, height: (WIDTH - 40) / (ratio > MaxRatio ? MaxRatio : ratio < MinRatio ? MinRatio : ratio) }} />
                </TouchableOpacity>
            )
        ) : null;

        return (
            <View style={styles.Conatiner}>
                <View style={styles.HeaderContainer}>
                    <View style={styles.UserContainer}>
                        <View style={{ width: 28, height: 28, borderRadius: 14 }}>
                            {this.getRankImage(rank)}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}>
                            <Text style={{ fontSize: 14 }}>{name}</Text>
                            <Text style={{ fontSize: 10, color: Colors.gray, marginLeft: 4, marginTop: 4 }}>{date}</Text>
                        </View>
                    </View>
                    <TouchableWithoutFeedback onPress={() => {
                        if (this.state.isDeleting) return;
                        if (this.props.userid === this.props.myid) {
                            this.setState({ visible: true, isDeleting: true });
                        } else {
                            this.setState({ visible: true });
                        }
                    }} style={{ alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Dots />
                    </TouchableWithoutFeedback>
                </View>

                {imageList != null
                    ?
                    !lowDataMode || this.state.view
                        ?
                        <View style={styles.ImageContainer}>
                            <ScrollView overScrollMode={"never"} horizontal={true} pagingEnabled={true} showsHorizontalScrollIndicator={false} onScroll={this._scrollHandle} scrollEventThrottle={16}>
                                {imageList}
                            </ScrollView>
                            {image.length > 1 ?
                                <View style={styles.ImageNav}><Text style={{ color: 'white', fontSize: 12 }}>{this.state.myPage}/{image.length}</Text></View> : null}
                        </View>
                        :
                        <BaseButton onPress={() => {
                            this.setState({ view: true });
                        }} style={{ width: '100%', height: 30, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>사진보기(데이터 절약모드)</Text>
                        </BaseButton>
                    : null}

                {tagList}

                <View style={styles.ContentContainer}>
                    <View style={styles.ContentTextContainer}>
                        <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                            <Text ref={(ref) => this.contentText = ref} style={styles.ContentText} onLayout={this._involkedLayout} numberOfLines={this.state.isOverflow == true ? (this.state.readMoreClicked == true ? null : 2) : null}>{content}</Text>
                        </Hyperlink>
                        {this.state.isOverflow && !this.state.readMoreClicked ? <TouchableWithoutFeedback onPress={this._readmoreHandle}><Text style={{ color: Colors.lightGray, fontSize: 14, lineHeight: 20 }} >자세히 보기</Text></TouchableWithoutFeedback> : null}

                        <Text style={styles.ContentData}>
                            좋아요{this.state.like} · 댓글{commentNum}
                        </Text>
                    </View>
                </View>
                <Mutation mutation={likePost}>
                    {(likePost) => (
                        <Mutation mutation={bookmarkPost}>
                            {(bookmarkPost) => (
                                <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={styles.BottomBar} start={[0, 0]} end={[1, 1]} >

                                    <BaseButton style={styles.BottomBarContent} onPress={() => {
                                        if (this.state.isDeleting) return;
                                        likePost({ variables: { postid: this.props.postid, userid: this.props.myid, isLiked: !this.state.isLiked } }).then(res => {
                                        });
                                        this._likeHandle();
                                    }}>
                                        {this.state.isLiked ? <HeartFill /> : <HeartEmpty />}
                                        <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>좋아요</Text>
                                    </BaseButton>
                                    <BaseButton onPress={this._commentHandle} style={{ height: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                                        <Text style={{ color: 'white', fontSize: 14 }} >댓글</Text>
                                    </BaseButton>
                                    <BaseButton style={styles.BottomBarContent} onPress={() => {
                                        if (this.state.isDeleting) return;
                                        bookmarkPost({ variables: { postid: this.props.postid, userid: this.props.myid, isBookmarked: !this.state.isBookmarked } }).then(res => {
                                        });
                                        this._bookmarkHandle();
                                    }}>
                                        {this.state.isBookmarked ? <BookmarkFill /> : <BookmarkEmpty />}
                                        <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>북마크</Text>
                                    </BaseButton>
                                </LinearGradient>
                            )}
                        </Mutation>
                    )}
                </Mutation>

                <MyActionSheet
                    visible={this.state.visible}
                    contents={this.props.myid === this.props.userid ? ['삭제하기', '새창에서 보기'] : ['신고하기', '새창에서 보기']}
                    onClicked={(data) => this._callBack(data)}
                    closeHandle={() => this.setState({ visible: false, isDeleting: false })} />
            </View>
        )
    }

}



const styles2 = StyleSheet.create({
    IconContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    Container: {
        alignItems: 'center',
        width: WIDTH
    },
    ScrollViewHolder: {
        marginTop: 35,
        height: 250,
        width: WIDTH
    },
    ScrollView: {
        width: '100%',
    },
    GenreContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        width: 250,
        marginTop: 25,
    },


})
const styles = StyleSheet.create({
    Conatiner: {
        marginBottom: 36,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderRadius: 20,
        width: WIDTH - 40,
    },
    HeaderContainer: {
        flexDirection: 'row',
        height: 40,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 14,
        paddingRight: 14,
    },
    UserContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    ImageContainer: {
        width: WIDTH - 40,
        marginBottom: 5,
    },
    ImageNav: {
        height: 20,
        width: 40,
        borderRadius: 20,
        backgroundColor: '#4b4b4b80',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        right: 10,
        top: 10,
    },
    TagContainer: {
        width: WIDTH - 40,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: 30
    },
    TagList: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 5,
        marginRight: 5,
    },
    ContentContainer: {
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 20,
        paddingRight: 20,
    },
    ContentTextContainer: {
        width: '100%',
        marginBottom: 5,
    },
    ContentText: {
        fontSize: 14,
        lineHeight: 20
    },
    ContentData: {
        textAlign: 'right',
        fontSize: 10,
        color: Colors.lightGray,
        fontWeight: 'bold',
    },
    BottomBar: {
        height: 40,
        width: WIDTH - 40,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden'
    },
    BottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flex: 1
    },
    TopContainer: {
        width: WIDTH,
        height: 500 + STATUSBARHEIGHT
    },
    BottomContainer: { //radius
        position: 'absolute',
        top: 480 + STATUSBARHEIGHT,
        left: 0,
        right: 0,
        height: 20,
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        backgroundColor: 'white'
    },
    Cards: {
        width: WIDTH,
        alignItems: 'center',

    },
    TitleContainer: {
        marginTop: STATUSBARHEIGHT + 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 40,
        width: '100%'
    },
})