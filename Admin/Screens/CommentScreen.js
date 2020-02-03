import React, { Component } from 'react'
import { Text, StyleSheet, View, Keyboard, TextInput, Dimensions, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, AsyncStorage, RefreshControl, Platform, ActivityIndicator, Linking, ToastAndroid, Alert } from 'react-native'
import { Colors } from '../Components/Asset';
import { Entypo, AntDesign, Ionicons } from '@expo/vector-icons';
import MyActionSheet from '../Components/MyActionSheet';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { RNS3 } from 'react-native-aws3';;
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink'
import Constants from 'expo-constants';
//0 post 1 notification

const options = {
    keyPrefix: "uploads/commentImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: "",
    secretKey: "",
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
            lowDataMode: false,
            loading: false,
            isFirst: true,
            userid: null,
            postid: this.props.postid,
            isError: false,
        }
        this.type = this.props.type;
        this.postid = this.props.postid;
        this.typeIndex2 = type2Num(this.props.type);
    }

    async componentDidMount() {
        this.userid = await AsyncStorage.getItem('ID');
    }

    _commentHandle(index1, index2) { //클릭
        return;
        if (this.state.clickedComment === index1 && this.state.clickedComment2 === index2) {
            this.setState({ clickedComment: null, clickedComment2: null });
        }
        else this.setState({ clickedComment: index1, clickedComment2: index2 });
    }
    _longPressHandle(index, index2) {
        return;
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
        return;
        if (this.state.isDeleting) return;
        if (this.state.longOption[0] === '삭제하기') {
            this.setState({ isDeleting: true, clickedComment: null, clickedComment2: null });
            const replyNum = this.state.clickedComment2 === 0 ? null : this.state.clickedComment2 - 1;
            this.props.deleteComment({ variables: { postid: this.props.postid, commentNum: this.state.clickedComment, replyCommentNum: replyNum } }).then(() => {
                this.setState({ isDeleting: false });
                this._refresh(false);
            })
        } else {

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
    _heartHandle(index, index2) {
        const k = index2 === 0 ? null : index2 - 1;
        Alert.alert(
            '경고',
            '정말 삭제하시겠습니까',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '네', onPress: () => {
                        this.props.deleteComment({ variables: { postid: this.props.postid, commentNum: index, replyCommentNum: k, adminid: `${this.userid}(${Constants.deviceName})` } }).then(() => {
                            this._refresh(false);
                        })
                    }
                },
            ],
            { cancelable: false },
        );


        //서버업데이트
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

    render() {

        return (
            <Query query={getComment[this.typeIndex2]} variables={{ postid: this.postid, userid: this.state.userid }} fetchPolicy="network-only"
                onCompleted={data => {
                    if (data.getPost === null) {
                        this._closeTabByDeleted();
                        return;
                    }
                    if (!data || (data != null && typeof data == "object" && !Object.keys(data).length)) return;
                    try {
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
                    } catch {
                        this.setState({ isError: true });
                    }

                }}>
                {({ loading, error, data, refetch }) => {
                    if ((loading || this.state.loading) && this.isFirst === undefined) {
                        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <ActivityIndicator size='large' color='#ddd' />
                        </View>
                    }
                    if (error || this.state.isError) {
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

                                {this.state.comments !== null ? this.state.comments.map((info, index) =>
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
                                                            this.props.navigation.navigate('A_Photo', { image: info.pics });
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
                                                        <Text style={{ fontSize: 24 }}>×</Text>
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
                                                                this.props.navigation.navigate('A_Photo', { image: info2.pics });
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
                                                            <Text style={{ fontSize: 24 }}>×</Text>
                                                        </View>
                                                    </TouchableWithoutFeedback>

                                                </View>
                                            </TouchableWithoutFeedback>)}
                                    </View>

                                )
                                    :
                                    <View style={{ width: WIDTH, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14 }}>댓글 없음</Text>
                                    </View>
                                }
                                <View style={{ height: this.state.image ? 100 + this.state.btnLocation : 50 + this.state.btnLocation }} />

                            </ScrollView>
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
                    <CommentScreen type={this.props.navigation.state.params.type} typeIndex={this.props.navigation.state.params.type} deleteComment={deletePostComment} postid={this.props.navigation.state.params.postid} navigation={this.props.navigation} />
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
