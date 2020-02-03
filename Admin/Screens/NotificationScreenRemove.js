import React, { Component } from 'react'
import { Text, StyleSheet, View, Dimensions, ScrollView, Image, TouchableOpacity, ActivityIndicator, AsyncStorage, RefreshControl, Alert } from 'react-native'
import { BaseButton, TapGestureHandler } from 'react-native-gesture-handler';
import { Colors } from '../Components/Asset'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import MyActionSheet from '../Components/MyActionSheet';
import Hyperlink from 'react-native-hyperlink'
import Constants from 'expo-constants';

const WIDTH = Dimensions.get('window').width;
const maxRatio = 1.3;
//page imageview추가해야됨 시작할때
const listNotifications = gql`
query listNotifications {
    listNotifications {
        items {
            isAllowed
            postid
            date
            time
            title
            description
            pics
            ratio
            commentNum
            time
        }
    }
}
`

const listMyNotification = gql`
query listMyNotifications($userid: String!) {
        listMyNotifications(userid: $userid) {
            items {
              isPassed
              isAllowed
              postid
              userid
              createdAt
              time
              title
              description
              ratio
              pics
              date
              isLiked
              likeNum
              commentNum
            }
          }
    }
`

const deleteNotification = gql`
mutation deleteNotification($postid: String!, $adminid: String) {
    deleteNotification(postid: $postid, adminid: $adminid) {
        createdAt
    }
}
`
export default class NotificationScreenRemove extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '공지',

        }
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lowDataMode: false,
            visible: false,
            refreshing: false,
            pageData: [],
            viewData: [],
            userid: null,
        }
    }

    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id, loading: true });
    }
    _selectPostOption = () => {
        this.setState({ visible: true });
    }

    render() {
        return (
            <Query query={listNotifications} fetchPolicy='cache-and-network' onCompleted={data => {
                let d = new Array(data.listNotifications.items.length);;
                let v = new Array(data.listNotifications.items.length);
                for (let k = 0; k < data.listNotifications.items.length; k++) {
                    d[k] = 1;
                    d[v] = false;
                }
                this.setState({ pageData: d, viewData: v });
            }}>
                {({ loading, data, refetch }) => {
                    if (loading || !this.state.loading || data === null || data.listNotifications === undefined) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>
                    return <View style={{ flex: 1 }}>
                        <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never' style={{ flex: 1 }} refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true });
                                    refetch().then(res => {
                                        this.setState({ refreshing: false });
                                    });
                                }}
                            />}>
                            {data.listNotifications.items.length > 0 ? data.listNotifications.items.map((info, index) => <View key={index} style={{ width: WIDTH }}>
                                <View style={{ width: '100%', height: 40, flexDirection: 'row', alignItems: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, borderTopColor: '#dbdbdb', borderTopWidth: 0.5, }}>
                                    <Text style={{ marginLeft: 20, fontSize: 14 }} numberOfLines={1}>{info.title}</Text>
                                    <Text style={{ fontSize: 12, color: '#999', marginTop: 2, marginLeft: 2 }}> {info.time}</Text>
                                </View>

                                {!this.state.lowDataMode || this.state.viewData[index] ? <View>
                                    <ScrollView pagingEnabled horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never' style={{ width: '100%' }} scrollEventThrottle={16} onScroll={(event) => {
                                        const page = Math.round(event.nativeEvent.contentOffset.x / WIDTH) + 1;
                                        const d = this.state.pageData;
                                        d[index] = page;
                                        this.setState({
                                            pageData: d,
                                        })
                                    }}>
                                        {info.pics && info.pics.map((img, index2) =>
                                            <TouchableOpacity key={index2} activeOpacity={1} onPress={() => this.props.navigation.navigate('A_Photo', { image: info.pics, index: index2 })}>
                                                <Image key={index2} source={{ uri: img }} style={{ width: WIDTH, height: WIDTH / (info.ratio > maxRatio ? maxRatio : info.ratio < 1 / maxRatio ? 1 / maxRatio : info.ratio) }} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                    {info.pics && info.pics.length > 1 &&
                                        <View style={{ height: 20, width: 40, borderRadius: 20, backgroundColor: '#4b4b4b80', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 10, top: 10, }}>
                                            <Text style={{ color: 'white', fontSize: 12 }}>{this.state.pageData[index]}/{info.pics.length}</Text>
                                        </View>
                                    }
                                </View>
                                    : info.pics && info.pics.length !== 0 && <View style={{ height: 40, width: '100%', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                                        <BaseButton onPress={() => {
                                            let d = this.state.viewData;
                                            d[index] = true;
                                            this.setState({ viewData: d });
                                        }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>사진보기(데이터 절약모드)</Text>
                                        </BaseButton>
                                    </View>}

                                <View style={{ paddingHorizontal: 20, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, paddingVertical: 10 }}>

                                    <Hyperlink linkStyle={{ color: Colors.highlightBlue }} linkDefault={true}>
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>
                                            {info.description}
                                        </Text>
                                    </Hyperlink>
                                </View>
                                <Mutation mutation={deleteNotification} >
                                    {(deleteNotification) => (
                                        <View style={{ height: 40, flexDirection: 'row' }}>
                                            <BaseButton style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => this.props.navigation.navigate('A_Comment', { type: 'notification', postid: info.postid })}>
                                                {info.commentNum === 0
                                                    ?
                                                    <Text style={{ fontSize: 14 }}>댓글</Text>
                                                    :
                                                    <Text style={{ fontSize: 14 }}>댓글 · {info.commentNum}개</Text>}
                                            </BaseButton>
                                            <BaseButton onPress={() => {
                                                if (this.state.doing) return;
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
                                                                this.setState({ doing: true });
                                                                deleteNotification({ variables: { postid: info.postid, adminid: `${this.state.userid}(${Constants.deviceName})` } }).then(res => {
                                                                    this.setState({ refreshing: true });
                                                                    refetch().then(res => {
                                                                        this.setState({ refreshing: false, doing: false });
                                                                    });
                                                                })
                                                            }
                                                        },
                                                    ],
                                                    { cancelable: false },
                                                );

                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text>삭제</Text>
                                            </BaseButton>
                                        </View>
                                    )}
                                </Mutation>
                                <View style={{ width: '100%', height: 15, backgroundColor: '#ddd' }} />
                            </View>
                            ) : <Text style={{ fontSize: 14, alignSelf: 'center', marginTop: 20 }}>정보없음</Text>}
                        </ScrollView>
                        <MyActionSheet
                            visible={this.state.visible}
                            contents={['게시하기', '내가 올린 공지']}
                            onClicked={(data) => {
                                this.setState({ visible: false })
                                if (data === 0) {
                                    this.props.navigation.navigate('A_NotificationPost');
                                } else {
                                    this.props.navigation.navigate('A_MyNotification', { userid: this.state.userid });
                                }
                            }}
                            closeHandle={() => this.setState({ visible: false })} />
                    </View>
                }}
            </Query>
        )
    }

}





















export class MyNotificationScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '검토중인 내 공지',
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            lowDataMode: true,
            visible: false,
            refreshing: false,
            pageData: [],
            viewData: [],
            doing: false,
        }
    }

    async componentDidMount() {
        let lowData = await AsyncStorage.getItem('ISLOWDATA');
        lowData = lowData === null ? false : lowData === 'true' ? true : false;
        this.setState({ lowDataMode: lowData, loading: true });
    }
    _selectPostOption = () => {
        this.setState({ visible: true });
    }

    render() {
        return (
            <Query query={listMyNotification} variables={{ userid: this.props.navigation.state.params.userid }} fetchPolicy='network-only' onCompleted={data => {
                let d = new Array(data.listMyNotifications.items.length);;
                let v = new Array(data.listMyNotifications.items.length);
                for (let k = 0; k < data.listMyNotifications.items.length; k++) {
                    d[k] = 1;
                    d[v] = false;
                }
                this.setState({ pageData: d, viewData: v });
            }}>
                {({ loading, data, refetch }) => {
                    if (loading || !this.state.loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>
                    return <View style={{ flex: 1 }}>
                        <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never' style={{ flex: 1 }} refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true });
                                    refetch().then(res => {
                                        this.setState({ refreshing: false });
                                    });
                                }}
                            />}>
                            {data.listMyNotifications.items.map((info, index) => <View key={index} style={{ width: WIDTH }}>
                                <View style={{ width: '100%', height: 40, flexDirection: 'row', alignItems: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, borderTopColor: '#dbdbdb', borderTopWidth: 0.5, }}>
                                    <Text style={{ marginLeft: 20, fontSize: 14 }} numberOfLines={1}>{info.title}</Text>
                                    <Text style={{ fontSize: 12, color: '#999', marginTop: 2, marginLeft: 2 }}> {info.time}게시 · {info.date}까지</Text>
                                </View>

                                {!this.state.lowDataMode || this.state.viewData[index] ? <View>
                                    <ScrollView pagingEnabled horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never' style={{ width: '100%' }} scrollEventThrottle={16} onScroll={(event) => {
                                        const page = Math.round(event.nativeEvent.contentOffset.x / WIDTH) + 1;
                                        const d = this.state.pageData;
                                        d[index] = page;
                                        this.setState({
                                            pageData: d,
                                        })
                                    }}>
                                        {info.pics && info.pics.map((img, index2) =>
                                            <TouchableOpacity key={index2} activeOpacity={1} onPress={() => this.props.navigation.navigate('A_Photo', { image: info.pics, index: index2 })}>
                                                <Image key={index2} source={{ uri: img }} style={{ width: WIDTH, height: WIDTH / (info.ratio > maxRatio ? maxRatio : info.ratio < 1 / maxRatio ? 1 / maxRatio : info.ratio) }} />
                                            </TouchableOpacity>
                                        )}
                                    </ScrollView>
                                    {info.pics && info.pics.length > 1 &&
                                        <View style={{ height: 20, width: 40, borderRadius: 20, backgroundColor: '#4b4b4b80', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 10, top: 10, }}>
                                            <Text style={{ color: 'white', fontSize: 12 }}>{this.state.pageData[index]}/{info.pics.length}</Text>
                                        </View>
                                    }
                                </View>
                                    : info.pics && info.pics.length !== 0 && <View style={{ height: 40, width: '100%', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                                        <BaseButton onPress={() => {
                                            let d = this.state.viewData;
                                            d[index] = true;
                                            this.setState({ viewData: d });
                                        }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                            <Text style={{ fontSize: 14, color: Colors.highlightBlue }}>사진보기(데이터 절약모드)</Text>
                                        </BaseButton>
                                    </View>}

                                <View style={{ paddingHorizontal: 20, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>
                                        {info.description}
                                    </Text>
                                </View>
                                <Mutation mutation={deleteNotification} >
                                    {(deleteNotification) => (
                                        <View style={{ height: 40, flexDirection: 'row' }}>
                                            <BaseButton style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} onPress={() => {
                                                if (this.state.doing) return;
                                                this.setState({ doing: true });
                                                deleteNotification({ variables: { postid: info.postid } }).then(res => {
                                                    this.setState({ refreshing: true });
                                                    refetch().then(res => {
                                                        this.setState({ refreshing: false, doing: false });
                                                    });
                                                })
                                            }}>
                                                <Text style={{ fontSize: 14 }}>취소</Text>
                                            </BaseButton>
                                        </View>
                                    )}
                                </Mutation>
                                <View style={{ width: '100%', height: 15, backgroundColor: '#ddd' }} />
                            </View>
                            )}
                        </ScrollView>
                    </View>
                }}
            </Query>
        )
    }
}


const styles = StyleSheet.create({})
