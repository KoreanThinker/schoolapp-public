import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, Alert, ActivityIndicator, AsyncStorage, RefreshControl, Platform } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../Components/Asset';
import { BaseButton } from 'react-native-gesture-handler';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { getStatusBarHeight } from 'react-native-status-bar-height'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'

const STATUSBARHEIGHT = getStatusBarHeight();
const SCREENWIDTH = Dimensions.get('window').width;
const ISIOS = Platform.OS === 'ios';

const listHomework = gql`
query listHomework($userid: String!) {
    listHomework(userid: $userid) {
        items {
            postid
            time
            grade
            subject
            title
            descriptions
            others
            commentNum
            pics
            time
        }
    }
}
`
const listContests = gql`
query listContests {
    listContests {
        items {
            postid
            time
            title
            description
            others
            commentNum
            pics
        }
    }
}
`

export default class ContestScreen extends Component {
    static navigationOptions = {
        header: null,
        tabBarOnPress: ({ navigation, defaultHandler }) => {
            if (navigation.isFocused()) navigation.getParam('contestScrollUp')();
            else defaultHandler();
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            sellectNum: 1, //1==수행 2== 대회
            userid: null,
            homeworkData: null,
            homeworkReadyList: [],
            refreshing: false,
        }
    }
    async componentDidMount() {
        this.props.navigation.setParams({ contestScrollUp: this._scrollUpClicked });
        const homeworkReady = await AsyncStorage.getItem('HOMEWORKREADY');
        const id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id, homeworkReadyList: homeworkReady === null ? this.state.homeworkReadyList : JSON.parse(homeworkReady) });
    }
    _scrollUpClicked = () => {
        this.contestScroll.scrollTo({ x: 0, animated: true })
    }

    render() {
        const homework = this.state.userid !== null ? <Query query={listHomework} variables={{ userid: this.state.userid }} fetchPolicy='cache-and-network' onCompleted={data => {
            this.setState({ homeworkData: data.listHomework.items });
            if (this.state.homeworkReadyList.length === 0 || data.listHomework.items === null) return; //캐시삭제
            const d = this.state.homeworkReadyList.filter(t => true);
            const list = [];
            for (let i = 0; i < data.listHomework.items.length; i++) {
                list.push(data.listHomework.items[i].postid);
            }
            for (let i = 0; i < this.state.homeworkReadyList.length; i++) {
                const index = list.indexOf(this.state.homeworkReadyList[i]);
                if (index === -1) {
                    const index2 = d.indexOf(this.state.homeworkReadyList[i]);
                    if (index2 !== -1) {
                        d.splice(index2, 1);
                    }
                }
            }
            AsyncStorage.setItem('HOMEWORKREADY', JSON.stringify(d));
            this.setState({ homeworkReadyList: d });
        }}>
            {({ loading, data, refetch }) => {
                if (this.homeworkRefetch === undefined) this.homeworkRefetch = refetch;
                if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size='large' color='#ddd' />
                if (!data.listHomework) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                if (!data.listHomework.items || data.listHomework.items.length === 0) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                return <View style={{ width: SCREENWIDTH, alignItems: 'center', marginTop: 40 }}>
                    {data.listHomework.items && data.listHomework.items.map((info, index) =>
                        <View key={index} style={{
                            backgroundColor: 'white', marginBottom: 36,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            borderRadius: 20,
                            width: SCREENWIDTH - 40,
                        }}>
                            <TouchableOpacity style={{ width: SCREENWIDTH - 40 }} activeOpacity={1} onPress={() => this.props.navigation.navigate('HomeworkDetail', { postid: info.postid })}>
                                <View style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14 }}>{info.subject}</Text>
                                </View>

                                <View style={{ paddingHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.red, marginRight: 4 }} />
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.title}</Text>
                                    </View>

                                    <View style={{ height: 1, width: 100, marginVertical: 4, backgroundColor: '#dbdbdb' }} />

                                    <View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.blue, marginRight: 4 }} />
                                            <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.descriptions[0]}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.red, marginRight: 4 }} />
                                            <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.descriptions[1]}</Text>
                                        </View>
                                    </View>

                                    {info.others && info.others.length > 0 && <View style={{ height: 1, width: 100, marginTop: 4, backgroundColor: '#dbdbdb' }} />}

                                    <View>
                                        {info.others && info.others.map((info2, index2) =>
                                            <View key={index2}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: index2 % 2 === 0 ? Colors.blue : Colors.red, marginRight: 4 }} />
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>{info2}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ width: '100%', marginBottom: 5 }}>
                                        <Text style={{ fontSize: 10, color: Colors.lightGray, fontWeight: 'bold', textAlign: 'right' }}>{info.time} · 댓글 {info.commentNum}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={{ height: 40, width: '100%', borderRadius: 20, overflow: 'hidden' }}>
                                <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={{ width: '100%', height: '100%', flexDirection: 'row' }} start={[1, 0]} end={[0, 1]} >
                                    {info.pics && info.pics.length !== 0 && <BaseButton onPress={() => {
                                        if (info.pics.length !== 0) {
                                            this.props.navigation.navigate('Photo', { image: info.pics, index: 0 });
                                        } else {
                                            Alert.alert('사진이 없습니다');
                                        }
                                    }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                    </BaseButton>}
                                    <BaseButton onPress={() => this.props.navigation.navigate('Comment', { postid: info.postid, type: 'homework' })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>댓글</Text>
                                    </BaseButton>
                                    <BaseButton onPress={() => {
                                        const d = this.state.homeworkReadyList.filter(t => true);
                                        if (d.indexOf(info.postid) !== -1) {
                                            d.splice(d.indexOf(info.postid), 1);
                                        } else {
                                            d.push(info.postid);
                                        }
                                        this.setState({ homeworkReadyList: d });
                                        AsyncStorage.setItem('HOMEWORKREADY', JSON.stringify(d));
                                    }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>준비완료</Text>
                                        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                                            {this.state.homeworkReadyList.indexOf(info.postid) !== -1 && <Feather name='check' size={40} color={Colors.red} />}
                                        </View>
                                    </BaseButton>
                                </LinearGradient>
                            </View>
                        </View>
                    )}
                </View>
            }}
        </Query> : null;

        const contest = <Query query={listContests} fetchPolicy='cache-and-network'>
            {({ loading, data, refetch }) => {
                if (this.contestRefetch === undefined) this.contestRefetch = refetch;
                if (loading) return <ActivityIndicator style={{ marginTop: 20 }} size='large' color='#ddd' />
                if (!data.listContests) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                if (!data.listContests.items || data.listContests.items.length === 0) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                return <View style={{ width: SCREENWIDTH, alignItems: 'center', marginTop: 40 }}>
                    {data.listContests.items && data.listContests.items.map((info, index) =>
                        <View key={index} style={{
                            backgroundColor: 'white', marginBottom: 36,
                            shadowColor: "#000",
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                            borderRadius: 20,
                            width: SCREENWIDTH - 40,
                        }}>
                            <TouchableOpacity style={{ width: SCREENWIDTH - 40 }} activeOpacity={1} onPress={() => this.props.navigation.navigate('ContestDetail', { postid: info.postid })}>
                                <View style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14 }}>{info.title}</Text>
                                </View>

                                <View style={{ paddingHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.red, marginRight: 4 }} />
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.description}</Text>
                                    </View>

                                    {info.others && info.others.length > 0 && <View style={{ height: 1, width: 100, marginTop: 4, backgroundColor: '#dbdbdb' }} />}

                                    <View>
                                        {info.others && info.others.map((info2, index2) =>
                                            <View key={index2}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: index2 % 2 === 0 ? Colors.blue : Colors.red, marginRight: 4 }} />
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>{info2}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ width: '100%', marginBottom: 5 }}>
                                        <Text style={{ fontSize: 10, color: Colors.lightGray, fontWeight: 'bold', textAlign: 'right' }}>{info.time} · 댓글 {info.commentNum}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                            <View style={{ height: 40, width: '100%', borderRadius: 20, overflow: 'hidden' }}>
                                <LinearGradient colors={[Colors.lightRed, Colors.lightBlue]} style={{ width: '100%', height: '100%', flexDirection: 'row' }} start={[1, 0]} end={[0, 1]} >
                                    {info.pics && info.pics.length !== 0 && <BaseButton onPress={() => {
                                        if (info.pics.length !== 0) {
                                            this.props.navigation.navigate('Photo', { image: info.pics, index: 0 })
                                        } else {
                                            Alert.alert('사진이 없습니다');
                                        }
                                    }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                    </BaseButton>}
                                    <BaseButton onPress={() => this.props.navigation.navigate('Comment', { type: 'contest', postid: info.postid })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>댓글</Text>
                                    </BaseButton>
                                </LinearGradient>
                            </View>
                        </View>
                    )}
                </View>
            }}
        </Query>

        return (
            <ScrollView ref={(ref) => this.contestScroll = ref} showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        progressViewOffset={100}
                        onRefresh={() => {
                            this.setState({ refreshing: true });
                            if (this.state.sellectNum === 1) {
                                this.homeworkRefetch().then(() => this.setState({ refreshing: false }))
                            } else {
                                this.contestRefetch().then(() => this.setState({ refreshing: false }))
                            }
                        }}
                    />
                }>
                <LinearGradient colors={['#C2C7FB', '#FCBEC0']} style={styles.Header} start={[0, 0]} end={[1, 1]} >
                    <View style={{ paddingHorizontal: 20, height: 40, marginTop: 15 + STATUSBARHEIGHT, flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ fontSize: 30, fontFamily: 'nanumbarungothic', color: 'white' }}>수행/대회</Text>
                    </View>
                    <View style={styles.WhiteBox}>
                        <ScrollView nestedScrollEnabled={true} style={{ flex: 1 }}>
                            <View style={{ paddingHorizontal: 20 }}>
                                <View style={{ width: '100%', height: 50, borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 18 }}>수행몰아보기</Text>
                                </View>
                                {this.state.homeworkData && this.state.homeworkData.map((data, index) =>
                                    <View key={index} style={{ width: '100%', height: 70, alignItems: 'center', justifyContent: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5 }}>
                                        <Text numberOfLines={1} style={{ fontSize: 16 }}>{data.subject}</Text>
                                        <Text numberOfLines={1} style={{ fontSize: 14, marginTop: 1 }}>{data.title}</Text>
                                        <Text style={{ fontSize: 12, marginTop: 3 }}>{data.descriptions[0]}</Text>
                                        {this.state.homeworkReadyList.indexOf(data.postid) !== -1 && <View style={{ position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
                                            <Feather name='check' size={40} color={Colors.red} />
                                        </View>}
                                    </View>
                                )}
                            </View>
                        </ScrollView>
                    </View>

                    {!ISIOS && <View style={{ position: 'absolute', left: 0, right: 0, bottom: -20, backgroundColor: 'white', borderRadius: 20, height: 40 }}>
                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ sellectNum: 1 })} activeOpacity={1}>
                                <Text style={{ textAlign: 'center', color: this.state.sellectNum == 1 ? 'black' : '#00000080', fontSize: 14 }}>수행</Text>
                            </TouchableOpacity>
                            <View style={{ width: 1, height: 10, backgroundColor: 'black' }} />
                            <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ sellectNum: 2 })} activeOpacity={1}>
                                <Text style={{ textAlign: 'center', color: this.state.sellectNum == 2 ? 'black' : '#00000040', fontSize: 14 }}>대회</Text>
                            </TouchableOpacity>
                        </View>
                    </View>}

                </LinearGradient>
                {ISIOS && <View style={{ width: SCREENWIDTH, marginTop: -20, backgroundColor: 'white', borderRadius: 20, height: 40 }}>
                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ sellectNum: 1 })} activeOpacity={1}>
                            <Text style={{ textAlign: 'center', color: this.state.sellectNum == 1 ? 'black' : '#00000080', fontSize: 14 }}>수행</Text>
                        </TouchableOpacity>
                        <View style={{ width: 1, height: 10, backgroundColor: 'black' }} />
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => this.setState({ sellectNum: 2 })} activeOpacity={1}>
                            <Text style={{ textAlign: 'center', color: this.state.sellectNum == 2 ? 'black' : '#00000040', fontSize: 14 }}>대회</Text>
                        </TouchableOpacity>
                    </View>
                </View>}
                <View style={{ width: SCREENWIDTH }}>
                    {this.state.userid === null
                        ?
                        <View style={{ marginTop: 40, alignSelf: 'center' }}><ActivityIndicator color='#ddd' size='large' /></View>
                        :
                        this.state.sellectNum === 1 ? homework : contest
                    }


                </View>
            </ScrollView >
        )
    }
}

const styles = StyleSheet.create({
    Header: {
        height: 500 + STATUSBARHEIGHT,
    },
    WhiteBox: {
        width: SCREENWIDTH - 40,
        height: SCREENWIDTH - 40,
        backgroundColor: 'white',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 30,
        borderRadius: 20,
        alignSelf: 'center',
        overflow: 'hidden',
    },
    Sellection: {
        flexDirection: 'row',
        width: SCREENWIDTH,
        height: 40
    }

})
