import React, { Component } from 'react'
import { Text, StyleSheet, View, Keyboard, TextInput, Dimensions, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, AsyncStorage, RefreshControl, Platform, ActivityIndicator, Linking, ToastAndroid, Alert } from 'react-native'
import { Colors } from '../Components/Asset';
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MyActionSheet from '../Components/MyActionSheet';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { RNS3 } from 'react-native-aws3';;
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink'
//0 post 1 notification

const options = {
    keyPrefix: "uploads/commentImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: '',
    secretKey: '',
    successActionStatus: 201
}

const getComment = [
    gql`
query getPost($postid: String!, $userid: String) {
    getPost(postid: $postid, userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            rank
            likeNum
            isLiked
            replyComments {
                time
                name
                userid
                content
                to
                pics
                ratio
                likeNum
                isLiked
                rank
            }
        }
    }
}`,
    gql`
query getNotification($postid: String!, $userid: String) {
    getNotification(postid: $postid, userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            likeNum
            rank
            isLiked
            replyComments {
                time
                name
                userid
                rank
                content
                to
                pics
                ratio
                likeNum
                isLiked
            }
        }
    }
}
`,
    gql`
query getExamSubject($postid: String!, $userid: String) {
    getExamSubject(postid: $postid, userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            likeNum
            rank
            isLiked
            replyComments {
                time
                name
                userid
                rank
                content
                to
                pics
                ratio
                likeNum
                isLiked
            }
        }
}
}
`, gql`
query getContest($postid: String!, $userid: String) {
    getContest(postid: $postid, userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            likeNum
            rank
            isLiked
            replyComments {
                time
                name
                userid
                rank
                content
                to
                pics
                ratio
                likeNum
                isLiked
            }
        }
}
}
`, gql`
query getHomework($postid: String!, $userid: String) {
    getHomework(postid: $postid, userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            likeNum
            rank
            isLiked
            replyComments {
                time
                name
                userid
                rank
                content
                to
                pics
                ratio
                likeNum
                isLiked
            }
        }
}
}
`, gql`
query getEvent($userid: String) {
    getEvent(userid: $userid) {
        comments {
            time
            userid
            name
            content
            pics
            ratio
            likeNum
            rank
            isLiked
            replyComments {
                time
                name
                userid
                rank
                content
                to
                pics
                ratio
                likeNum
                isLiked
            }
        }
}
}`]
const deleteComment = [
    gql`
mutation deletePostComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
    deletePostComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
        createdAt
    }
}
`,
    gql`
mutation deleteNotificationComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
    deleteNotificationComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
        createdAt
    }
}
`,
    gql`
mutation deleteExamSubjectComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
    deleteExamSubjectComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
    postid
}
}
`,
    gql`
mutation deleteContestComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
    deleteContestComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
    createdAt
}
}
`,
    gql`
mutation deleteHomeworkComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
    deleteHomeworkComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
    createdAt
}
}
`,
    gql`
mutation deleteEventComment($postid: String, $commentNum: Int, $replyCommentNum: Int) {
deleteEventComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum) {
postid
}
}
`]
const likeComment = [
    gql`
mutation likePostComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
    likePostComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
        createdAt
    }
}
`,
    gql`
mutation likeNotificationComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
    likeNotificationComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
        createdAt
    }
}
`,
    gql`
mutation likeExamSubjectComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
    likeExamSubjectComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
    postid
}
}
`,
    gql`
mutation likeContestComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
    likeContestComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
    createdAt
}
}
`,
    gql`
mutation likeHomeworkComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
    likeHomeworkComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
    createdAt
}
}
`,
    gql`
mutation likeEventComment($postid: String, $commentNum: Int, $replyCommentNum: Int, $userid: String) {
likeEventComment(postid: $postid, commentNum: $commentNum, replyCommentNum: $replyCommentNum, userid: $userid) {
postid
}
}
`]
const createComment = [
    gql`
mutation createPostComment($postid: String, $input: CreateCommentInput!) {
    createPostComment(postid: $postid, input: $input) {
        createdAt
    }
}
`,
    gql`
mutation createNotificationComment($postid: String, $input: CreateCommentInput!) {
    createNotificationComment(postid: $postid, input: $input) {
        createdAt
    }
}
`,
    gql`
mutation createExamSubjectComment($postid: String, $input: CreateCommentInput!) {
    createExamSubjectComment(postid: $postid, input: $input) {
    postid
}
}
`,
    gql`
mutation createContestComment($postid: String, $input: CreateCommentInput!) {
    createContestComment(postid: $postid, input: $input) {
    createdAt
}
}
`,
    gql`
mutation createHomeworkComment($postid: String, $input: CreateCommentInput!) {
    createHomeworkComment(postid: $postid, input: $input) {
    createdAt
}
}
`,
    gql`
mutation createEventComment($postid: String, $input: CreateCommentInput!) {
createEventComment(postid: $postid, input: $input) {
postid
}
}
`
]
const createReplyComment = [
    gql`
mutation createPostReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createPostReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
        createdAt
    }
}
`,
    gql`
mutation createNotificationReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createNotificationReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
        createdAt
    }
}
`,
    gql`
mutation createExamSubjectReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createExamSubjectReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
    postid
}
}
`,
    gql`
mutation createContestReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createContestReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
    createdAt
}
}
`,
    gql`
mutation createHomeworkReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createHomeworkReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
    createdAt
}
}
`
    ,
    gql`
mutation createEventReplyComment($postid: String, $commentNum: Int, $input: CreateCommentInput!) {
    createEventReplyComment(postid: $postid, commentNum: $commentNum, input: $input) {
    postid
}
}
`
]

const report = gql`
mutation createReport($input: CreateReportFormInput!) {
    createReport(input: $input) {
        id
    }
}
`

const MaxRatio = 1.5;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const HEIGHT2 = Dimensions.get('screen').height;

class CommentScreen extends Component {


    constructor(props) {
        super(props);
        this.state = {
            btnLocation: 0,
            image: null,
            ratio: null,
            comments: null,
            clickedComment: null,
            clickedComment2: null,
            visible: false,
            value: '',
            isUploading: false,
            refreshing: false,
            longOption: ['신고하기'],
            longVisible: false,
            count: 0,
            isDeleting: false,
            name: "김종현",
            lowDataMode: true,
            loading: true,
            isFirst: true,
            userid: null,
            postid: this.props.postid,
        }
        this.type = this.props.type;
        this.postid = this.props.postid;
        this.typeIndex2 = type2Num(this.props.type);
    }


    async componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });
        let name = await AsyncStorage.getItem('NAME');
        this.setState({ name: name });
        if (id === null || name === null) {
            Alert.alert('로그인해주세요');
            this.props.navigation.goBack();
        }
        let lowData = await AsyncStorage.getItem('ISLOWDATA');
        lowData = lowData === null ? false : lowData === 'true' ? true : false;
        this.setState({ lowDataMode: lowData, loading: false });
    }
    componentWillUnmount() {
        this.keyboardDidShowListener && this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener && this.keyboardDidHideListener.remove();
    }
    _setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }
    _keyboardDidShow(e) {
        this.setState({ btnLocation: e.endCoordinates.height });
    }

    _keyboardDidHide() {
        this.setState({ btnLocation: 0 });
    }
    _imageHandle = () => {
        if (this.state.image != null) {
            this.props.navigation.navigate('Photo', { image: this.state.image });
        }
    }
    _imageDeleteHandle = () => {
        this.setState({ image: null });
    }
    _imageAddHandle = () => {
        if (!this.state.isUploading) this.setState({ visible: true });
    }
    _openCamera = () => {
        this.props.navigation.navigate('Camera', { changePhoto: this._changePhoto });
    }

    _openGellary = async () => {
        const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (newPermission.status === 'denied') {
            if (Platform.OS === 'ios') {
                Alert.alert(
                    '권한',
                    '사진 > 읽기 및 쓰기 활성화',
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
                    '스크랩 > 권한 > 저장공간 활성화',
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
        } else {
            let result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ImagePicker.MediaTypeOptions.Images
            });
            if (!result.cancelled) {
                this.setState({ image: result.uri, ratio: result.width / result.height });
            }
        }
    }
    _changePhoto = (_uri, _ratio) => {
        this.setState({ image: _uri, ratio: _ratio })
    }
    _actionSheetHandle(index) {
        if (index == 0) {
            this.setState({ isCameraMode: false });
            setTimeout(() => {
                this._openGellary();
            }, 100);
        } else if (index == 1) {
            this.setState({ isCameraMode: true });
            this._openCamera();
        }
    }

    _commentHandle(index1, index2) { //클릭
        if (this.state.clickedComment === index1 && this.state.clickedComment2 === index2) {
            this.setState({ clickedComment: null, clickedComment2: null });
        }
        else this.setState({ clickedComment: index1, clickedComment2: index2 });
    }
    _longPressHandle(index, index2) {
        if (this.state.isDeleting) return;
        if (this.state.clickedComment !== index || this.state.clickedComment2 !== index2) {
            this._commentHandle(index, index2);
        }
        let userid;
        if (index2 == 0) {
            userid = this.state.comments[index].userid;
        } else {
            userid = this.state.comments[index].replyComments[index2 - 1].userid;
        }
        if (this.state.userid === userid) {
            this.setState({ longOption: ['삭제하기'], longVisible: true });
        } else {
            this.setState({ longOption: ['신고하기'], longVisible: true });
        }
    }
    _longPressCallback(index) {
        if (this.state.isDeleting) return;
        if (this.state.longOption[0] === '삭제하기') {
            const num = this.state.clickedComment;
            const replyNum = this.state.clickedComment2 === 0 ? null : this.state.clickedComment2 - 1;
            this.setState({ isDeleting: true, clickedComment: null, clickedComment2: null });
            this.props.deleteComment({ variables: { postid: this.props.postid, commentNum: num, replyCommentNum: replyNum } }).then(() => {
                this.setState({ isDeleting: false });
                this._refresh(false);
            })
        } else {
            const commentNum = this.state.clickedComment;
            const replyNum = this.state.clickedComment2 === 0 ? null : this.state.clickedComment2 - 1;
            const data = replyNum === null ? this.state.comments[commentNum] : this.state.comments[commentNum].replyComments[replyNum];
            const input = {
                postid: this.props.postid,
                postType: this.props.type === undefined ? 'post' : this.props.type,
                message: this.state.userid + '님이 ' + data.name + '님의 댓글을 신고하셨습니다',
                shortage: data.content,
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

    }
    _heartHandle(index, index2) {
        const c = this.state.comments;
        if (index2 === 0) {
            c[index].isLiked ? c[index].likeNum-- : c[index].likeNum++;
            c[index].isLiked = !c[index].isLiked;
        } else {
            c[index].replyComments[index2 - 1].isLiked ? c[index].replyComments[index2 - 1].likeNum-- : c[index].replyComments[index2 - 1].likeNum++;
            c[index].replyComments[index2 - 1].isLiked = !c[index].replyComments[index2 - 1].isLiked;
        }
        this.setState({
            comments: c,
        })
        const k = index2 === 0 ? null : index2 - 1;
        this.props.likeComment({ variables: { postid: this.props.postid, commentNum: index, replyCommentNum: k, userid: this.state.userid } });
        //서버업데이트
    }
    getFile(uri) {
        let uriParts = uri.split('.');
        let fileType = uriParts[uriParts.length - 1];
        let date = moment().format('YYYYMMDDHHmmss');
        const file = {
            uri,
            name: `${this.state.userid}${date}.${fileType}`,
            type: `image/${fileType}`,
        };

        return file;
    }
    _refresh = (isParentComment, clickedC) => {
        this.setState({ refreshing: true });
        this.refetch().then(response => {
            this.setState({ refreshing: false })
            if (isParentComment || clickedC == this.state.comments.length - 1) {
                setTimeout(() => {
                    this.commentScrollView.scrollToEnd({ animated: true })
                }, 1);
            }
        });
    }

    _checkTimeover(index) {
        if (this.state.isUploading && this.state.count === index) {
            if (Platform.OS === 'android') {
                ToastAndroid.show('시간초과', ToastAndroid.SHORT);
            } else {
                Alert.alert("시간초과");
            }
            this.props.navigation.goBack();
        }
    }
    getRankImage(n) {
        const width = 22;
        switch (n) {
            case 0: return <View />;
            case 1: return <Image style={{ height: width, width: width }} source={require(`../assets/rankImage/rank_1.png`)} />;
            case 2: return <Image style={{ height: width, width: width }} source={require(`../assets/rankImage/rank_2.png`)} />;
            case 3: return <Image style={{ height: width, width: width }} source={require(`../assets/rankImage/rank_3.png`)} />;
            case 4: return <Image style={{ height: width, width: width }} source={require(`../assets/rankImage/rank_4.png`)} />;
            case 5: return <Image style={{ height: width, width: width }} source={require(`../assets/rankImage/rank_5.png`)} />;
        }

    }
    _closeTabByDeleted = () => {
        this.props.navigation.goBack();
        if (Platform.OS === 'android') {
            ToastAndroid.show('이미 삭제된 게시물입니다', ToastAndroid.SHORT);
        } else {
            Alert.alert('이미 삭제된 게시물입니다');
        }
    }
    render() {

        return (
            <Query query={getComment[this.typeIndex2]} variables={{ postid: this.postid, userid: this.state.userid }} fetchPolicy="network-only"
                onCompleted={data => {

                    if (data.getPost === null) {
                        this._closeTabByDeleted();
                        return;
                    }

                    if (!data || (data != null && typeof data == "object" && !Object.keys(data).length)) return;
                    let d;
                    if (this.props.type === undefined) {
                        d = data.getPost.comments;
                    } else if (this.props.type === 'notification') {
                        d = data.getNotification.comments;
                    } else if (this.props.type === 'exam') {
                        d = data.getExamSubject.comments;
                    } else if (this.props.type === 'contest') {
                        d = data.getContest.comments;
                    } else if (this.props.type === 'homework') {
                        d = data.getHomework.comments;
                    } else if (this.props.type === 'event') {
                        d = data.getEvent.comments;
                    }
                    this.setState({ comments: d, clickedComment: null, clickedComment2: null });
                }}>
                {({ loading, error, data, refetch }) => {
                    if ((loading || this.state.loading) && this.isFirst === undefined) {
                        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size='large' color='#ddd' />
                        </View>
                    }
                    if (error) {
                        console.log(error);
                        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: Colors.red, fontSize: 14 }}>오류</Text>
                        </View>
                    }
                    if (this.isFirst === undefined) {
                        this.isFirst = false;
                        this.refetch = refetch;
                    }
                    return <View style={{ flex: 1 }}>
                        <View style={{ flex: 1 }}>
                            <ScrollView ref={(ref) => this.commentScrollView = ref} style={{ flex: 1 }} refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.setState({ refreshing: true });
                                        this.refetch().then(response => {
                                            this.setState({ refreshing: false })
                                        });
                                    }}
                                />}>

                                {this.state.comments !== null && this.state.comments.length > 0 ? this.state.comments.map((info, index) =>
                                    <View key={index}>
                                        <TouchableWithoutFeedback onLongPress={() => this._longPressHandle(index, 0)} onPress={() => this._commentHandle(index, 0)}>
                                            <View style={{ backgroundColor: this.state.clickedComment == index && this.state.clickedComment2 == 0 ? '#eee' : '#fff', flexDirection: 'row', paddingLeft: 0, paddingVertical: 5 }}>
                                                <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                    {this.getRankImage(info.rank)}
                                                </View>

                                                <View style={{ width: WIDTH - 100 }}>
                                                    <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                                                        <Text style={{ fontWeight: 'bold', lineHeight: 20, marginTop: 4 }}>{info.name}{'  '}


                                                            <Text style={{ fontWeight: this.state.userid === info.userid ? 'bold' : 'normal', color: '#000' }}>{info.content}</Text>

                                                        </Text>
                                                    </Hyperlink>

                                                    {info.pics ? !this.state.lowDataMode || info.view ?
                                                        <TouchableOpacity activeOpacity={1} onPress={() => {
                                                            this.props.navigation.navigate('Photo', { image: info.pics });
                                                        }} style={{ width: WIDTH - 100, height: (WIDTH - 100) / (info.ratio > MaxRatio ? MaxRatio : info.ratio < 1 / MaxRatio ? 1 / MaxRatio : info.ratio), borderRadius: 20, overflow: 'hidden', marginVertical: 5 }}>
                                                            <Image style={{ width: WIDTH - 100, height: (WIDTH - 100) / (info.ratio > MaxRatio ? MaxRatio : info.ratio < 1 / MaxRatio ? 1 / MaxRatio : info.ratio) }} source={{ uri: info.pics }} />
                                                        </TouchableOpacity> :
                                                        <TouchableOpacity style={{ justifyContent: 'center', height: 30 }} onPress={() => {
                                                            let d = this.state.comments;
                                                            d[index].view = true;
                                                            this.setState({ comments: d });
                                                        }}>
                                                            <View>
                                                                <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>사진보기(데이터 절약모드)</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                        : null}

                                                    <View>
                                                        <Text style={{ fontSize: 12, lineHeight: 20, marginBottom: 5, color: Colors.lightGray }}>{info.time}{'    '}
                                                            <Text>
                                                                {info.likeNum > 0 ? `좋아요${info.likeNum}개    ` : null}
                                                                <Text>답글달기</Text>
                                                            </Text>
                                                        </Text>
                                                    </View>
                                                </View>

                                                <TouchableWithoutFeedback onPress={() => this._heartHandle(index, 0)} >
                                                    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                        {info.isLiked ? <Ionicons color={Colors.red} size={14} name='md-heart' style={{ margin: 0 }} /> : <Ionicons name='md-heart-empty' size={14} style={{ margin: 0 }} />}
                                                    </View>
                                                </TouchableWithoutFeedback>

                                            </View>
                                        </TouchableWithoutFeedback>
                                        {info.replyComments && info.replyComments.map((info2, index2) =>
                                            <TouchableWithoutFeedback key={index2} onLongPress={() => this._longPressHandle(index, index2 + 1)} onPress={() => this._commentHandle(index, index2 + 1)}>
                                                <View style={{ backgroundColor: this.state.clickedComment == index && this.state.clickedComment2 === index2 + 1 ? '#eee' : '#fff', flexDirection: 'row', paddingLeft: 50, paddingVertical: 5 }}>
                                                    <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                        {this.getRankImage(info2.rank)}
                                                    </View>
                                                    <View style={{ width: WIDTH - 150 }}>
                                                        <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                                                            <Text style={{ fontWeight: 'bold', fontSize: 14, lineHeight: 20, marginTop: 4 }}>{info2.name}{'  '}
                                                                <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: this.state.userid === info2.userid ? 'bold' : 'normal', color: Colors.highlightBlue }}>{info2.to ? `@${info2.to}  ` : null}


                                                                    <Text style={{ fontWeight: this.state.userid === info2.userid ? 'bold' : 'normal', fontSize: 14, color: '#000' }}>{info2.content}</Text>

                                                                </Text>
                                                            </Text>
                                                        </Hyperlink>

                                                        {info2.pics ? !this.state.lowDataMode || info2.view ?
                                                            <TouchableOpacity activeOpacity={1} onPress={() => {
                                                                this.props.navigation.navigate('Photo', { image: info2.pics });
                                                            }} style={{ width: WIDTH - 150, height: (WIDTH - 150) / (info2.ratio > MaxRatio ? MaxRatio : info2.ratio < 1 / MaxRatio ? 1 / MaxRatio : info2.ratio), borderRadius: 20, overflow: 'hidden', marginVertical: 5 }}>
                                                                <Image style={{ width: WIDTH - 150, height: (WIDTH - 150) / (info2.ratio > MaxRatio ? MaxRatio : info2.ratio < 1 / MaxRatio ? 1 / MaxRatio : info2.ratio) }} source={{ uri: info2.pics }} />
                                                            </TouchableOpacity> :
                                                            <TouchableOpacity style={{ justifyContent: 'center', height: 30 }} onPress={() => {
                                                                let d = this.state.comments;
                                                                d[index].replyComments[index2].view = true;
                                                                this.setState({ comments: d });
                                                            }}>
                                                                <View>
                                                                    <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>사진보기(데이터 절약모드)</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                            : null}

                                                        <View>
                                                            <Text style={{ fontSize: 12, lineHeight: 20, marginBottom: 5, color: Colors.lightGray }}>{info2.time}{'    '}
                                                                <Text>
                                                                    {info2.likeNum > 0 ? `좋아요${info2.likeNum}개    ` : null}
                                                                    <Text>답글달기</Text>
                                                                </Text>
                                                            </Text>
                                                        </View>
                                                    </View>

                                                    <TouchableWithoutFeedback onPress={() => this._heartHandle(index, index2 + 1)} >
                                                        <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                            {info2.isLiked ? <Ionicons color={Colors.red} size={14} name='md-heart' style={{ margin: 0 }} /> : <Ionicons name='md-heart-empty' size={14} style={{ margin: 0 }} />}
                                                        </View>
                                                    </TouchableWithoutFeedback>

                                                </View>
                                            </TouchableWithoutFeedback>)}
                                    </View>

                                )
                                    :
                                    <View style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14 }}>! 첫번째 댓글을 달아주세요 !</Text>
                                    </View>
                                }
                                <View style={{ height: this.state.image ? 100 + this.state.btnLocation : 50 + this.state.btnLocation }} />

                            </ScrollView>
                            <View style={{ position: 'absolute', bottom: this.state.btnLocation, left: 0, right: 0 }}>
                                {this.state.image ?
                                    <View style={{ height: 50, width: '100%', alignItems: 'center', justifyContent: 'center', borderTopColor: '#dbdbdb', borderTopWidth: 1, backgroundColor: 'white' }}>
                                        <TouchableOpacity onPress={this._imageHandle} style={{ height: 36, flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ height: '100%', width: 36 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio), overflow: 'hidden', borderRadius: 5 }}><Image source={{ uri: this.state.image }} style={{ height: '100%', width: 36 * (this.state.ratio > MaxRatio ? MaxRatio : this.state.ratio < 1 / MaxRatio ? 1 / MaxRatio : this.state.ratio) }} /></View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this._imageDeleteHandle} style={{ position: 'absolute', right: 0, width: 50, hegith: 50, alignItems: 'center', justifyContent: 'center' }}>
                                            <AntDesign name='close' color={Colors.gray} size={20} />
                                        </TouchableOpacity>
                                    </View>
                                    : null}
                                <Mutation mutation={createReplyComment[this.typeIndex2]}>
                                    {(createPostReplyComment) => (
                                        <Mutation mutation={createComment[this.typeIndex2]}>
                                            {(createPostComment) => (
                                                <LinearGradient colors={[Colors.lightRed, Colors.lightBlue]} style={styles.FooterContainer} start={[0, 0]} end={[1, 1]} >
                                                    <TouchableOpacity onPress={this._imageAddHandle} style={{ width: 50, height: 36, marginleft: 8, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Entypo name='attachment' color='white' size={22} style={{ margin: 0 }} />
                                                    </TouchableOpacity>
                                                    <View style={styles.TextInputContainer}>
                                                        <TextInput editable={!this.state.isUploading} value={this.state.value} onChangeText={(text) => this.setState({ value: text })} maxLength={240} multiline={true} ref={myInput => this.myInput = myInput} placeholder={(this.state.clickedComment != null && this.state.clickedComment2 != null) ? this.state.clickedComment2 === 0 ? `${this.state.comments[this.state.clickedComment].name} 에게 댓글 달기...` : `${this.state.comments[this.state.clickedComment].replyComments[this.state.clickedComment2 - 1].name} 에게 댓글 달기...` : '댓글 달기...'} style={styles.TextInput} />
                                                        <TouchableOpacity onPress={() => {
                                                            if (this.state.isUploading) return;
                                                            if (this.state.value === '') {
                                                                if (Platform.OS === 'android') {
                                                                    ToastAndroid.show('내용을 입력해주세요', ToastAndroid.SHORT);
                                                                } else {
                                                                    Alert.alert("내용을 입력해 주세요");
                                                                }
                                                                return;
                                                            }
                                                            const index = this.state.count + 1;
                                                            this.setState({ isUploading: true, count: index });
                                                            setTimeout(() => this._checkTimeover(index), 20000);

                                                            if (this.state.clickedComment == null && this.state.clickedComment2 == null) {
                                                                if (this.state.image !== null) {
                                                                    try {
                                                                        ImageManipulator.manipulateAsync(this.state.image, [], { compress: 0.7, format: 'jpeg' }).then(response => {
                                                                            RNS3.put(this.getFile(response.uri), options).then(res => {
                                                                                const input = {
                                                                                    content: this.state.value,
                                                                                    pics: res.body.postResponse.location,
                                                                                    ratio: this.state.ratio,
                                                                                    userid: this.state.userid
                                                                                }
                                                                                createPostComment({ variables: { postid: this.props.postid, input: input } }).then(response => {
                                                                                    this.setState({ value: '', isUploading: false, image: null });
                                                                                    this._refresh(true, this.state.clickedComment);
                                                                                })
                                                                            })
                                                                        });
                                                                    } catch {
                                                                        this.setState({ value: '실패...', isUploading: false });
                                                                    }
                                                                } else {
                                                                    const input = {
                                                                        content: this.state.value,
                                                                        pics: null,
                                                                        ratio: null,
                                                                        userid: this.state.userid
                                                                    }
                                                                    try {
                                                                        createPostComment({ variables: { postid: this.props.postid, input: input } }).then(response => {
                                                                            this.setState({ value: '', isUploading: false });
                                                                            this._refresh(true, this.state.clickedComment);
                                                                        })
                                                                    }
                                                                    catch
                                                                    {
                                                                        this.setState({ value: '실패...', isUploading: false });
                                                                    }
                                                                }

                                                            } else {
                                                                if (this.state.image !== null) {
                                                                    try {
                                                                        ImageManipulator.manipulateAsync(this.state.image, [], { compress: 0.7, format: 'jpeg' }).then(response => {
                                                                            RNS3.put(this.getFile(response.uri), options).then(res => {
                                                                                const input = {
                                                                                    content: this.state.value,
                                                                                    to: this.state.clickedComment2 != 0 ? this.state.comments[this.state.clickedComment].replyComments[this.state.clickedComment2 - 1].name : null,
                                                                                    pics: res.body.postResponse.location,
                                                                                    ratio: this.state.ratio,
                                                                                    userid: this.state.userid,
                                                                                    toUserid: this.state.clickedComment2 != 0 ? this.state.comments[this.state.clickedComment].replyComments[this.state.clickedComment2 - 1].userid : null,
                                                                                }
                                                                                createPostReplyComment({ variables: { postid: this.props.postid, commentNum: this.state.clickedComment, input: input } }).then(response => {
                                                                                    const c = this.state.clickedComment;
                                                                                    this.setState({ value: '', isUploading: false, clickedComment: null, clickedComment2: null, image: null });
                                                                                    this._refresh(false, c);
                                                                                })
                                                                            })
                                                                        });
                                                                    } catch {
                                                                        this.setState({ value: '실패...', isUploading: false });
                                                                    }
                                                                } else {
                                                                    const input = {
                                                                        content: this.state.value,
                                                                        to: this.state.clickedComment2 != 0 ? this.state.comments[this.state.clickedComment].replyComments[this.state.clickedComment2 - 1].name : null,
                                                                        pics: null,
                                                                        ratio: null,
                                                                        userid: this.state.userid,
                                                                        toUserid: this.state.clickedComment2 != 0 ? this.state.comments[this.state.clickedComment].replyComments[this.state.clickedComment2 - 1].userid : null,
                                                                    }
                                                                    try {
                                                                        createPostReplyComment({ variables: { postid: this.props.postid, commentNum: this.state.clickedComment, input: input } }).then(response => {
                                                                            const c = this.state.clickedComment;
                                                                            this.setState({ value: '', isUploading: false, clickedComment: null, clickedComment2: null });
                                                                            this._refresh(false, c);
                                                                        })
                                                                    }
                                                                    catch
                                                                    {
                                                                        this.setState({ value: '실패...', isUploading: false });
                                                                    }
                                                                }
                                                            }
                                                        }} style={{ width: 40, height: 20, alignItems: 'center', flexDirection: 'row', padding: 0, justifyContent: 'center' }}>
                                                            {this.state.isUploading ? <ActivityIndicator size='small' color={Colors.highlightBlue} /> : <Text style={{ color: Colors.highlightBlue, textAlign: 'right', lineHeight: 20, fontSize: 14 }}>게시</Text>}
                                                        </TouchableOpacity>
                                                    </View>
                                                </LinearGradient>)
                                            }
                                        </Mutation>
                                    )
                                    }
                                </Mutation>

                            </View>


                            <MyActionSheet
                                visible={this.state.visible}
                                contents={['앨범에서 가져오기', '카메라로 촬영하기']}
                                onClicked={(data) => this._actionSheetHandle(data)}
                                closeHandle={() => this.setState({ visible: false })} />
                            <MyActionSheet
                                visible={this.state.longVisible}
                                contents={this.state.longOption}
                                onClicked={(data) => this._longPressCallback(data)}
                                closeHandle={() => this.setState({ longVisible: false })} />
                        </View>
                    </View>
                }}

            </Query>
        )
    }
}
export default class CommentQueryContainer extends Component {
    static navigationOptions = { title: '댓글' };
    constructor(props) {
        super(props);
        this.typeIndex = type2Num(this.props.navigation.state.params.type)
    }
    render() {
        return (
            <Mutation mutation={deleteComment[this.typeIndex]}>
                {(deletePostComment) => (
                    <Mutation mutation={likeComment[this.typeIndex]}>
                        {(likePostComment) => (
                            <Mutation mutation={report}>
                                {(reportMutation) => (
                                    <CommentScreen report={reportMutation} type={this.props.navigation.state.params.type} typeIndex={this.props.navigation.state.params.type} deleteComment={deletePostComment} likeComment={likePostComment} postid={this.props.navigation.state.params.postid} navigation={this.props.navigation} />
                                )}
                            </Mutation>
                        )}
                    </Mutation>
                )}
            </Mutation>

        )
    }

}

function type2Num(type) {
    switch (type) {
        case undefined: return 0;
        case 'notification': return 1;
        case 'exam': return 2;
        case 'contest': return 3;
        case 'homework': return 4;
        case 'event': return 5;
    }
}

const styles = StyleSheet.create({
    Container: {

    },
    FooterContainer: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 7
    },
    TextInputContainer: {
        paddingVertical: 5,
        width: WIDTH - 66,
        borderRadius: 18,
        backgroundColor: 'white',
        paddingHorizontal: 18,
        alignItems: 'center',
        flexDirection: 'row',
    },
    TextInput: {
        width: WIDTH - 136,
        lineHeight: 20,
        margin: 0,
        padding: 0,
    }

})
