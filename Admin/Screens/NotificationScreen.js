import React, { Component } from 'react'
import { Text, View, ScrollView, RefreshControl, Image, TouchableOpacity, Dimensions, ActivityIndicator, AsyncStorage, Alert } from 'react-native'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { BaseButton } from 'react-native-gesture-handler';
import { Colors } from '../Components/Asset';
import Constants from 'expo-constants';

const WIDTH = Dimensions.get('window').width;
const maxRatio = 1.3;
const listNotificationsAdmin = gql`
query listNotificationsAdmin {
    listNotificationsAdmin {
        items {
            postid
            date
            time
            title
            description
            pics
            ratio
        }
    }
}
`
const allowNotification = gql`
mutation allowNotification($postid: String!, $adminid: String) {
    allowNotification(postid: $postid, adminid: $adminid) {
        createdAt
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

export default class NotificationScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            visible: false,
            refreshing: false,
            isFirst: true,
            doing: false,
            userid: null,
        }
    }

    async componentDidMount() {
        let id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });
    }

    render() {
        return (
            <Query query={listNotificationsAdmin} fetchPolicy='cache-and-network' onCompleted={() => {
                this.setState({ isFirst: false });
            }}>
                {({ loading, data, refetch }) => {
                    if (((loading || data === null || data.listNotificationsAdmin === undefined) && this.state.isFirst) || this.state.userid === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#dddddd' /></View>

                    return <View style={{ flex: 1 }}>
                        <View style={{ width: WIDTH, height: 40, borderBottomWidth: 0.5, borderBottomColor: '#dbdbdb' }}>
                            <BaseButton onPress={() => this.props.navigation.navigate('A_NotificationRemove')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                <Text>등록된 공지 보기(삭제)</Text>
                            </BaseButton>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false} overScrollMode='never' style={{ flex: 1 }} refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={() => {
                                    this.setState({ refreshing: true, doing: true });
                                    refetch().then(res => {
                                        this.setState({ refreshing: false, doing: false });
                                    });
                                }}
                            />}>
                            {data.listNotificationsAdmin.items.map((info, index) => <View key={index} style={{ width: WIDTH }}>
                                <View style={{ width: '100%', height: 40, flexDirection: 'row', alignItems: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, borderTopColor: '#dbdbdb', borderTopWidth: 0.5, }}>
                                    <Text style={{ marginLeft: 20, fontSize: 14 }} numberOfLines={1}>{info.title}</Text>
                                    <Text style={{ fontSize: 12, color: '#999', marginTop: 2 }}> {info.date}</Text>
                                </View>

                                <View>
                                    <ScrollView pagingEnabled horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never' style={{ width: '100%' }} scrollEventThrottle={16} onScroll={(event) => {
                                        const page = Math.round(event.nativeEvent.contentOffset.x / WIDTH) + 1;
                                        const d = this.state.cardData;
                                        d[index].page = page;
                                        this.setState({
                                            cardData: d,
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
                                            <Text style={{ color: 'white', fontSize: 12 }}>{info.page}/{info.pics.length}</Text>
                                        </View>
                                    }
                                </View>

                                <View style={{ paddingHorizontal: 20, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, paddingVertical: 10 }}>
                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>
                                        {info.description}
                                    </Text>
                                </View>
                                <Mutation mutation={allowNotification} >
                                    {(allowNotification) => (
                                        <Mutation mutation={deleteNotification} >
                                            {(deleteNotification) => (
                                                <View style={{ borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, width: WIDTH, height: 40, flexDirection: 'row' }}>
                                                    <BaseButton onPress={() => {
                                                        if (this.state.doing) return;
                                                        this.setState({ doing: true });
                                                        allowNotification({ variables: { postid: info.postid, adminid: `${this.state.userid}(${Constants.deviceName})` } }).then(res => {
                                                            this.setState({ refreshing: true });
                                                            refetch().then(res => {
                                                                this.setState({ refreshing: false, doing: false });
                                                            });
                                                        })
                                                    }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <Text>승인</Text>
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
                                                    <View style={{ position: 'absolute', left: WIDTH / 2, width: 0.5, height: 40, backgroundColor: '#dbdbdb' }} />
                                                </View>)}
                                        </Mutation>)}
                                </Mutation>
                                <View style={{ width: '100%', height: 15, backgroundColor: '#ddd' }} />
                            </View>
                            )}
                            {data.listNotificationsAdmin.items.length === 0 && <View style={{ marginTop: 20, width: WIDTH, alignItems: 'center' }}><Text style={{ fontSize: 14 }}>제안된 공지 없음</Text></View>}
                        </ScrollView>
                    </View>
                }}
            </Query>
        )
    }
}
