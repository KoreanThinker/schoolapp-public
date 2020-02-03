import React, { Component } from 'react'
import { Text, View, Dimensions, Platform, FlatList, ActivityIndicator, TouchableOpacity, Alert, AsyncStorage } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';
// import { LinearGradient, Constants } from 'expo';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';

const WIDTH = Dimensions.get('window').width;
const SCREENWIDTH = Dimensions.get('window').width;
const listHomework = gql`
query listHomeworkByGrade($grade: Int!) {
    listHomeworkByGrade(grade: $grade) {
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
const deleteHomework = gql`
mutation deleteHomework($postid: String!, $adminid: String) {
    deleteHomework(postid: $postid, adminid: $adminid) {
        postid
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
const deleteContest = gql`
mutation deleteContest($postid: String!, $adminid: String) {
    deleteContest(postid: $postid, adminid: $adminid) {
        postid
    }
}
`

export default class ContestScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isHomework: true,
            grade: 1,
        }
    }
    async componentDidMount() {
        this.userid = await AsyncStorage.getItem('ID');
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ width: WIDTH, height: 40, flexDirection: 'row' }}>
                    {this.state.isHomework
                        ?
                        <BaseButton onPress={() => this.props.navigation.navigate('A_PostHomework', { grade: this.state.grade })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}>
                            <Text>{this.state.grade}학년 수행 추가하기</Text>
                        </BaseButton>
                        :
                        <BaseButton onPress={() => this.setState({ isHomework: true })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text>수행</Text>
                        </BaseButton>}
                    {!this.state.isHomework
                        ?
                        <BaseButton onPress={() => this.props.navigation.navigate('A_PostContest')} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}>
                            <Text>대회 추가하기</Text>
                        </BaseButton>
                        :
                        <BaseButton onPress={() => this.setState({ isHomework: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text>대회</Text>
                        </BaseButton>
                    }
                </View>
                {this.state.isHomework && <View style={{ width: WIDTH, height: 40, flexDirection: 'row' }}>
                    <BaseButton onPress={() => this.setState({ grade: 1 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 1 ? Colors.lightRed : 'white' }}>
                        <Text>1학년</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ grade: 2 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 2 ? Colors.lightRed : 'white' }}>
                        <Text>2학년</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ grade: 3 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 3 ? Colors.lightRed : 'white' }}>
                        <Text>3학년</Text>
                    </BaseButton>
                </View>}
                <View style={{ flex: 1, alignItems: 'center' }}>
                    {this.state.isHomework ?
                        <Mutation mutation={deleteHomework}>
                            {(deleteHomework) => (
                                <Query query={listHomework} variables={{ grade: this.state.grade }} fetchPolicy='network-only'>
                                    {({ loading, data, refetch }) => {
                                        if (loading) return <ActivityIndicator size='large' />
                                        return data.listHomeworkByGrade.items && <FlatList
                                            keyExtractor={(item, index) => item.postid}
                                            data={data.listHomeworkByGrade.items}
                                            style={{ flex: 1 }}
                                            renderItem={({ item, index }) => {
                                                const info = item;
                                                return <View style={{
                                                    backgroundColor: 'white', marginBottom: 36,
                                                    borderRadius: 20,
                                                    width: SCREENWIDTH - 40,
                                                    marginTop: index === 0 ? 10 : 0,
                                                    borderColor: '#dbdbdb',
                                                    borderWidth: 1,
                                                }}>
                                                    <TouchableOpacity style={{ width: SCREENWIDTH - 40 }} activeOpacity={1} onPress={() => this.props.navigation.navigate('A_HomeworkDetail', { postid: info.postid })}>
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
                                                                    this.props.navigation.navigate('A_Photo', { image: info.pics, index: 0 });
                                                                } else {
                                                                    Alert.alert('사진이 없습니다');
                                                                }
                                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                                            </BaseButton>}
                                                            <BaseButton onPress={() => this.props.navigation.navigate('A_Comment', { postid: info.postid, type: 'homework' })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>댓글</Text>
                                                            </BaseButton>
                                                            <BaseButton onPress={() => this.props.navigation.navigate('A_UpdateHomework', { postid: info.postid, grade: this.state.grade })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>수정</Text>
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
                                                                                deleteHomework({ variables: { postid: info.postid, adminid: `${this.userid}(${Constants.deviceName})` } }).then(() => {
                                                                                    refetch();
                                                                                })
                                                                            }
                                                                        },
                                                                    ],
                                                                    { cancelable: false },
                                                                );
                                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>삭제</Text>
                                                            </BaseButton>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                            }}
                                        />
                                    }}
                                </Query>
                            )}
                        </Mutation>
                        :
                        <Mutation mutation={deleteContest}>
                            {(deleteContest) => (
                                <Query query={listContests} fetchPolicy='network-only'>
                                    {({ loading, data, refetch }) => {
                                        if (loading) return <ActivityIndicator size='large' />
                                        return <FlatList
                                            keyExtractor={(item, index) => item.postid}
                                            data={data.listContests.items}
                                            style={{ flex: 1 }}
                                            renderItem={({ item, index }) => {
                                                const info = item;
                                                return <View style={{
                                                    backgroundColor: 'white', marginBottom: 36,
                                                    borderWidth: 0.5,
                                                    borderColor: '#dbdbdb',
                                                    borderRadius: 20,
                                                    width: SCREENWIDTH - 40,
                                                    marginTop: index === 0 ? 10 : 0
                                                }}>
                                                    <TouchableOpacity style={{ width: SCREENWIDTH - 40, alignSelf: 'center' }} activeOpacity={1} onPress={() => this.props.navigation.navigate('A_ContestDetail', { postid: info.postid })}>
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
                                                                    this.props.navigation.navigate('A_Photo', { image: info.pics, index: 0 })
                                                                } else {
                                                                    Alert.alert('사진이 없습니다');
                                                                }
                                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                                            </BaseButton>}
                                                            <BaseButton onPress={() => this.props.navigation.navigate('A_Comment', { type: 'contest', postid: info.postid })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>댓글</Text>
                                                            </BaseButton>
                                                            <BaseButton onPress={() => this.props.navigation.navigate('A_UpdateContest', { postid: info.postid })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>수정</Text>
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
                                                                                deleteContest({ variables: { postid: info.postid, adminid: `${this.userid}(${Constants.deviceName})` } }).then(() => {
                                                                                    refetch();
                                                                                })
                                                                            }
                                                                        },
                                                                    ],
                                                                    { cancelable: false },
                                                                );

                                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Text style={{ fontSize: 14, color: 'white' }}>삭제</Text>
                                                            </BaseButton>
                                                        </LinearGradient>
                                                    </View>
                                                </View>
                                            }}
                                        />
                                    }}
                                </Query>)}
                        </Mutation>
                    }
                </View>
            </View>
        )
    }
}
