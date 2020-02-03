import React, { Component } from 'react';
import { Text, View, ScrollView, Modal, Dimensions, TouchableWithoutFeedback, TouchableOpacity, Platform, TextInput, Alert, Image, ActivityIndicator, AsyncStorage, FlatList } from 'react-native';
import ActionSheet from '../Components/MyActionSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../Components/Asset';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { BaseButton } from 'react-native-gesture-handler';
import { AntDesign, FontAwesome, Ionicons, EvilIcons } from '@expo/vector-icons';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const BARHEIGHT = getStatusBarHeight();

const LIMIT = 50;

const searchList = gql`
query listPostsByTags($tags: [String], $content: String, $limit: Int, $nextToken: String) {
    listPostsByTags(tags: $tags, content: $content, limit: $limit, nextToken: $nextToken) {
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

const getTags = gql`
query getTags {
    getTags {
        groups {
            items
        }
    }
}
`
let myContent = null;

export default class SearchScreen extends Component {
    static navigationOptions = {
        title: '검색',
        headerStyle: {
            shadowColor: "clear",
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
            borderBottomWidth: 0,
            borderBOttomColor: 'clear',
            height: 50
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            tagVisible: false,
            searchVisible: false,
            searchText: null,
            searchTextBeta: '',
            serachData: null,
            searchList: [],
            isSearching: false,
            tag: [[], [], [], []],
            clickedTag: ['*', '*', '*', '*'],
            isFirst: true,
            isFetchMoring: false,
            searchListLoading: true,
        }
        myContent = null;
        this.isFetchMoring = false;
        this.listLength = 0;
    }
    async componentDidMount() {
        const searchList = await AsyncStorage.getItem('SEARCHLIST');
        if (searchList === null) {
            this.setState({ searchList: null, searchListLoading: false });
        }
        const _searchList = JSON.parse(searchList);
        this.setState({ searchList: _searchList, searchListLoading: false });
    }
    _detailHandle(postid) {
        this.props.navigation.navigate('Detail', { postid: postid });
    }
    _fetchMore = () => {
        if (this.isFetchMoring || this.nextToken === null) return;
        this.setState({ isFetchMoring: true });
        this.isFetchMoring = true;
        this.fetchMore({
            variables: {
                limit: LIMIT,
                nextToken: this.nextToken,
                content: this.state.searchText,
                tags: this.state.clickedTag
            },
            updateQuery: (prev, { fetchMoreResult }) => {
                this.setState({ isFetchMoring: false });
                this.isFetchMoring = false;
                if (!fetchMoreResult) return prev;
                const post = {
                    listPostsByTags: {
                        __typename: prev.listPostsByTags.__typename,
                        nextToken: fetchMoreResult.listPostsByTags.nextToken,
                        items: [...prev.listPostsByTags.items, ...fetchMoreResult.listPostsByTags.items],
                    },
                }
                return post;
            }
        })
    }
    render() {
        return (
            <Query query={searchList} variables={{ limit: LIMIT, nextToken: "", content: this.state.searchText, tags: this.state.clickedTag }} fetchPolicy="network-only"
                onCompleted={data => {
                    if (this.state.isFirst) {
                        this.setState({ isFirst: false });
                        return;
                    }
                    this.setState({ serachData: data.listPostsByTags.items, nextToken: data.listPostsByTags.nextToken });
                    this.nextToken = data.listPostsByTags.nextToken;

                    if (data.listPostsByTags.items.length === this.listLength) this._fetchMore();
                    this.listLength = data.listPostsByTags.items.length;
                }}>
                {({ loading, error, data, fetchMore, refetch }) => {
                    if (this.fetchMore === undefined) this.fetchMore = fetchMore;
                    if (error) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 14, color: Colors.red }}>오류</Text></View>
                    return <View style={{ flex: 1 }}>

                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 50, backgroundColor: '#fff', paddingHorizontal: 20, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center' }}>
                            <View style={{ height: 36, width: WIDTH - 86, borderRadius: 18, marginRight: 10, overflow: 'hidden' }}>
                                <TouchableWithoutFeedback onPress={() => {
                                    if (this.state.isSearching) return;
                                    this.setState({ searchVisible: true })
                                }}>
                                    <LinearGradient colors={[Colors.lightRed, Colors.lightBlue]} style={{ height: 36, width: WIDTH - 86, alignItems: 'center', justifyContent: 'center' }} start={[0, 0]} end={[1, 1]}>
                                        <Text numberOfLines={1} style={{ fontSize: 14, color: 'white', width: WIDTH - 158, textAlign: 'center' }}>{this.state.searchText === null ? '이름, 내용으로 검색하기...' : this.state.searchText}</Text>
                                        {(this.state.searchTextBeta !== '' || this.state.clickedTag.filter(t => t === '*').length !== 4) &&
                                            <View style={{ width: 36, height: 36, position: 'absolute', right: 0, alignItems: 'center', justifyContent: 'center' }}>
                                                <TouchableWithoutFeedback onPress={() => {
                                                    this.setState({ searchText: null, searchTextBeta: '', clickedTag: ['*', '*', '*', '*'] })
                                                    myContent = null;
                                                }} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}>
                                                    <AntDesign name='close' color='white' size={18} style={{ marginRight: 10 }} />
                                                </TouchableWithoutFeedback>
                                            </View>
                                        }
                                    </LinearGradient>
                                </TouchableWithoutFeedback>
                            </View>
                            <TouchableWithoutFeedback style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                if (this.state.isSearching) return;
                                this.setState({ tagVisible: true })
                            }
                            }>
                                <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    <LinearGradient colors={[Colors.lightRed, Colors.lightBlue]} style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }} start={[0, 0]} end={[1, 1]} >
                                        {this.state.tagVisible ?
                                            <AntDesign name='close' color='white' size={18} /> :
                                            <FontAwesome name='tag' color='white' size={18} />
                                        }

                                    </LinearGradient>
                                </View>
                            </TouchableWithoutFeedback>

                        </View>

                        <View style={{ width: WIDTH, height: HEIGHT - 100, marginTop: 50 }} >
                            {this.state.searchText === null && this.state.clickedTag.filter(info => info === '*').length === 4 &&
                                <Text style={{ fontSize: 12, color: '#777', marginLeft: 20, marginTop: 14 }}>검색어를 입력해주세요 ↑</Text>}
                            {loading ?
                                (this.state.searchText !== null || this.state.clickedTag.filter(t => t === '*').length !== 4) &&
                                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
                                    <ActivityIndicator size='large' color='#dddddd' />
                                </View>
                                :
                                this.state.serachData && this.state.serachData.length > 0 && (this.state.searchTextBeta !== '' || this.state.clickedTag.filter(t => t === '*').length !== 4) &&
                                <FlatList
                                    style={{ flex: 1 }}
                                    showsVerticalScrollIndicator={false}
                                    overScrollMode="never"
                                    onEndReached={this._fetchMore}
                                    keyExtractor={(item, index) => item.postid}
                                    data={this.state.serachData}
                                    ListFooterComponent={
                                        this.state.nextToken !== null && <ActivityIndicator size='large' color='#dddddd' />
                                    }
                                    renderItem={({ item }) => {
                                        const data = item;
                                        return <TouchableWithoutFeedback onPress={() => this._detailHandle(data.postid)}>
                                            <View style={{ width: WIDTH, height: 70, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb', paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}>
                                                {data.pics && data.pics.length !== 0 &&
                                                    <View style={{ width: 54, height: 54, overflow: 'hidden', borderRadius: 10, marginRight: 10 }}>
                                                        <Image source={{ uri: data.pics[0] }} style={{ width: 54, height: 54 }} />
                                                    </View>}

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
                                    }}
                                />
                            }
                            {this.state.serachData != null && this.state.serachData.length === 0 && !loading && !(this.state.searchTextBeta === '' && this.state.clickedTag.filter(t => t === '*').length === 4) &&
                                <Text style={{ fontSize: 12, color: '#777', marginLeft: 20, marginTop: 14 }}>검색정보가 없습니다</Text>}
                        </View>

                        <Query query={getTags} fetchPolicy='cache-and-network'
                            onCompleted={data => {
                                let tag = [
                                    [...data.getTags.groups[0].items],
                                    [...data.getTags.groups[1].items],
                                    [...data.getTags.groups[2].items],
                                    [...data.getTags.groups[3].items]
                                ]
                                this.setState({ tag: tag });
                            }}>
                            {({ loading }) => {
                                return <Modal
                                    animationType='slide'
                                    transparent={true}
                                    visible={this.state.tagVisible}
                                    onRequestClose={() => {
                                        this.setState({ tagVisible: false });
                                        refetch();
                                    }}>

                                    <View style={{ width: WIDTH, height: Platform.OS === 'ios' ? 100 + BARHEIGHT : 100 }}>
                                        <TouchableOpacity style={{ width: '100%', height: '100%' }} onPress={() => {
                                            this.setState({ tagVisible: false });
                                            refetch();
                                        }}>

                                        </TouchableOpacity>
                                    </View>
                                    <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', height: Platform.OS === 'ios' ? HEIGHT - 100 - BARHEIGHT : HEIGHT - 100 }}>
                                        <ScrollView style={{ flex: 1 }} overScrollMode='never'>
                                            <View>
                                                <View style={{ height: 40, justifyContent: 'center' }}>

                                                </View>
                                                {loading
                                                    ?
                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <ActivityIndicator size='large' color='#eee' />
                                                    </View>
                                                    :
                                                    <View style={{ marginBottom: 10 }}>
                                                        {this.state.tag.map((data, index) =>
                                                            <View key={index}>
                                                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never'>
                                                                    <View style={{ paddingHorizontal: 34, height: 50, flexDirection: 'row', alignItems: 'center' }}>
                                                                        <TouchableWithoutFeedback onPress={() => {
                                                                            const c = this.state.clickedTag;
                                                                            c[index] = '*';
                                                                            this.setState({ clickedTag: c })
                                                                        }
                                                                        }>
                                                                            <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.clickedTag[index] == '*' ? '#888' : '#dbdbdb', backgroundColor: this.state.clickedTag[index] == '*' ? '#888' : 'white' }}>
                                                                                <Ionicons name='ios-close' size={16} color={this.state.clickedTag[index] == '*' ? 'white' : 'black'} />
                                                                            </View>
                                                                        </TouchableWithoutFeedback>
                                                                        {data.map((info, index2) =>
                                                                            <TouchableWithoutFeedback key={index2} onPress={() => {
                                                                                const c = this.state.clickedTag;
                                                                                c[index] = info;
                                                                                this.setState({ clickedTag: c })
                                                                            }}>
                                                                                <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.clickedTag[index] == info ? '#888' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.clickedTag[index] == info ? '#888' : 'white' }}>
                                                                                    <Text style={{ fontSize: 12, color: this.state.clickedTag[index] == info ? 'white' : 'black' }}>{info}</Text>
                                                                                </View>
                                                                            </TouchableWithoutFeedback>
                                                                        )}
                                                                    </View>
                                                                </ScrollView>
                                                            </View>
                                                        )}
                                                        <TouchableOpacity activeOpacity={0.4} onPress={() => {
                                                            this.setState({ tagVisible: false });
                                                            refetch();
                                                        }}>
                                                            <View style={{ alignItems: 'center', justifyContent: 'center', width: WIDTH, height: 50, marginTop: 10 }}>
                                                                <Text style={{ alignSelf: 'center', fontSize: 14, color: Colors.highlightBlue }}>닫기</Text>
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>}
                                            </View>
                                        </ScrollView>

                                    </View>

                                </Modal>
                            }}
                        </Query>

                        <Modal
                            animationType='none'
                            transparent={false}
                            visible={this.state.searchVisible}
                            onRequestClose={() => this.setState({ searchVisible: false, searchTextBeta: this.state.searchText === null ? '' : this.state.searchText })}
                            onShow={() => this.input.focus()}
                        >
                            <View style={{ flex: 1 }}>
                                <LinearGradient colors={[Colors.lightRed, Colors.lightBlue]} style={{ height: Platform.OS === 'ios' ? 60 + BARHEIGHT : 60, position: 'absolute', left: 0, right: 0, top: 0 }} start={[0, 0]} end={[1, 1]}>

                                </LinearGradient>
                                <View style={{ width: WIDTH, height: Platform.OS === 'ios' ? BARHEIGHT : 0 }} />
                                <View style={{ width: WIDTH, height: 60, alignItems: 'center', justifyContent: 'center' }}>
                                    <View style={{ height: 44, width: WIDTH - 16, backgroundColor: 'white', alignSelf: 'center', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center' }}>
                                        <TextInput multiline={false} ref={ref => this.input = ref} style={{ fontSize: 16, width: WIDTH - 84, marginRight: 10 }} value={this.state.searchTextBeta} placeholder='검색어입력' onChangeText={text => { this.setState({ searchTextBeta: text }) }}
                                            onSubmitEditing={() => {
                                                if (this.state.searchTextBeta !== '') {
                                                    this.setState({ searchText: this.state.searchTextBeta, searchVisible: false });
                                                    myContent = this.state.searchTextBeta;
                                                    if (this.state.searchList === null) {
                                                        let list = [this.state.searchTextBeta.toString()];
                                                        this.setState({ searchList: list });
                                                        AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                                        return;
                                                    }
                                                    let list = this.state.searchList.filter(t => true);
                                                    if (list.indexOf(this.state.searchTextBeta) > -1) {
                                                        list = list.filter(t => t !== this.state.searchTextBeta);
                                                        list.reverse();
                                                        list.push(this.state.searchTextBeta.toString());
                                                        list.reverse();
                                                    }
                                                    else if (list.length >= 20) {
                                                        const l = list.filter(t => true);
                                                        list[0] = this.state.searchTextBeta.toString();
                                                        for (let i = 1; i < 20; i++) {
                                                            list[i] = l[i - 1];
                                                        }
                                                    } else {
                                                        list.reverse();
                                                        list.push(this.state.searchTextBeta.toString());
                                                        list.reverse();
                                                    }
                                                    this.setState({ searchList: list });
                                                    AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                                } else {
                                                    Alert.alert('검색어를 입력해주세요');
                                                }
                                            }}
                                        />
                                        <TouchableWithoutFeedback onPress={() => {
                                            if (this.state.searchTextBeta !== '') {
                                                this.setState({ searchText: this.state.searchTextBeta, searchVisible: false });
                                                myContent = this.state.searchTextBeta;
                                                if (this.state.searchList === null) {
                                                    let list = [this.state.searchTextBeta.toString()];
                                                    this.setState({ searchList: list });
                                                    AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                                    return;
                                                }
                                                let list = this.state.searchList.filter(t => true);
                                                if (list.indexOf(this.state.searchTextBeta) > -1) {
                                                    list = list.filter(t => t !== this.state.searchTextBeta);
                                                    list.reverse();
                                                    list.push(this.state.searchTextBeta.toString());
                                                    list.reverse();
                                                }
                                                else if (list.length >= 20) {
                                                    const l = list.filter(t => true);
                                                    list[0] = this.state.searchTextBeta.toString();
                                                    for (let i = 1; i < 20; i++) {
                                                        list[i] = l[i - 1];
                                                    }
                                                } else {
                                                    list.reverse();
                                                    list.push(this.state.searchTextBeta.toString());
                                                    list.reverse();
                                                }
                                                this.setState({ searchList: list });
                                                AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                            } else {
                                                Alert.alert('검색어를 입력해주세요');
                                            }
                                        }} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                                            <AntDesign name='search1' color='#777' size={24} style={{ margin: 0 }} />
                                        </TouchableWithoutFeedback>
                                    </View>
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never' style={{ width: WIDTH, height: HEIGHT - 100 - BARHEIGHT }}>
                                    <View style={{ width: WIDTH, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                        <TouchableOpacity activeOpacity={1} onPress={() => this.setState({ searchVisible: false, searchTextBeta: this.state.searchText === null ? '' : this.state.searchText })} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <AntDesign name='arrowleft' size={16} />
                                            <Text style={{ fontSize: 14, marginLeft: 10 }}>뒤로가기</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity activeOpacity={1} onPress={() => { this.setState({ searchTextBeta: '' }) }} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                            <AntDesign name='close' size={16} />
                                            <Text style={{ fontSize: 14, marginLeft: 10 }}>검색어 지우기</Text>
                                        </TouchableOpacity>
                                        <View style={{ position: 'absolute', left: WIDTH / 2, width: 1, height: 16, backgroundColor: '#000', borderRadius: 0.5 }} />
                                    </View>
                                    <Text style={{ fontSize: 12, color: '#777', marginLeft: 30, marginTop: 4, marginBottom: 4 }}>최근 검색어</Text>

                                    <View>
                                        {this.state.searchListLoading
                                            ?
                                            <View style={{ width: '100%', height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                <ActivityIndicator size='large' color='#ddd' />
                                            </View>
                                            :
                                            this.state.searchList !== null && this.state.searchList.map((data, index) =>
                                                <View key={index} style={{ paddingLeft: 30, width: WIDTH, height: 50, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row', alignItems: 'center' }}>
                                                    <TouchableWithoutFeedback onPress={() => {
                                                        this.setState({ searchText: data, searchTextBeta: data, searchVisible: false });
                                                        myContent = data;
                                                        let list = this.state.searchList.filter(t => true);
                                                        list = list.filter(t => t !== data.toString());
                                                        list.reverse();
                                                        list.push(data.toString());
                                                        list.reverse();
                                                        this.setState({ searchList: list });
                                                        AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                                    }}>
                                                        <View style={{ width: WIDTH - 80, height: 50, justifyContent: 'center' }}>
                                                            <Text numberOfLines={1} style={{ fontSize: 14, textAlign: 'left', width: WIDTH - 110 }}>{data}</Text>
                                                        </View>
                                                    </TouchableWithoutFeedback>

                                                    <TouchableWithoutFeedback onPress={() => {
                                                        let list = this.state.searchList.filter(t => true);
                                                        list = list.filter(t => t !== data.toString());
                                                        this.setState({ searchList: list });
                                                        AsyncStorage.setItem('SEARCHLIST', JSON.stringify(list));
                                                    }}>
                                                        <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                                            <AntDesign name='close' size={16} />
                                                        </View>
                                                    </TouchableWithoutFeedback>
                                                </View>
                                            )}
                                    </View>

                                </ScrollView>
                            </View>

                        </Modal>
                    </View>

                }}
            </Query>
        )
    }
}
