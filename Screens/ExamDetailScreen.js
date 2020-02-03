import React, { Component } from 'react'
import { Text, View, Image, Dimensions, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, AsyncStorage } from 'react-native'
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



const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'Bottom' })],
});


const WIDTH = Dimensions.get('window').width;
const getPost = gql`
query getExamSubject($postid: String!) {
    getExamSubject(postid: $postid) {
        grade
        subject
        descriptions
        postid
        pics
        others
        commentNum
    }
}
`


export default class ExamDetailScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('PostUserName'),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            page: 1,
            visible: false,
        }
    }
    componentDidMount() {
        this.props.navigation.setParams({ openModal: this._openModal });
    }
    _openModal = () => {
        if (this.state.data === null) return;
        this.setState({ visible: true });
    }
    _commentHandle = () => {
        this.props.navigation.navigate('Comment', { postid: this.props.navigation.state.params.postid, type: 'exam' });
    }
    render() {
        return (
            <Query query={getPost} variables={{ postid: this.props.navigation.state.params.postid }} fetchPolicy="network-only" onCompleted={data => {
                this.setState({ data: data.getExamSubject });
                this.props.navigation.setParams({ PostUserName: data.getExamSubject.subject });
            }}>
                {({ loading, error }) => {
                    if (loading || this.state.data === null) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator size='large' color='#ddd' /></View>
                    if (error) {
                        return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ color: Colors.red, fontSize: 14 }}>오류</Text>
                        </View>
                    }
                    return <View style={{ flex: 1 }}>
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
                                            <Image source={{ uri: img }} style={{ width: WIDTH, height: WIDTH }} />
                                        </TouchableOpacity>
                                    )}
                                </ScrollView>
                                {this.state.data.pics.length > 1 &&
                                    <View style={{ height: 20, width: 40, borderRadius: 20, backgroundColor: '#4b4b4b80', alignItems: 'center', justifyContent: 'center', position: 'absolute', right: 10, top: 10, }}>
                                        <Text style={{ color: 'white', fontSize: 12 }}>{this.state.page}/{this.state.data.pics.length}</Text>
                                    </View>
                                }
                            </View>}
                            <View style={{ paddingHorizontal: 20, marginBottom: 60, marginTop: 10 }}>
                                <View style={{}}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.red, marginRight: 4 }} />
                                        <Text numberOfLines={1} style={{ fontSize: 14, lineHeight: 20 }}>{this.state.data.descriptions[0]}</Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                        <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: Colors.blue, marginRight: 4 }} />
                                        <Text numberOfLines={1} style={{ fontSize: 14, lineHeight: 20 }}>{this.state.data.descriptions[1]}</Text>
                                    </View>
                                    {this.state.data.others.length > 0 && <View style={{ height: 1, width: 100, marginTop: 4, backgroundColor: '#dbdbdb' }} />}
                                    {this.state.data.others.map((info, index) =>
                                        <View key={index}>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                                                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: index % 2 === 0 ? Colors.red : Colors.blue, marginRight: 4 }} />
                                                <Text style={{ fontSize: 14, lineHeight: 20 }}>{info}</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <Text style={{ fontSize: 12, color: Colors.lightGray, fontWeight: 'bold', marginTop: 4 }}>
                                    댓글 {this.state.data.commentNum}
                                </Text>
                            </View>
                        </ScrollView>
                        <LinearGradient colors={[Colors.lightBlue, Colors.lightRed]} style={{ height: 44, width: WIDTH, flexDirection: 'row', alignItems: 'center' }} start={[0, 0]} end={[1, 1]} >
                            <BaseButton onPress={this._commentHandle} style={{ height: '100%', justifyContent: 'center', flex: 1, alignItems: 'center' }}>
                                <Text style={{ color: 'white', fontSize: 14 }} >댓글</Text>
                            </BaseButton>
                        </LinearGradient>

                        <MyActionSheet
                            visible={this.state.visible}
                            contents={['오류신고']}
                            onClicked={(data) => {
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