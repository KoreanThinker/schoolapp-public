import React, { Component } from 'react'
import { Text, View, Image, Dimensions, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, AsyncStorage, ToastAndroid, Alert, Platform } from 'react-native'
import { Colors } from '../Components/Asset';
import { BaseButton } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BookmarkFill from '../Icons/bookmarkFill.svg';
import BookmarkEmpty from '../Icons/bookmarkEmpty.svg';
import HeartFill from '../Icons/heartFill.svg';
import HeartEmpty from '../Icons/heartEmpty.svg';
import MyActionSheet from '../Components/MyActionSheet';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { StackActions, NavigationActions } from 'react-navigation';
import Hyperlink from 'react-native-hyperlink'

const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});


const WIDTH = Dimensions.get('window').width;
const maxRatio = 1.5;

const getPost = gql`
query getPost($postid: String!, $userid: String) {
    getPost(postid: $postid, userid: $userid) {
        name
        pics
        time
        tags
        description
        ratio
        isLiked
        likeNum
        isBookmarked
        commentNum
        userid
    }
}
`
const deletePost = gql`
mutation deletePost($postid: String) {
    deletePost(postid: $postid) {
        createdAt
    }
}
`

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

const report = gql`
mutation createReport($input: CreateReportFormInput!) {
    createReport(input: $input) {
        id
    }
}
`



export default class DetailScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('PostUserName'),
            headerRight: (
                <BaseButton onPress={navigation.getParam('openModal')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <AntDesign accessible name='ellipsis1' size={24} />
                </BaseButton>
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            page: 1,
            visible: false,
            userid: null,
            loading: true,
            isDeleting: false,
        }
    }
    async componentDidMount() {
        this.props.navigation.setParams({ openModal: this._openModal });
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id, loading: false });
    }
    _openModal = () => {
        if (this.state.data === null) return;
        this.setState({ visible: true });
    }
    _likeHandle = () => {
        if (this.state.isDeleting) return;
        if (this.state.userid === null) return;
        this.likePost({ variables: { postid: this.props.navigation.state.params.postid, userid: this.state.userid, isLiked: this.state.data.isLiked } }).then(res => {
            return;
        });
        let d = this.state.data;
        d.isLiked ? d.likeNum-- : d.likeNum++;
        d.isLiked = !d.isLiked;
        this.setState({
            data: d,
        })
    }
    _bookmarkHandle = () => {
        if (this.state.isDeleting) return;
        if (this.state.userid === null) return;
        this.bookmarkPost({ variables: { postid: this.props.navigation.state.params.postid, userid: this.state.userid, isBookmarked: this.state.data.isBookmarked } }).then(res => {
            return;
        });
        let d = this.state.data;
        d.isBookmarked = !d.isBookmarked;
        this.setState({
            data: d,
        })
    }
    _commentHandle = () => {
        if (this.state.isDeleting) return;
        this.props.navigation.navigate('Comment', { postid: this.props.navigation.state.params.postid });
    }
    _closeTabByDeleted = () => {
        this.props.navigation.goBack();
    }
    render() {
        return (
            this.state.loading || this.state.isDeleting
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                :
                <Query query={getPost} variables={{ postid: this.props.navigation.state.params.postid, userid: this.state.userid }} fetchPolicy="network-only" onCompleted={data => {
                    if (data.getPost === null) {
                        this._closeTabByDeleted();
                        return;
                    }
                    this.setState({ data: data.getPost });
                    this.props.navigation.setParams({ PostUserName: data.getPost.name });
                }}>
                    {({ loading, error, data }) => {
                        if (loading || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                        if (error) {
                            return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: Colors.red, fontSize: 14 }}>오류</Text>
                            </View>
                        }
                        return <View style={{ flex: 1 }}>
                            <Mutation mutation={deletePost}>
                                {(deletePost) => {
                                    if (this.deletePost === undefined) this.deletePost = deletePost;
                                    return null;
                                }}
                            </Mutation>
                            <Mutation mutation={likePost}>
                                {(likePost) => {
                                    if (this.likePost === undefined) this.likePost = likePost;
                                    return null;
                                }}
                            </Mutation>
                            <Mutation mutation={bookmarkPost}>
                                {(bookmarkPost) => {
                                    if (this.bookmarkPost === undefined) this.bookmarkPost = bookmarkPost;
                                    return null;
                                }}
                            </Mutation>
                            <Mutation mutation={report}>
                                {(reportPost) => {
                                    if (this.report === undefined) this.report = reportPost;
                                    return null;
                                }}
                            </Mutation>
                            <ScrollView overScrollMode='never'>
                                {this.state.data.pics && <View>
                                    <ScrollView pagingEnabled={true} horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never' style={{ width: '100%' }} scrollEventThrottle={16} onScroll={(event) => {
                                        const page = Math.round(event.nativeEvent.contentOffset.x / WIDTH) + 1;
                                        this.setState({
                                            page: page,
                                        })
                                    }}>
                                        {this.state.data.pics.map((img, index2) =>
                                            <TouchableOpacity key={index2} activeOpacity={1} onPress={() => this.props.navigation.navigate('Photo', { image: this.state.data.pics, index: index2 })}>
                                                <Image source={{ uri: img }} style={{ width: WIDTH, height: WIDTH / (this.state.data.ratio > maxRatio ? maxRatio : this.state.data.ratio < 1 / maxRatio ? 1 / maxRatio : this.state.data.ratio) }} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                    {this.state.data.pics.length > 1 &&
                                        <View style={{ height: 20, width: 40, borderRadius: 20, backgroundColor: '#4b4b4b80', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 10, top: 10, }}>
                                            <Text style={{ color: 'white', fontSize: 12 }}>{this.state.page}/{this.state.data.pics.length}</Text>
                                        </View>
                                    }
                                </View>}

                                <View style={{ width: WIDTH, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ flexDirection: 'row' }}>
                                        {this.state.data.tags.filter(t => t !== '*').map(
                                            (text, index) => (
                                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 5, marginRight: 5 }}>
                                                    <View style={{
                                                        width: 4, height: 4, borderRadius: 2, marginRight: 4,
                                                        backgroundColor: (index % 2 == 0 ? Colors.blue : Colors.red)
                                                    }} />
                                                    <Text style={{ fontSize: 14 }}>{text}</Text>
                                                </View>
                                            )
                                        )}
                                    </View>
                                </View>

                                <View style={{ paddingHorizontal: 20, marginBottom: 60 }}>

                                    <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>{this.state.data.description}</Text>
                                    </Hyperlink>
                                    <Text style={{ fontSize: 12, color: Colors.lightGray, fontWeight: 'bold' }}>
                                        {this.state.data.time} · 좋아요{this.state.data.likeNum} · 댓글{this.state.data.commentNum}
                                    </Text>
                                </View>
                            </ScrollView>
                            <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={{ height: 44, width: WIDTH, flexDirection: 'row', alignItems: 'center' }} start={[0, 0]} end={[1, 1]} >

                                <BaseButton style={styles.BottomBarContent} onPress={this._likeHandle}>
                                    {this.state.data.isLiked ? <HeartFill /> : <HeartEmpty />}
                                    <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>좋아요</Text>
                                </BaseButton>
                                <BaseButton onPress={this._commentHandle} style={{ height: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                                    <Text style={{ color: 'white', fontSize: 14 }} >댓글</Text>
                                </BaseButton>
                                <BaseButton style={styles.BottomBarContent} onPress={this._bookmarkHandle}>
                                    {this.state.data.isBookmarked ? <BookmarkFill /> : <BookmarkEmpty />}
                                    <Text style={{ color: 'white', marginLeft: 8, fontSize: 14 }}>북마크</Text>
                                </BaseButton>
                            </LinearGradient>

                            <MyActionSheet
                                visible={this.state.visible}
                                contents={this.state.data.userid === this.state.userid ? ['삭제하기'] : ['신고하기']}
                                onClicked={(data) => {
                                    if (this.state.isDeleting) return;
                                    if (this.state.data.userid === this.state.userid) {
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
                                                        this.deletePost({ variables: { postid: this.props.navigation.state.params.postid } }).then(() => {
                                                            this.props.navigation.dispatch(resetAction);
                                                        })
                                                    }
                                                },
                                            ],
                                            { cancelable: false },
                                        );
                                    } else {
                                        const input = {
                                            postid: this.props.navigation.state.params.postid,
                                            postType: 'mainPost',
                                            message: this.state.userid + '님이 ' + this.state.data.name + '님의 댓글을 신고하셨습니다',
                                            shortage: this.state.data.description,
                                        }

                                        this.report({ variables: { input: input } }).then(() => {
                                            if (Platform.OS === 'android') {
                                                ToastAndroid.show('접수되었습니다', ToastAndroid.SHORT);
                                            } else {
                                                Alert.alert("접수되었습니다");
                                            }
                                        })
                                    }
                                }}
                                closeHandle={() => this.setState({ visible: false })} />
                        </View>
                    }}
                </Query>
        )
    }
}
const styles = StyleSheet.create({
    BottomBarContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flex: 1
    }
})