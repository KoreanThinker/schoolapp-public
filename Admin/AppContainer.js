import React, { Component } from 'react'
import { Text } from 'react-native'
import { createStackNavigator, createAppContainer, createBottomTabNavigator } from "react-navigation";
import { Platform } from "react-native";
import { BaseButton } from 'react-native-gesture-handler';
import { AntDesign } from '@expo/vector-icons';
import { Colors } from './Components/Asset';
import HomeScreen from './Screens/HomeScreen';
import ContestScreen from './Screens/ContestScreen';
import TimeTableScreen, { ModifySubjectScreen } from './Screens/TimeTableScreen';
import ExamScreen from './Screens/ExamScreen';
import NotificationScreen from './Screens/NotificationScreen';
import PhotoScreen from './Screens/PhotoScreen';
import CameraScreen from './Screens/CameraScreen';
import CheckAcount from './Screens/CheckAcount';
import ChangeSubjectsScreen from './Screens/ChangeSubjectsScreen';
import ChangeEssentialSubjectScreen from './Screens/ChangeEssentialSubjectScreen';
import ChangeChoiceSubjectScreen from './Screens/ChangeChoiceSubjectScreen';
import CommentScreen from './Screens/CommentScreen';
import HomeworkPostScreen from './Screens/HomeworkPostScreen';
import HomeworkUpdateScreen from './Screens/HomeworkUpdateScreen';
import ContestPostScreen from './Screens/ContestPostScreen';
import ContestUpdateScreen from './Screens/ContestUpdateScreen';
import ExamPostScreen from './Screens/ExamPostScreen';
import ExamUpdateScreen from './Screens/ExamUpdateScreen';
import LogScreen from './Screens/LogScreen';
import ReportScreen from './Screens/ReportScreen';
import DetailScreen from './Screens/DetailScreen';
import NotificationScreenRemove from './Screens/NotificationScreenRemove';
import MainScreen from './Screens/MainScreen';
import SchoolSchadule from './Screens/SchoolSchadule';
import TagScreen from './Screens/TagScreen';


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

            if (routeName == 'Contest') {
                return RightTransition(index, position, width);
            } else if (routeName == 'Exam') {
                return LeftTransition(index, position, width);
            }

            if (Platform.OS == 'ios') {
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


const A_BottomTab = createBottomTabNavigator(
    {
        Home: {
            screen: HomeScreen,
            navigationOptions: {
                title: '홈',
            }
        },
        Contest: {
            screen: ContestScreen,
            navigationOptions: {
                title: '수행/대회',
            }
        },
        Timetable: {
            screen: TimeTableScreen,
            navigationOptions: {
                title: '시간표',
            }
        },
        Exam: {
            screen: ExamScreen,
            navigationOptions: {
                title: '시험',
            }
        },
        Notification: {
            screen: NotificationScreen,
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
        Bottom: BottomTab,
        Photo: PhotoScreen,
        Camera: CameraScreen,
        ModifySubject: ModifySubjectScreen,
        Check: CheckAcount,
        ChangeSubjects: ChangeSubjectsScreen,
        Essential: ChangeEssentialSubjectScreen,
        Choice: ChangeChoiceSubjectScreen,
        Comment: CommentScreen,
        PostHomework: HomeworkPostScreen,
        PostContest: ContestPostScreen,
        PostExam: ExamPostScreen,
        UpdateExam: ExamUpdateScreen,
        UpdateHomework: HomeworkUpdateScreen,
        UpdateContest: ContestUpdateScreen,
        Log: LogScreen,
        Report: ReportScreen,
        Detail: DetailScreen,
        NotificationRemove: NotificationScreenRemove,
        Main: MainScreen,
        Schadule: SchoolSchadule,
        Tag: TagScreen,
    },
    {
        transitionConfig: NavigationConfig,
        initialRouteName: 'Check',
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