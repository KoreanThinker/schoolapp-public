import React, { Component } from 'react'
import { Text, View, ScrollView, StyleSheet, TouchableOpacity, Dimensions, ActivityIndicator, TouchableWithoutFeedback, Image, Platform, Alert, ToastAndroid, Linking } from 'react-native'
import { Colors } from '../Components/Asset';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'
import { Ionicons, AntDesign } from '@expo/vector-icons';
// import { IntentLauncherAndroid as IntentLauncher, ImageManipulator, ImagePicker, Permissions, LinearGradien } from 'expo';
import MyActionSheet from '../Components/MyActionSheet';
import { BorderlessButton, RectButton, BaseButton } from 'react-native-gesture-handler';
import moment from 'moment';
import { RNS3 } from 'react-native-aws3';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';

const WIDTH = Dimensions.get('window').width;
const width2 = 120;
let date = moment().format('YYYYMMDDHHmmss');
let count = 0;
const getSubjects = gql`
query getSubjects($grade: Int!, $class_: Int!) {
    getSubjects(grade: $grade, class_: $class_) {
        url
        mon
        tue
        wed
        thu
        fri
    }
}
`


const updateSubjects = gql`
mutation updateSubjects($input: UpdateSubjectsInput!) {
    updateSubjects(input: $input) {
        url
    }
}
`

const getSubjectList = gql`
query getResource($key: String!) {
    getResource(key: $key) {
        values
    }
}
`

const classList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const options = {
    keyPrefix: "uploads/timetableImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: "",
    secretKey: "",
    successActionStatus: 201
}

export default class TimeTableScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            subjectList: [[], [], [], [], []],
            date: ["월요일", "화요일", "수요일", "목요일", "금요일"],
            grade: 1,
            class_: 1,
            isImageUploading: false,
            url: '',
            wholeSubjectList: [],
        }
        count = 0;
        date = moment().format('YYYYMMDDHHmmss')
    }

    async componentDidMount() {
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');

    }

    _modifySubject = (data, dayIndex) => {
        this.setState({ isImageUploading: true });
        let input = {
            grade: this.state.grade,
            class_: this.state.class_,
        }
        if (dayIndex === 0) input.mon = data;
        else if (dayIndex === 1) input.tue = data
        else if (dayIndex === 2) input.wed = data;
        else if (dayIndex === 3) input.thu = data;
        else if (dayIndex === 4) input.fri = data;
        this.updateSubjects({ variables: { input: input } }).then(res2 => {
            this.refetchQuery().then(r => {
                this.setState({ isImageUploading: false });
            })
        })
    }

    _upload2S3(uri) {
        ImageManipulator.manipulateAsync(uri, [], { compress: 0.6, format: 'jpeg' }).then(response => {
            RNS3.put(this.getFile(response.uri), options).then(res => {
                const input = {
                    grade: this.state.grade,
                    class_: this.state.class_,
                    url: res.body.postResponse.location
                }
                this.updateSubjects({ variables: { input: input } }).then(res2 => {
                    this.refetchQuery().then(r => {
                        this.setState({ isImageUploading: false });
                    })
                })

            });
        })
    }
    getFile(uri) {
        let uriParts = uri.split('.');
        let fileType = uriParts[uriParts.length - 1];

        const file = {
            uri,
            name: `${date}${count}.${fileType}`,
            type: `image/${fileType}`,
        };
        count++;

        return file;
    }
    onUnVisibled = (index) => {
        if (this.state.isImageUploading) return;
        this.setState({ visible: false });
        if (index == 0) {
            this.setState({ isCameraMode: false, isImageUploading: true });
            setTimeout(() => {
                this._openGellary();
            }, 100);
        } else if (index == 1) {
            this.setState({ isCameraMode: true, isImageUploading: true });
            this._openCamera();
        } else if (index == 2) {
            this.props.navigation.navigate('A_Photo', { image: this.state.url });
        }
    }
    _changePhoto = (_uri, _ratio) => {
        this._upload2S3(_uri);
    }
    _openCamera = () => {
        this.props.navigation.navigate('A_Camera', { changePhoto: this._changePhoto });
    }

    _openGellary = async () => {
        const permissions = await Permissions.getAsync(Permissions.CAMERA_ROLL);
        if (permissions.status === 'denied') {
            const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
            if (newPermission.status === 'denied') {
                if (Platform.OS === 'ios') {
                    Alert.alert(
                        '권한',
                        '사진 > 읽기 및 쓰기 활성화',
                        [
                            { text: 'OK', onPress: () => Linking.openURL('app-settings:') },
                            {
                                text: '취소',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                } else {
                    Alert.alert(
                        '권한',
                        '스크랩 > 권한 > 저장공간 활성화',
                        [
                            { text: 'OK', onPress: () => IntentLauncher.startActivityAsync(IntentLauncher.ACTION_APPLICATION_SETTINGS) },
                            {
                                text: '취소',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: false },
                    );
                }
            } else {
                let result;
                result = await ImagePicker.launchImageLibraryAsync({
                    allowsEditing: true,
                });
                if (!result.cancelled) {
                    this._upload2S3(result.uri);
                } else {
                    this.setState({ isImageUploading: false })
                }
            }
        } else {
            let result;
            result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
            });

            if (!result.cancelled) {
                this._upload2S3(result.uri);
            } else {
                this.setState({ isImageUploading: false })
            }
        }


    }
    render() {
        return (
            <Query query={getSubjects} variables={{ grade: this.state.grade, class_: this.state.class_ }} fetchPolicy='network-only' onCompleted={data => {
                if (data.getSubjects === null) return;
                let list = [];
                list.push(data.getSubjects.mon);
                list.push(data.getSubjects.tue);
                list.push(data.getSubjects.wed);
                list.push(data.getSubjects.thu);
                list.push(data.getSubjects.fri);
                this.setState({ url: data.getSubjects.url, subjectList: list })
            }}>
                {({ data, loading, refetch }) => {
                    if (this.refetchQuery === undefined) this.refetchQuery = refetch;
                    return <View>
                        <Mutation mutation={updateSubjects} >
                            {(updateSubjects) => {
                                if (this.updateSubjects === undefined) this.updateSubjects = updateSubjects;
                                return null;
                            }}
                        </Mutation>
                        <Query query={getSubjectList} variables={{ key: 'subjectList' }} fetchPolicy='network-only' onCompleted={data => {
                            this.setState({ wholeSubjectList: data.getResource.values })
                        }}>
                            {({ data, loading, refetch }) => {
                                return null
                            }}
                        </Query>
                        <View style={{ width: WIDTH, height: 50, backgroundColor: 'white', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 0.5, flexDirection: 'row' }}>
                            <Text style={{ fontSize: 20, marginLeft: 20 }}>시간표 수정</Text>
                            <View style={{ width: 50, height: 50, alignItems: 'center', justifyContent: 'center' }}>
                                {this.state.isImageUploading && <ActivityIndicator color={Colors.highlightBlue} size='small' />}
                            </View>
                        </View>
                        <ScrollView>
                            <View style={{ height: 260, justifyContent: 'center', width: WIDTH }}>
                                <ScrollView showsHorizontalScrollIndicator={false} horizontal={true}>
                                    <View style={{ width: 20 }} />
                                    <View style={styles.Container}>
                                        <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={this.props.onClick}>
                                            <View style={styles.TitleContainer}>
                                                <Text style={styles.TitleText}>사진</Text>
                                            </View>
                                            <View style={styles.ContentConainer}>
                                                {loading
                                                    ?
                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <ActivityIndicator color='#ddd' size='small' />
                                                    </View>
                                                    :
                                                    this.state.url === null || this.state.url === ' ' ?
                                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                            <View style={{ height: width2, width: width2, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#dbdbdb', overflow: 'hidden' }}>
                                                                <TouchableOpacity onPress={() => {
                                                                    if (this.state.isImageUploading) return;
                                                                    this.setState({ visible: true })
                                                                }}>
                                                                    <View style={{ height: width2, width: width2, borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                                                                        <Ionicons name='ios-add' style={{ margin: 0 }} size={30} color='#888' />
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                        :
                                                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                            <TouchableOpacity onPress={() => {
                                                                if (this.state.isImageUploading) return;
                                                                this.setState({ visible: true })
                                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                                <View style={{ width: width2, height: width2, borderRadius: 10, overflow: 'hidden' }}>
                                                                    <Image style={{ width: width2, height: width2 }} source={{ uri: this.state.url }} />
                                                                </View>
                                                            </TouchableOpacity>
                                                        </View>}
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    {this.state.subjectList.map((info, index) => <View key={index} style={styles.Container}>
                                        <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={() => {
                                            if (this.state.isImageUploading || loading) return;
                                            this.props.navigation.navigate('A_ModifySubject', { dayIndex: index, info: info, wholeSubjectList: this.state.wholeSubjectList, updateHandle: this._modifySubject });
                                        }}>
                                            <View style={styles.TitleContainer}>
                                                <Text style={styles.TitleText}>{this.state.date[index]}</Text>
                                            </View>

                                            <View style={styles.ContentConainer}>
                                                {loading || this.state.data === null
                                                    ?
                                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                        <ActivityIndicator color='#ddd' size='small' />
                                                    </View>
                                                    :
                                                    <View>
                                                        {info.map((info2, index2) => <MyItem data={info2} key={index2} index={index2} />)}
                                                    </View>}
                                            </View>
                                        </TouchableOpacity>
                                    </View>)}
                                    <View style={{ width: 20 }} />
                                </ScrollView>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginLeft: 12 }}>
                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}><Text style={{ fontSize: 14, marginLeft: 10 }}>1학년</Text></View>
                            </View>
                            <View style={{ width: WIDTH }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never'>
                                    <View style={{ paddingHorizontal: 20, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                        {classList.map((info, index2) =>
                                            <TouchableWithoutFeedback key={index2} onPress={() => {
                                                if (this.state.isImageUploading) return;
                                                this.setState({ grade: 1, class_: index2 + 1 })
                                            }}>
                                                <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.grade === 1 && this.state.class_ === index2 + 1 ? '#888' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.grade === 1 && this.state.class_ === index2 + 1 ? '#888' : 'white' }}>
                                                    <Text style={{ fontSize: 12, color: this.state.grade === 1 && this.state.class_ === index2 + 1 ? 'white' : 'black' }}>{info}반</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginLeft: 12 }}>
                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}><Text style={{ fontSize: 14, marginLeft: 10 }}>2학년</Text></View>
                            </View>
                            <View style={{ width: WIDTH }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never'>
                                    <View style={{ paddingHorizontal: 20, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                        {classList.map((info, index2) =>
                                            <TouchableWithoutFeedback key={index2} onPress={() => {
                                                if (this.state.isImageUploading) return;
                                                this.setState({ grade: 2, class_: index2 + 1 })
                                            }}>
                                                <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.grade === 2 && this.state.class_ === index2 + 1 ? '#888' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.grade === 2 && this.state.class_ === index2 + 1 ? '#888' : 'white' }}>
                                                    <Text style={{ fontSize: 12, color: this.state.grade === 2 && this.state.class_ === index2 + 1 ? 'white' : 'black' }}>{info}반</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )}
                                    </View>
                                </ScrollView>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', height: 40, marginLeft: 12 }}>
                                <View style={{ flex: 1, alignItems: 'center', flexDirection: 'row' }}><Text style={{ fontSize: 14, marginLeft: 10 }}>3학년</Text></View>
                            </View>
                            <View style={{ width: WIDTH }}>
                                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} overScrollMode='never'>
                                    <View style={{ paddingHorizontal: 20, height: 40, flexDirection: 'row', alignItems: 'center' }}>
                                        {classList.map((info, index2) =>
                                            <TouchableWithoutFeedback key={index2} onPress={() => {
                                                if (this.state.isImageUploading) return;
                                                this.setState({ grade: 3, class_: index2 + 1 })
                                            }}>
                                                <View style={{ height: 26, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center', borderRadius: 13, borderWidth: 1, borderColor: this.state.grade === 3 && this.state.class_ === index2 + 1 ? '#888' : '#dbdbdb', marginLeft: 10, backgroundColor: this.state.grade === 3 && this.state.class_ === index2 + 1 ? '#888' : 'white' }}>
                                                    <Text style={{ fontSize: 12, color: this.state.grade === 3 && this.state.class_ === index2 + 1 ? 'white' : 'black' }}>{info}반</Text>
                                                </View>
                                            </TouchableWithoutFeedback>
                                        )}
                                    </View>
                                </ScrollView>
                            </View>
                        </ScrollView>
                        <MyActionSheet
                            visible={this.state.visible}
                            contents={this.state.url ? ['앨범에서 가져오기', '카메라로 촬영하기', '사진보기'] : ['앨범에서 가져오기', '카메라로 촬영하기']}
                            onClicked={this.onUnVisibled}
                            closeHandle={() => this.setState({ visible: false })} />
                    </View>
                }}
            </Query>
        )
    }
}




const styles = StyleSheet.create({
    Container: {
        width: 139,
        height: 224,
        backgroundColor: 'white',
        alignSelf: 'center',
        borderRadius: 20,
        marginLeft: 10,
        marginRight: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    TitleContainer: {
        width: 100,
        height: 30,
        backgroundColor: '#8293FF',
        borderTopLeftRadius: 20,
        borderBottomRightRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    TitleText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
    },
    ContentConainer: {
        padding: 12,
        height: 170,
        width: 139
    },

    ButtonConainer: {
        width: '100%',
        height: 24,
    },
    Button: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%'
    }

})


class MyItem extends Component {
    render() {
        const { data, index, title } = this.props;
        return (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: title == 'Meal' ? 2 : title == 'Notification' ? 2 : 1 }}>
                <View style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: (index % 2 == 0 ? Colors.red : Colors.blue),
                }}
                />
                <Text numberOfLines={1} style={{ fontSize: 14, lineHeight: 20, marginLeft: 6 }}>{data}</Text>
            </View>
        )
    }
}

const subjects = {
    first: ["없음", "수학", "영어", "과학", "세계사"],
    second: ["없음", "수학", "영어", "과학", "세계사", "물리"],
    third: ["없음", "수학", "영어", "과학", "세계사", "체육"],
}

const mapData = [1, 2, 3, 4, 5, 6, 7];

export class ModifySubjectScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '시간표 수정',
            headerRight: (
                <BaseButton onPress={navigation.getParam('myUpdateHandle')} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <Text style={{ color: Colors.highlightBlue, fontSize: 18 }}>수정</Text>
                </BaseButton>
            ),
        }
    };
    constructor(props) {
        super(props);
        this.state = {
            info: this.props.navigation.state.params.info.filter(f => true),
            visible: false,
            clicked: 0,
        }
    }

    componentDidMount() {
        this.props.navigation.setParams({ myUpdateHandle: this._updateHandle });
    }

    _updateHandle = () => {
        this.props.navigation.goBack();
        this.props.navigation.state.params.updateHandle(this.state.info, this.props.navigation.state.params.dayIndex);
    }
    onUnVisibled = (index) => {
        let i = this.state.info;
        if (index === 0) i[this.state.clicked] = ' ';
        else i[this.state.clicked] = this.props.navigation.state.params.wholeSubjectList[index];
        this.setState({ visible: false, info: i });
    }

    render() {
        return (
            <ScrollView style={{ flex: 1, paddingTop: 20 }}>
                {mapData.map((data2, index) =>
                    <TouchableOpacity key={index} onPress={() => this.setState({ visible: true, clicked: index })} activeOpacity={1} style={{ width: WIDTH, height: 60, alignItems: 'center', paddingHorizontal: 30, flexDirection: 'row', marginBottom: 20, justifyContent: 'center' }}>
                        <Text style={{ fontSize: 20, marginRight: 20 }}>{data2}교시</Text>
                        <Text style={{ fontSize: 16, color: !this.state.info[index] || this.state.info[index] === ' ' ? Colors.red : 'black' }}>{!this.state.info[index] || this.state.info[index] === ' ' ? "없음" : this.state.info[index]}</Text>
                    </TouchableOpacity>
                )}

                <MyActionSheet
                    visible={this.state.visible}
                    contents={this.props.navigation.state.params.wholeSubjectList}
                    onClicked={this.onUnVisibled}
                    closeHandle={() => this.setState({ visible: false })} />
            </ScrollView>
        )
    }
}