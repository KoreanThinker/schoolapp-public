import React, { Component } from 'react'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { Platform, Text, View, ActivityIndicator, AsyncStorage } from "react-native";
import MainScreen from './Screens/MainScreen';
import PhotoScreen from './Screens/PhotoScreen';
import CommentScreen from './Screens/CommentScreen';
import CameraScreen from './Screens/CameraScreen'
import BusScreen from './Screens/BusScreen';
import PostScreen, { ContentScreen } from './Screens/PostScreen';
import NotificationScreen, { MyNotificationScreen } from './Screens/NotificationScreen';
import { MyPostScreen, MyCommentScreen, BookmarkScreen } from './Screens/PostDataScreen';
import DetailScreen from './Screens/DetailScreen';
import SearchScreen from './Screens/SearchScreen';
import ContestScreen from './Screens/ContestScreen';
import ExamScreen from './Screens/ExamScreen';
import SettingScreen from './Screens/SettingScreen';
import AlertScreen from './Screens/AlertScreen';
import ProfileTab, { nameChange, numberChange, RankingInfoScreen, ChoiceSubjectScreen, EssentialSubjectScreen } from './Screens/ProfileTabScreen';
import HomeIcon from './Icons/barHome.svg';
import HomeFocus from './Icons/barHomeFocus.svg';
import PlusIcon from './Icons/barPlus.svg';
import PlusFocus from './Icons/barPlusFocus.svg';
import ProfileIcon from './Icons/barProfile.svg';
import ProfileFocus from './Icons/barProfileFocus.svg';
import SignInScreen from './loginScreens/SignInScreen';
import SignUpScreen from './loginScreens/SignUpScreen';
import NotificationPostScreen, { NotificationContentScreen } from './Screens/NotificationPostScreen';
import HomeworkIcon from './Icons/homework.svg';
import HomeworkFocus from './Icons/homeworkFocus.svg';
import NewContestIcon from './Icons/newContestIcon.svg';
import gql from 'graphql-tag'
import { Query, Mutation } from 'react-apollo'

import { BaseButton } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';


import { Colors } from './Components/Asset';
import SignChoiceSubjectScreen from './loginScreens/SignChoiceSubjectScreen';
import SignUpFacebookScreen from './loginScreens/SignUpFacebookScreen';
import ExamDetailScreen from './Screens/ExamDetailScreen';
import ContestDetailScreen from './Screens/ContestDetailScreen';
import HomeworkDetailScreen from './Screens/HomeworkDetailScreen';
import PolicyScreen from './loginScreens/PolicyScreen';


//admin
import A_HomeScreen from './Admin/Screens/HomeScreen';
import A_ContestScreen from './Admin/Screens/ContestScreen';
import A_TimeTableScreen, { ModifySubjectScreen } from './Admin/Screens/TimeTableScreen';
import A_ExamScreen from './Admin/Screens/ExamScreen';
import A_NotificationScreen from './Admin/Screens/NotificationScreen';
import A_PhotoScreen from './Admin/Screens/PhotoScreen';
import A_CameraScreen from './Admin/Screens/CameraScreen';
import A_ChangeSubjectsScreen from './Admin/Screens/ChangeSubjectsScreen';
import A_ChangeEssentialSubjectScreen from './Admin/Screens/ChangeEssentialSubjectScreen';
import A_ChangeChoiceSubjectScreen from './Admin/Screens/ChangeChoiceSubjectScreen';
import A_CommentScreen from './Admin/Screens/CommentScreen';
import A_HomeworkPostScreen from './Admin/Screens/HomeworkPostScreen';
import A_HomeworkUpdateScreen from './Admin/Screens/HomeworkUpdateScreen';
import A_ContestPostScreen from './Admin/Screens/ContestPostScreen';
import A_ContestUpdateScreen from './Admin/Screens/ContestUpdateScreen';
import A_ExamPostScreen from './Admin/Screens/ExamPostScreen';
import A_ExamUpdateScreen from './Admin/Screens/ExamUpdateScreen';
import A_LogScreen from './Admin/Screens/LogScreen';
import A_ReportScreen from './Admin/Screens/ReportScreen';
import A_DetailScreen from './Admin/Screens/DetailScreen';
import A_NotificationScreenRemove from './Admin/Screens/NotificationScreenRemove';
import A_MainScreen from './Admin/Screens/MainScreen';
import A_SchoolSchadule from './Admin/Screens/SchoolSchadule';
import A_TagScreen from './Admin/Screens/TagScreen';
import A_AdminListScreen from './Admin/Screens/AdminListScreen';
import A_SearchUserScreen from './Admin/Screens/SearchUserScreen';
import { A_SearchCommentScreen, A_SearchPostScreen } from './Admin/Screens/SearchDataScreen';
import A_EventPostScreen from './Admin/Screens/EventPostScreen';


const getExam = gql`
query getExam {
    getExam {
        dday
    }
}
`
const listHomework = gql`
query listHomework($userid: String!) {
    listHomework(userid: $userid) {
        items {
            postid
        }
    }
}
`

const FadeTransition = (index, position) => {
    const sceneRange = [index - 1, index];
    const outputOpacity = [0, 1];
    const transition = position.interpolate({
        inputRange: sceneRange,
        outputRange: outputOpacity,
    });

    return {
        opacity: transition
    }
}

const BottomTransition = (index, position, height) => {
    const sceneRange = [index - 1, index, index + 1];
    const outputHeight = [height, 0, 0];
    const transition = position.interpolate({
        inputRange: sceneRange,
        outputRange: outputHeight,
    });

    return {
        transform: [{ translateY: transition }]
    }
}
const RightTransition = (index, position, width) => {
    const sceneRange = [index - 1, index, index + 1];
    const outputWidth = [width, 0, 0];
    const transition = position.interpolate({
        inputRange: sceneRange,
        outputRange: outputWidth,
    });

    return {
        transform: [{ translateX: transition }]
    }
}

const LeftTransition = (index, position, width) => {
    const sceneRange = [index - 1, index, index + 1];
    const outputWidth = [-width, 0, 0];
    const transition = position.interpolate({
        inputRange: sceneRange,
        outputRange: outputWidth,
    });

    return {
        transform: [{ translateX: transition }]
    }
}

const NavigationConfig = () => {
    return {
        screenInterpolator: (sceneProps) => {
            const position = sceneProps.position;
            const scene = sceneProps.scene;
            const index = scene.index;
            const height = sceneProps.layout.initHeight;
            const width = sceneProps.layout.initWidth;
            const routeName = scene.route.routeName;

            if (Platform.OS === 'ios') {
                return RightTransition(index, position, width);
            }
            if (routeName == 'Contest') {
                return RightTransition(index, position, width);
            } else if (routeName == 'Exam') {
                return LeftTransition(index, position, width);
            }

            if (Platform.OS == 'ios' && !routeName == "Photo") {
                return RightTransition(index, position, width);
            }
            else if (routeName == "Comment") {
                return RightTransition(index, position, width);
            }
            else if (routeName == "Photo" || routeName == "Bus" || routeName == "Notification") {
                return BottomTransition(index, position, height);
            }


        }
    }
}





class ContestIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userid: null,
            lastHomework: null,
            isFocused: false,
        }
    }
    async componentDidMount() {
        const userid = await AsyncStorage.getItem('ID');
        const lastHomework = await AsyncStorage.getItem('LASTHOMEWORK');
        this.setState({ userid: userid, lastHomework: lastHomework !== null ? lastHomework : 'error' });
    }
    render() {
        const { focused } = this.props;
        return (
            this.state.userid === null || this.state.lastHomework === null ?
                <View style={{ top: 2 }}><ActivityIndicator size='small' color='#ddd' /></View>
                :
                <Query query={listHomework} variables={{ userid: this.state.userid }} fetchPolicy='network-only'>
                    {({ loading, data }) => {
                        if (loading) return <View style={{ top: 2 }}><ActivityIndicator size='small' color='#ddd' /></View>
                        if (focused) {
                            if (data.listHomework.items.length === 0) {
                                AsyncStorage.removeItem('LASTHOMEWORK');
                                if (this.state.lastHomework !== 'error') this.setState({ lastHomework: 'error', isFocused: true });

                            } else {
                                AsyncStorage.setItem('LASTHOMEWORK', data.listHomework.items[0].postid);
                                if (this.state.lastHomework !== data.listHomework.items[0].postid) this.setState({ lastHomework: data.listHomework.items[0].postid, isFocused: true });
                            }
                            return <HomeworkFocus style={{ top: 2 }} />
                        }
                        else {
                            if (this.state.isFocused || data.listHomework.items.length === 0 || data.listHomework.items[0].postid === this.state.lastHomework || this.state.lastHomework === 'error') {
                                return <HomeworkIcon style={{ top: 2 }} />
                            } else {
                                return <NewContestIcon style={{ top: 2 }} />
                            }
                        }
                    }}
                </Query>
        )
    }
}

const BottomTab = createBottomTabNavigator(
    {
        Home: {
            screen: MainScreen,
            navigationOptions: {
                title: '홈',
                tabBarIcon: ({ focused }) => {
                    if (focused) return <HomeFocus style={{ top: 2 }} />
                    else return <HomeIcon style={{ top: 2 }} />
                }
            }
        },
        Contest: {
            screen: ContestScreen,
            navigationOptions: {
                title: '수행/대회',
                tabBarIcon: ({ focused }) => {
                    if (focused) return <HomeworkFocus style={{ top: 2 }} />
                    else return <HomeworkIcon style={{ top: 2 }} />
                }
            }
        },
        PostTab: {
            screen: () => null,
            navigationOptions: {
                tabBarIcon: ({ focused }) => {
                    if (focused) return <PlusFocus style={{ top: 2 }} />
                    else return <PlusIcon style={{ top: 2 }} />
                },
                tabBarOnPress: ({ navigation }) => {
                    navigation.navigate('Post');
                },
                title: '게시하기'
            },
        },
        Exam:
        {
            screen: ExamScreen,
            navigationOptions: {
                title: '시험',
                tabBarIcon: ({ focused }) => {
                    return <Query query={getExam} fetchPolicy='network-only'>
                        {({ loading, data }) => {
                            if (!loading && this.dday === undefined && data.getExam.dday) this.dday = data.getExam.dday;
                            if (focused) return <View style={{ top: 2 }}>
                                {loading
                                    ?
                                    <ActivityIndicator size='small' color={Colors.blue} />
                                    :
                                    <Text style={{ color: Colors.blue, fontSize: 15, fontWeight: 'bold' }}>{this.dday}</Text>}
                            </View>
                            else return <View style={{ top: 2 }}>
                                {loading
                                    ?
                                    <ActivityIndicator size='small' color='#ddd' />
                                    :
                                    <Text style={{ color: '#777', fontSize: 15 }}>{this.dday}</Text>}
                            </View>
                        }}
                    </Query>
                }
            }
        },
        ProfileTab:
        {
            screen: ProfileTab,
            navigationOptions: {
                title: '내 정보',
                tabBarIcon: ({ focused }) => {
                    if (focused) return <ProfileFocus style={{ top: 2 }} />
                    else return <ProfileIcon style={{ top: 2 }} />
                },
            }
        },
    },
    {
        initialRouteName: 'Home',
        navigationOptions: {
            header: null,
        },
        tabBarOptions: {
            activeTintColor: Colors.blue,
            inactiveTintColor: Colors.gray,
            labelStyle: {
                bottom: 2
            }
        },
    }
)


const A_BottomTab = createBottomTabNavigator(
    {
        Home: {
            screen: A_HomeScreen,
            navigationOptions: {
                title: '홈',
            }
        },
        Contest: {
            screen: A_ContestScreen,
            navigationOptions: {
                title: '수행/대회',
            }
        },
        Timetable: {
            screen: A_TimeTableScreen,
            navigationOptions: {
                title: '시간표',
            }
        },
        Exam: {
            screen: A_ExamScreen,
            navigationOptions: {
                title: '시험',
            }
        },
        Notification: {
            screen: A_NotificationScreen,
            navigationOptions: {
                title: '공지',
            }
        },
    },
    {
        initialRouteName: 'Home',
        navigationOptions: {
            headerLeft: null,
            headerStyle: {
                height: 0
            }
        },
        tabBarOptions: {
            activeTintColor: Colors.blue,
            inactiveTintColor: Colors.gray,
            labelStyle: {
                bottom: 2
            }
        },
    }
)

const AppNavigator = createStackNavigator(
    {
        //user
        Bottom: BottomTab,
        Photo: PhotoScreen,
        Comment: CommentScreen,
        Camera: CameraScreen,
        Bus: BusScreen,
        Post: PostScreen,
        Post_Content: ContentScreen,
        Notification: NotificationScreen,
        MyPost: MyPostScreen,
        MyComment: MyCommentScreen,
        Bookmark: BookmarkScreen,
        Detail: DetailScreen,
        Search: SearchScreen,
        Contest: ContestScreen,
        Setting: SettingScreen,
        Alert: AlertScreen,
        SignIn: SignInScreen,
        SignUp: SignUpScreen,
        NameChange: nameChange,
        NumberChange: numberChange,
        NotificationPost: NotificationPostScreen,
        NotificationContent: NotificationContentScreen,
        MyNotification: MyNotificationScreen,
        RankingInfo: RankingInfoScreen,
        ChoiceSubject: ChoiceSubjectScreen,
        EssentialSubject: EssentialSubjectScreen,
        SignChoice: SignChoiceSubjectScreen,
        SignUpFacebook: SignUpFacebookScreen,
        ExamDetail: ExamDetailScreen,
        ContestDetail: ContestDetailScreen,
        HomeworkDetail: HomeworkDetailScreen,
        Policy: PolicyScreen,

        //admin
        A_Bottom: A_BottomTab,
        A_Photo: A_PhotoScreen,
        A_Camera: A_CameraScreen,
        A_ModifySubject: ModifySubjectScreen,
        A_ChangeSubjects: A_ChangeSubjectsScreen,
        A_Essential: A_ChangeEssentialSubjectScreen,
        A_Choice: A_ChangeChoiceSubjectScreen,
        A_Comment: A_CommentScreen,
        A_PostHomework: A_HomeworkPostScreen,
        A_PostContest: A_ContestPostScreen,
        A_PostExam: A_ExamPostScreen,
        A_UpdateExam: A_ExamUpdateScreen,
        A_UpdateHomework: A_HomeworkUpdateScreen,
        A_UpdateContest: A_ContestUpdateScreen,
        A_Log: A_LogScreen,
        A_Report: A_ReportScreen,
        A_Detail: A_DetailScreen,
        A_NotificationRemove: A_NotificationScreenRemove,
        A_Main: A_MainScreen,
        A_Schadule: A_SchoolSchadule,
        A_Tag: A_TagScreen,
        A_AdminList: A_AdminListScreen,
        A_SearchUser: A_SearchUserScreen,
        A_SearchPost: A_SearchPostScreen,
        A_SearchComment: A_SearchCommentScreen,
        A_EventPost: A_EventPostScreen,
    },
    {
        transitionConfig: NavigationConfig,
        initialRouteName: 'Bottom',
        defaultNavigationOptions: ({ navigation }) => ({
            headerStyle: {
                height: 50
            },
            headerLeft:
                <BaseButton onPress={() => navigation.goBack()} style={{ alignItems: 'center', justifyContent: 'center', height: 50, width: 50 }} >
                    <AntDesign name='arrowleft' size={20} style={{ margin: 0 }} />
                </BaseButton>
            ,
            headerTitleStyle: {
                fontWeight: '200',
                color: 'black'
            },
        }),

    }
);


export default createAppContainer(AppNavigator);