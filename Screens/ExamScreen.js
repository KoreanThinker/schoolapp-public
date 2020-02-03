import React, { Component } from 'react'
import { Text, StyleSheet, View, ScrollView, Dimensions, Image, TouchableWithoutFeedback, Alert, ActivityIndicator, AsyncStorage, TouchableOpacity, RefreshControl } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../Components/Asset';
import { BaseButton } from 'react-native-gesture-handler';
import { getStatusBarHeight } from 'react-native-status-bar-height'
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'

const listExamSubjects = gql`
query listExamSubjects($userid: String!) {
    listExamSubjects(userid: $userid) {
        items {
            postid
            grade
            subject
            descriptions
            others
            commentNum
            pics
        }
    }
}
`
const getExam = gql`
query getExam {
    getExam {
        timeTable
        date
    }
}
`

const STATUSBARHEIGHT = getStatusBarHeight();

const SCREENWIDTH = Dimensions.get('window').width;


export default class ExamScreen extends Component {
    static navigationOptions = {
        header: null,
        tabBarOnPress: ({ navigation, defaultHandler }) => {
            if (navigation.isFocused()) navigation.getParam('examScrollUp')();
            else defaultHandler();
        }
    }
    constructor(props) {
        super(props);
        this.state = {
            userid: null,
            refreshing: false,
        }
    }

    async componentDidMount() {
        this.props.navigation.setParams({ examScrollUp: this._scrollUpClicked });
        const id = await AsyncStorage.getItem('ID');
        this.setState({ userid: id });
    }
    _scrollUpClicked = () => {
        this.examScroll.scrollTo({ x: 0, animated: true })
    }
    render() {
        const subjectList = <Query query={listExamSubjects} variables={{ userid: this.state.userid }} fetchPolicy='cache-and-network'>
            {({ loading, data, refetch }) => {
                if (this.examRefetch === undefined) this.examRefetch = refetch;
                if (loading) return <ActivityIndicator size='large' color='#ddd' />
                if (!data.listExamSubjects) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                if (!data.listExamSubjects.items || data.listExamSubjects.items.length === 0) return <Text style={{ alignSelf: 'center', marginTop: 40 }}>정보 없음</Text>
                return <View style={{ width: SCREENWIDTH, alignItems: 'center', marginTop: 40 }}>
                    {data.listExamSubjects.items.map((info, index) =>
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
                            <TouchableOpacity style={{ width: SCREENWIDTH - 40 }} onPress={() => this.props.navigation.navigate('ExamDetail', { postid: info.postid })} activeOpacity={1}>
                                <View style={{ width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 14 }}>{info.subject}</Text>
                                </View>

                                <View style={{ paddingHorizontal: 20 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.red, marginRight: 4 }} />
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.descriptions[0]}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.blue, marginRight: 4 }} />
                                        <Text style={{ fontSize: 14, lineHeight: 20 }}>{info.descriptions[1]}</Text>
                                    </View>

                                    {info.others && info.others.length > 0 && <View style={{ height: 1, width: 100, marginTop: 4, backgroundColor: '#dbdbdb' }} />}

                                    <View>
                                        {info.others && info.others.map((info, index2) =>
                                            <View key={index2}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: index2 % 2 === 0 ? Colors.red : Colors.blue, marginRight: 4 }} />
                                                    <Text style={{ fontSize: 14, lineHeight: 20 }}>{info}</Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ width: '100%', marginBottom: 5 }}>
                                        <Text style={{ fontSize: 10, color: Colors.lightGray, fontWeight: 'bold', textAlign: 'right' }}>댓글 {info.commentNum}</Text>
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
                                    }
                                    } style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                    </BaseButton>}
                                    <BaseButton onPress={() => this.props.navigation.navigate('Comment', { postid: info.postid, type: 'exam' })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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

            <ScrollView ref={(ref) => this.examScroll = ref} style={{ flex: 1 }} showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        progressViewOffset={100}
                        onRefresh={() => {
                            this.setState({ refreshing: true });
                            this.examRefetch().then(() => this.setState({ refreshing: false }))
                        }}
                    />
                }>
                <Query query={getExam} fetchPolicy='cache-and-network'>
                    {({ loading, data }) => {
                        return <LinearGradient colors={['#C2C7FB', '#FCBEC0']} style={styles.Header} start={[0, 0]} end={[1, 1]} >
                            <View style={{ paddingHorizontal: 20, height: 40, marginTop: 15 + STATUSBARHEIGHT, flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ fontSize: 28, fontFamily: 'nanumbarungothic', color: 'white' }}>시험정보</Text>
                                <Text style={{ marginLeft: 6, marginTop: 9, fontSize: 14, color: '#ffffff80', fontFamily: 'nanumbarungothic' }}>{loading ? '불러오는중' : data.getExam.date}</Text>
                            </View>


                            <View style={styles.WhiteBox}>
                                {loading ?
                                    <ActivityIndicator size='large' color='#ddd' />
                                    : <TouchableWithoutFeedback style={{ width: '100%', height: '100%' }} onPress={() => this.props.navigation.navigate('Photo', { image: data.getExam.timeTable })}>
                                        <Image style={{ width: '100%', height: '100%' }} source={{ uri: data.getExam.timeTable }} />
                                    </TouchableWithoutFeedback>}
                            </View>

                            <View style={{ position: 'absolute', left: 0, right: 0, bottom: -20, height: 40, borderRadius: 20, backgroundColor: 'white' }} />
                        </LinearGradient>
                    }}
                </Query>
                <View style={{ width: SCREENWIDTH, alignItems: 'center' }}>
                    {this.state.userid === null ? <ActivityIndicator color='#ddd' size='large' /> : subjectList}
                </View>

            </ScrollView>
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
        alignItems: 'center',
        justifyContent: 'center'
    },
})
