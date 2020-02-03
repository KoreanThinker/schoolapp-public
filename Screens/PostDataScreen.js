import React, { Component } from 'react'
import { Text, View, ScrollView, Dimensions, TouchableWithoutFeedback, Image, TouchableOpacity, ActivityIndicator, AsyncStorage, RefreshControl, FlatList } from 'react-native'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Colors } from '../Components/Asset';

const WIDTH = Dimensions.get('window').width;

const LIMIT = 50;

const myPostList = gql`
query listPostsByUserid($userid: String!, $limit: Int, $nextToken: String) {
    listPostsByUserid(userid: $userid, limit: $limit, nextToken: $nextToken) {
        nextToken
        items {
            pics
            postid
            description
            likeNum
            commentNum
            time
        }
    }
}
`
export class MyPostScreen extends Component {
    static navigationOptions = { title: '작성글' };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            userid: null,
            isFirst: true,
            moring: false,
            nextToken: '',
            refreshing: false,
        }
        this.listLength = 0;
        this.isMoring = false;
    }
    async componentDidMount() {
        let userid = await AsyncStorage.getItem('ID');
        if (userid === null) this.props.navigation.goBack();
        this.setState({ userid: userid });
    }
    _handle(postid) {
        this.props.navigation.navigate('Detail', { postid: postid });
    }
    _fetchMore = () => {
        if (this.isMoring || this.state.nextToken === null) return;
        this.setState({ moring: !this.state.moring });
        this.isMoring = true;
        this.fetchMore({
            variables: {
                limit: LIMIT,
                nextToken: this.state.nextToken
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                this.setState({ moring: false });
                this.isMoring = false;
                if (!fetchMoreResult) return prev;
                const post = {
                    listPostsByUserid: {
                        __typename: prev.listPostsByUserid.__typename,
                        nextToken: fetchMoreResult.listPostsByUserid.nextToken,
                        items: [...prev.listPostsByUserid.items, ...fetchMoreResult.listPostsByUserid.items],
                    },
                }
                return post;
            }
        })
    }
    render() {
        return (
            this.state.userid === null
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                :
                <Query query={myPostList} variables={{ userid: this.state.userid, limit: LIMIT, nextToken: '' }} fetchPolicy='network-only'
                    onCompleted={data => {
                        this.setState({ data: data.listPostsByUserid.items, nextToken: data.listPostsByUserid.nextToken, isFirst: false });
                        if (data.listPostsByUserid.items.length === this.listLength) this._fetchMore();
                        this.listLength = data.listPostsByUserid.items.length;
                    }}>
                    {({ loading, fetchMore, refetch }) => {
                        if (this.fetchMore == undefined) this.fetchMore = fetchMore;
                        if (loading && this.state.isFirst) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                        return <FlatList
                            // refreshing={this.state.refreshing}
                            // onRefresh={() => {
                            //     this.setState({ refreshing: true });
                            //     refetch().then(res => {
                            //         this.setState({ refreshing: false });
                            //     });
                            // }}
                            onEndReached={this._fetchMore}
                            onEndReachedThreshold={1}
                            keyExtractor={(item, index) => item.postid}
                            data={this.state.data}
                            ListFooterComponent={() => this.state.nextToken ? <View style={{ width: WIDTH, alignItems: 'center' }}>
                                <ActivityIndicator color='#ddd' size='large' />
                            </View> : null}
                            renderItem={({ item }) => {
                                const data = item;
                                return <TouchableWithoutFeedback onPress={() => this._handle(data.postid)}>
                                    <View style={{ width: WIDTH, height: 70, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
                                        {data.pics && data.pics.length > 0 &&
                                            <View style={{ width: 54, height: 54, marginRight: 10, borderRadius: 10, overflow: 'hidden' }}>
                                                <Image source={{ uri: data.pics[0] }} style={{ width: 54, height: 54 }} />
                                            </View>

                                        }

                                        <View style={{ height: 60, width: data.image == '' ? WIDTH - 40 : WIDTH - 104, justifyContent: 'center' }}>
                                            <View>
                                                <Text style={{ fontSize: 14, lineHeight: 20, width: '100%' }} numberOfLines={2} ellipsizeMode='tail'>
                                                    {data.description}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: '#444', lineHeight: 14 }} >
                                                    {data.time} · 좋아요 {data.likeNum} · 댓글 {data.commentNum}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            }}
                        />
                    }}
                </Query>
        )
    }
}


const myCommentList = gql`
query listPostsCommentsByUserid($userid: String!, $limit: Int, $nextToken: String) {
    listPostsCommentsByUserid(userid: $userid, limit: $limit, nextToken: $nextToken) {
        nextToken
        items {
            pics
            postid
            description
            likeNum
            commentNum
            time
        }
    }
}
`

let commentNextToken = "";
let commentMoring = false;
export class MyCommentScreen extends Component {
    static navigationOptions = { title: '댓글단 글' };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            userid: null,
            isFirst: true,
            moring: false,
            nextToken: '',
            refreshing: false,
        }
        commentMoring = false;
        commentNextToken = "";
        this.listLength = 0;
    }
    async componentDidMount() {
        let userid = await AsyncStorage.getItem('ID');
        if (userid === null) this.props.navigation.goBack();
        this.setState({ userid: userid });
    }
    _handle(postid) {
        this.props.navigation.navigate('Detail', { postid: postid });
    }
    _fetchMore = () => {
        if (commentMoring || commentNextToken === null) return;
        commentMoring = true;
        this.setState({ moring: !this.state.moring });
        this.fetchMore({
            variables: {
                limit: LIMIT,
                nextToken: this.state.nextToken
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                this.setState({ moring: false });
                commentMoring = false;
                if (!fetchMoreResult) return prev;;
                const post = {
                    listPostsCommentsByUserid: {
                        __typename: prev.listPostsCommentsByUserid.__typename,
                        nextToken: fetchMoreResult.listPostsCommentsByUserid.nextToken,
                        items: [...prev.listPostsCommentsByUserid.items, ...fetchMoreResult.listPostsCommentsByUserid.items],
                    },
                }
                return post;
            }
        })
    }
    render() {
        return (
            this.state.userid === null
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                :
                <Query query={myCommentList} variables={{ userid: this.state.userid, limit: LIMIT, nextToken: '' }} fetchPolicy='network-only'
                    onCompleted={data => {
                        this.setState({ data: data.listPostsCommentsByUserid.items, nextToken: data.listPostsCommentsByUserid.nextToken, isFirst: false });
                        commentNextToken = data.listPostsCommentsByUserid.nextToken;
                        if (data.listPostsCommentsByUserid.items.length === this.listLength) this._fetchMore();
                        this.listLength = data.listPostsCommentsByUserid.items.length;
                    }}>
                    {({ loading, fetchMore, refetch }) => {
                        if (this.fetchMore == undefined) this.fetchMore = fetchMore;
                        if (loading && this.state.isFirst) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                        return <FlatList
                            // refreshing={this.state.refreshing}
                            // onRefresh={() => {
                            //     this.setState({ refreshing: true });
                            //     refetch().then(res => {
                            //         this.setState({ refreshing: false });
                            //     });
                            // }}
                            onEndReached={this._fetchMore}
                            keyExtractor={(item, index) => item.postid}
                            data={this.state.data}
                            ListFooterComponent={() => this.state.nextToken ? <View style={{ width: WIDTH, alignItems: 'center' }}>
                                <ActivityIndicator color='#ddd' size='large' />
                            </View> : null}
                            renderItem={({ item }) => {
                                const data = item;
                                return <TouchableWithoutFeedback onPress={() => this._handle(data.postid)}>
                                    <View style={{ width: WIDTH, height: 70, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
                                        {data.pics && data.pics.length > 0 &&
                                            <View style={{ width: 54, height: 54, marginRight: 10, borderRadius: 10, overflow: 'hidden' }}>
                                                <Image source={{ uri: data.pics[0] }} style={{ width: 54, height: 54 }} />
                                            </View>

                                        }

                                        <View style={{ height: 60, width: data.image == '' ? WIDTH - 40 : WIDTH - 104, justifyContent: 'center' }}>
                                            <View>
                                                <Text style={{ fontSize: 14, lineHeight: 20, width: '100%' }} numberOfLines={2} ellipsizeMode='tail'>
                                                    {data.description}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: '#444', lineHeight: 14 }} >
                                                    {data.time} · 좋아요 {data.likeNum} · 댓글 {data.commentNum}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            }}
                        />
                    }}
                </Query>
        )
    }
}

const bookmarkList = gql`
query listPostsByBookmark($userid: String!, $limit: Int, $nextToken: String) {
    listPostsByBookmark(userid: $userid, limit: $limit, nextToken: $nextToken) {
        nextToken
        items {
            pics
            postid
            description
            likeNum
            commentNum
            time
            name
        }
    }
}
`


export class BookmarkScreen extends Component {
    static navigationOptions = { title: '북마크' };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            userid: null,
            isFirst: true,
            moring: false,
            nextToken: '',
            refreshing: false,
        }
        this.listLength = 0;
        this.isMoring = false;
    }
    async componentDidMount() {
        let userid = await AsyncStorage.getItem('ID');
        if (userid === null) this.props.navigation.goBack();
        this.setState({ userid: userid });
    }
    _handle(postid) {
        this.props.navigation.navigate('Detail', { postid: postid });
    }
    _fetchMore = () => {
        if (this.isMoring || this.state.nextToken === null) return;
        this.setState({ moring: !this.state.moring });
        this.isMoring = true;
        this.fetchMore({
            variables: {
                limit: LIMIT,
                nextToken: this.state.nextToken
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                this.setState({ moring: false });
                this.isMoring = false;
                if (!fetchMoreResult) return prev;
                const post = {
                    listPostsByBookmark: {
                        __typename: prev.listPostsByBookmark.__typename,
                        nextToken: fetchMoreResult.listPostsByBookmark.nextToken,
                        items: [...prev.listPostsByBookmark.items, ...fetchMoreResult.listPostsByBookmark.items],
                    },
                }
                return post;
            }
        })
    }
    render() {
        return (
            this.state.userid === null
                ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                :
                <Query query={bookmarkList} variables={{ userid: this.state.userid, limit: LIMIT, nextToken: '' }} fetchPolicy='network-only'
                    onCompleted={data => {
                        this.setState({ data: data.listPostsByBookmark.items, nextToken: data.listPostsByBookmark.nextToken, isFirst: false });
                        this.state.nextToken = data.listPostsByBookmark.nextToken;
                        // console.log(data.listPostsByBookmark.items.length + " : " + this.listLength);
                        if (data.listPostsByBookmark.items.length === this.listLength) {
                            this._fetchMore();
                        }
                        this.listLength = data.listPostsByBookmark.items.length;
                    }}>
                    {({ loading, fetchMore, refetch }) => {
                        if (this.fetchMore == undefined) this.fetchMore = fetchMore;
                        if (loading && this.state.isFirst) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                        return <FlatList
                            // refreshing={this.state.refreshing}
                            // onRefresh={() => {
                            //     this.setState({ refreshing: true });
                            //     refetch().then(res => {
                            //         this.setState({ refreshing: false });
                            //     });
                            // }}
                            onEndReached={() => {
                                // console.log("end");
                                this._fetchMore()
                            }}
                            keyExtractor={(item, index) => item.postid}
                            data={this.state.data}
                            ListFooterComponent={() => this.state.nextToken ? <View style={{ width: WIDTH, alignItems: 'center' }}>
                                <ActivityIndicator color='#ddd' size='large' />
                            </View> : null}
                            renderItem={({ item }) => {
                                const data = item;
                                return <TouchableWithoutFeedback id={data.id} onPress={() => this._handle(data.postid)}>
                                    <View style={{ width: WIDTH, height: 70, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
                                        {data.pics && data.pics.length > 0 &&
                                            <View style={{ width: 54, height: 54, marginRight: 10, borderRadius: 10, overflow: 'hidden' }}>
                                                <Image source={{ uri: data.pics[0] }} style={{ width: 54, height: 54 }} />
                                            </View>

                                        }

                                        <View style={{ height: 60, width: data.image == '' ? WIDTH - 40 : WIDTH - 104, justifyContent: 'center' }}>
                                            <View>
                                                <Text style={{ fontSize: 14, lineHeight: 20, width: '100%' }} numberOfLines={2} ellipsizeMode='tail'>
                                                    {data.description}
                                                </Text>
                                                <Text style={{ fontSize: 10, color: '#444', lineHeight: 14 }} >
                                                    {data.name} · {data.time} · 좋아요 {data.likeNum} · 댓글 {data.commentNum}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableWithoutFeedback>
                            }
                            }
                        />
                    }}
                </Query>
        )
    }
}