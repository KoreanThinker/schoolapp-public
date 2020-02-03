import React, { Component } from 'react'
import { StyleSheet, View, ScrollView, StatusBar, Dimensions, Text, TouchableOpacity, Platform, AsyncStorage, Image, ActivityIndicator, TouchableWithoutFeedback, RefreshControl, ToastAndroid, Alert, Linking, FlatList, ListView } from 'react-native';
// import { LinearGradient, Constants } from 'expo';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../Components/Asset';
import { BaseButton } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import Hyperlink from 'react-native-hyperlink'
import { StackActions, NavigationActions } from 'react-navigation';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'A_Bottom' })],
});

const LIMIT = 10;
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
mutation deletePost($postid: String, $adminid: String) {
    deletePost(postid: $postid, adminid: $adminid) {
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
const Bus = [
    '35',
    '690',
    '720'
];
const MaxRatio = 2;
const MinRatio = 0.7;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

const SCROLLUNIT = (636 - WIDTH) / 4;

export default class MainScreen extends Component {
    static navigationOptions = {
        title: '게시물',
    }
    constructor(props) {
        super(props);
        this.state = {
            lowDataMode: false,
            isNewAlert: false,
            refreshing: false,
            isFirst: true,
            isMoring: false,
            data: null,
            Fontloading: true,
            userid: null,
            tokenValue: "",
            xOffset: SCROLLUNIT * 2 + ((WIDTH - 318) / 2),
            grade: 1,
            class_: 1,
            nextToken: '',
        }
        this.isMoring = false;
    }

    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });

    }
    componentWillUnmount() {
        this.listener && this.listener.remove();
    }
    _showMessage(text) {
        if (Platform.OS === 'android') {
            ToastAndroid.show(text, ToastAndroid.LONG);
        } else {
            Alert.alert(text);
        }
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
                <Query query={getListPost} variables={{ limit: LIMIT, nextToken: "" }} fetchPolicy="network-only"
                    onCompleted={data => {
                        this.setState({ data: data.listPosts.items, nextToken: data.listPosts.nextToken, isFirst: false });
                    }}>
                    {({ loading, error, data, fetchMore, refetch }) => {

                        if (this.mainRefetch === undefined) {
                            this.mainRefetch = refetch;
                        }
                        if (this.fetchMore === undefined) this.fetchMore = fetchMore;

                        return (
                            <View style={{ flex: 1 }}>
                                <StatusBar barStyle={Platform.OS == "android" ? "light-content" : "dark-content"} backgroundColor='#00000080' translucent={true} />

                                <FlatList
                                    progressViewOffset={0}
                                    style={{ zIndex: 0 }}
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
                                        </View>}

                                    ListEmptyComponent={() => <View style={{ height: 50, width: WIDTH, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color='#ddd' size='large' />
                                    </View>}
                                    renderItem={({ item }) => {
                                        const info = item
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
                                                                }} myid={this.state.userid} rank={info.rank} postid={info.postid} remove={deletePost} navigation={this.props.navigation} name={info.name} date={info.time} likeNum={info.likeNum} tag={info.tags} userid={info.userid} content={info.description} image={info.pics} ratio={info.ratio} lowDataMode={this.state.lowDataMode} commentNum={info.commentNum} />

                                                            </View>
                                                            : null)}
                                                </Mutation>
                                            )}</Mutation>
                                    }}
                                >

                                </FlatList>

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
            isLiked: false,
            isBookmarked: false,
            like: this.props.likeNum,
            view: false,
            visible: false,
            isDeleting: false,
        }
    }
    _imageClicked(source) {
        if (this.state.isDeleting) return;
        this.props.navigation.navigate('A_Photo', { image: this.props.image, index: (this.state.myPage - 1) });
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
        this.props.navigation.navigate('A_Comment', { postid: this.props.postid });
    }
    _callBack(data) {
        if (data === 0) {
            if (this.props.myid === this.props.userid) {
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
                                this.props.remove({ variables: { postid: this.props.postid } }).then(() => {
                                    this.setState({ isDeleting: false })
                                    this.props.navigation.dispatch(resetAction);
                                })
                            }
                        },
                    ],
                    { cancelable: false },
                );

            } else {
                const input = {
                    postid: this.props.postid,
                    postType: 'mainPost',
                    message: this.props.myid + '님이 ' + this.props.name + '님의 댓글을 신고하셨습니다',
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
            this.props.navigation.navigate('A_Detail', { postid: this.props.postid })
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
                                    <BaseButton onPress={this._commentHandle} style={{ height: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                                        <Text style={{ color: 'white', fontSize: 14 }} >댓글</Text>
                                    </BaseButton>
                                    <BaseButton onPress={() => {
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
                                                        this.props.remove({ variables: { postid: this.props.postid, adminid: `${this.props.myid}(${Constants.deviceName})` } }).then(() => {
                                                            this.setState({ isDeleting: false });
                                                            this.props.refresh();
                                                        })
                                                    }
                                                },
                                            ],
                                            { cancelable: false },
                                        );
                                    }} style={{ height: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                                        <Text style={{ color: 'white', fontSize: 14 }} >삭제</Text>
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
        height: 500
    },
    BottomContainer: { //radius
        position: 'absolute',
        top: 480,
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
        marginTop: 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 40,
        width: '100%'
    },
})