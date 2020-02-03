import React, { Component } from 'react'
import { Text, View, Dimensions, Platform, FlatList, ActivityIndicator, TouchableOpacity, Alert, AsyncStorage, Modal } from 'react-native'
import gql from 'graphql-tag'
import { Colors } from '../Components/Asset';
import { Query, Mutation } from 'react-apollo'
import { BaseButton } from 'react-native-gesture-handler';
import MyActionSheet from '../Components/MyActionSheet';
// import { LinearGradient, Constants, IntentLauncherAndroid as IntentLauncher, ImageManipulator, ImagePicker, Permissions } from 'expo';
import Constants from 'expo-constants';
import * as ImageManipulator from 'expo-image-manipulator';
import * as IntentLauncher from 'expo-intent-launcher';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { LinearGradient } from 'expo-linear-gradient';
import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import { RNS3 } from 'react-native-aws3';


const options = {
    keyPrefix: "uploads/timetableImages/",
    bucket: "schoolapp2019",
    region: "us-west-2",
    accessKey: "",
    secretKey: "",
    successActionStatus: 201
}
let date = moment().format('YYYYMMDDHHmmss');
let count = 0;
const WIDTH = Dimensions.get('window').width;
const SCREENWIDTH = Dimensions.get('window').width;
const listExam = gql`
query listExamSubjectsByGrade($grade: Int!) {
    listExamSubjectsByGrade(grade: $grade) {
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
const deleteHomework = gql`
mutation deleteExamSubject($postid: String!, $adminid: String) {
    deleteExamSubject(postid: $postid, adminid: $adminid) {
        postid
    }
}
`

const updateExam = gql`
mutation updateExam($input: UpdateExamInput!, $adminid: String) {
    updateExam(input: $input, adminid: $adminid) {
        dday
    }
}
`
const getExam = gql`
query getExam {
    getExam {
        timeTable
        date
        startDate
        endDate
    }
}
`


export default class ContestScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grade: 1,
            dateVisible: false,
            picVisible: false,
            startDate: '2019-09-02',
            endDate: '2019-09-05',
            timeTable: null,
            isImageUploading: false,
            userid: null,
        }
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');
    }
    async componentDidMount() {
        count = 0;
        date = moment().format('YYYYMMDDHHmmss');
        this.userid = await AsyncStorage.getItem('ID');
        this.setState({ userid: this.userid });
    }

    _upload2S3(uri) {
        ImageManipulator.manipulateAsync(uri, [], { compress: 0.8, format: 'jpeg' }).then(response => {
            RNS3.put(this.getFile(response.uri), options).then(res => {
                const input = {
                    timeTable: res.body.postResponse.location
                }
                this.updateExam({ variables: { input: input, adminid: `${this.state.userid}(${Constants.deviceName})` } }).then(res2 => {
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
        this.setState({ picVisible: false });
        if (index == 0) {
            this.setState({ isCameraMode: false, isImageUploading: true });
            setTimeout(() => {
                this._openGellary();
            }, 100);
        } else if (index == 1) {
            this.setState({ isCameraMode: true, isImageUploading: true });
            this._openCamera();
        } else if (index == 2) {
            if (this.state.timeTable === null) return;
            this.props.navigation.navigate('A_Photo', { image: this.state.timeTable });
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
            <View style={{ flex: 1 }}>
                <Query query={getExam} fetchPolicy='network-only' onCompleted={data => this.setState({ startDate: data.getExam.startDate, endDate: data.getExam.endDate, timeTable: data.getExam.timeTable })}>
                    {({ refetch }) => {
                        if (this.refetchQuery === undefined) this.refetchQuery = refetch;
                        return null;
                    }}
                </Query>
                <Mutation mutation={updateExam}>
                    {(updateExam) => {
                        if (this.updateExam === undefined) this.updateExam = updateExam;
                        return null;
                    }}
                </Mutation>
                <View style={{ width: WIDTH, height: 40, flexDirection: 'row' }}>
                    <BaseButton onPress={() => this.props.navigation.navigate('A_PostExam', { grade: this.state.grade })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}>
                        <Text>{this.state.grade}학년 등록</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ dateVisible: true })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}>
                        <Text>기간</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ picVisible: true })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.lightBlue }}>
                        <Text>시험표</Text>
                    </BaseButton>
                </View>
                <View style={{ width: WIDTH, height: 40, flexDirection: 'row' }}>
                    <BaseButton onPress={() => this.setState({ grade: 1 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 1 ? Colors.lightRed : 'white' }}>
                        <Text>1학년</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ grade: 2 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 2 ? Colors.lightRed : 'white' }}>
                        <Text>2학년</Text>
                    </BaseButton>
                    <BaseButton onPress={() => this.setState({ grade: 3 })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.grade === 3 ? Colors.lightRed : 'white' }}>
                        <Text>3학년</Text>
                    </BaseButton>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Mutation mutation={deleteHomework}>
                        {(deleteHomework) => (
                            <Query query={listExam} variables={{ grade: this.state.grade }} fetchPolicy='network-only'>
                                {({ loading, data, refetch }) => {
                                    if (loading) return <ActivityIndicator size='large' />
                                    return data.listExamSubjectsByGrade.items && <FlatList
                                        keyExtractor={(item, index) => item.postid}
                                        data={data.listExamSubjectsByGrade.items}
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
                                                <TouchableOpacity style={{ width: SCREENWIDTH - 40 }} onPress={() => this.props.navigation.navigate('A_ExamDetail', { postid: info.postid })} activeOpacity={1}>
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
                                                                this.props.navigation.navigate('A_Photo', { image: info.pics, index: 0 })
                                                            } else {
                                                                Alert.alert('사진이 없습니다');
                                                            }
                                                        }
                                                        } style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontSize: 14, color: 'white' }}>사진보기</Text>
                                                        </BaseButton>}
                                                        <BaseButton onPress={() => this.props.navigation.navigate('A_Comment', { postid: info.postid, type: 'exam' })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                            <Text style={{ fontSize: 14, color: 'white' }}>댓글</Text>
                                                        </BaseButton>
                                                        <BaseButton onPress={() => { this.props.navigation.navigate('A_UpdateExam', { postid: info.postid, grade: this.state.grade }) }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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

                    <MyActionSheet
                        visible={this.state.picVisible}
                        contents={this.state.timeTable ? ['앨범에서 가져오기', '카메라로 촬영하기', '사진보기'] : ['앨범에서 가져오기', '카메라로 촬영하기']}
                        onClicked={this.onUnVisibled}
                        closeHandle={() => this.setState({ picVisible: false })} />




                    <Modal
                        transparent={true}
                        visible={this.state.dateVisible}
                        onRequestClose={() => this.setState({ dateVisible: false })}
                    >
                        <View style={{ flex: 1, backgroundColor: '#88888888', alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: WIDTH - 80, backgroundColor: 'white', borderRadius: 20, alignItems: 'center' }}>
                                <Text style={{ marginTop: 10 }}>시험시작</Text>
                                <DatePicker
                                    style={{ margin: 10, padding: 0 }}
                                    date={this.state.startDate}
                                    mode="date"
                                    placeholder="날짜를 골라주세요"
                                    format="YYYY-MM-DD"
                                    minDate='2019-10-01'
                                    maxDate='2040-03-01'
                                    confirmBtnText="확인"
                                    cancelBtnText="취소"
                                    showIcon={false}
                                    customStyles={{
                                        dateInput: {
                                            borderWidth: 0,
                                            marginLeft: 0
                                        },
                                        dateText: {
                                            fontSize: 14,
                                            color: 'black',
                                            margin: 0,
                                            padding: 0
                                        },
                                        dateTouchBody: {
                                            margin: 0,
                                            padding: 0
                                        }

                                    }}
                                    onDateChange={(date) => { this.setState({ startDate: date }) }}
                                />
                                <Text>시험끝</Text>
                                <DatePicker
                                    style={{ margin: 10, padding: 0 }}
                                    date={this.state.endDate}
                                    mode="date"
                                    placeholder="날짜를 골라주세요"
                                    format="YYYY-MM-DD"
                                    minDate='2019-10-01'
                                    maxDate='2040-03-01'
                                    confirmBtnText="확인"
                                    cancelBtnText="취소"
                                    showIcon={false}
                                    customStyles={{
                                        dateInput: {
                                            borderWidth: 0,
                                            marginLeft: 0
                                        },
                                        dateText: {
                                            fontSize: 14,
                                            color: 'black',
                                            margin: 0,
                                            padding: 0
                                        },
                                        dateTouchBody: {
                                            margin: 0,
                                            padding: 0
                                        }

                                    }}
                                    onDateChange={(date) => { this.setState({ endDate: date }) }}
                                />
                                <Mutation mutation={updateExam}>
                                    {(updateExam) => (
                                        <View style={{ width: '100%', height: 50, flexDirection: 'row' }}>
                                            <TouchableOpacity onPress={() => {
                                                const input = {
                                                    startDate: this.state.startDate,
                                                    endDate: this.state.endDate
                                                }
                                                updateExam({ variables: { input: input, adminid: `${this.state.userid}(${Constants.deviceName})` } });
                                                this.setState({ dateVisible: false })
                                            }} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text>저장</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => this.setState({ dateVisible: false })} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Text>취소</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </Mutation>

                            </View>
                        </View>
                    </Modal>
                </View>
            </View >
        )
    }
}
