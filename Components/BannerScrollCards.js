import React, { Component } from 'react'
import { Text, StyleSheet, View, TouchableOpacity, TouchableWithoutFeedback, ActivityIndicator, AsyncStorage } from 'react-native'
import { BorderlessButton, BaseButton } from 'react-native-gesture-handler';
import { Colors } from './Asset';
import MealIcon from '../Icons/cardTimetable.svg';
import EnterIcon from '../Icons/cardEnter.svg';
import MoreIcon from '../Icons/cardMore.svg';
import RefrashIcon from '../Icons/cardRefresh.svg';
import Yellowbus from '../Icons/yellowBus.svg';
import BlueBus from '../Icons/blueBus.svg';
import RedBus from '../Icons/redBus.svg';
import GreenBus from '../Icons/greenBus.svg';
import Plus from '../Icons/plusLightGray.svg';

import gql from 'graphql-tag'
import { Query } from 'react-apollo'

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

const getLunch = gql`
query getLunch {
  getLunch {
    menu
    url
  }
}
`

let lunchList = null;
let lunchUrl = null;
export class Meal extends Component {
    render() {
        return (
            <Query query={getLunch} fetchPolicy='cache-and-network' >
                {({ data, loading }) => {
                    if (!loading && (lunchList === null || lunchList !== data.getLunch.menu)) lunchList = data.getLunch.menu;
                    if (!loading && (lunchUrl === null || lunchList !== data.getLunch.url)) lunchUrl = data.getLunch.url;
                    return <View style={styles.Container}>
                        <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={this.props.onClick}>
                            <View style={styles.TitleContainer}>
                                <Text style={styles.TitleText}>급식</Text>
                            </View>

                            {lunchList === null
                                ?
                                <View style={styles.ContentConainer}>
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color='#ddd' size='small' />
                                    </View>

                                </View>
                                :
                                <View style={styles.ContentConainer}>
                                    {lunchList && lunchList.length > 0 ?
                                        lunchList.map(
                                            (info, index) => (
                                                <MyItem data={info} index={index} key={index} title='Meal' />
                                            ))
                                        :
                                        <MyItem data='정보없음' index={0} key={0} title='Meal' />}
                                    {/* {(data.getLunch.menu !== null && data.getLunch.menu.length > 0) ?
                                        data.getLunch.menu.map(
                                            (info, index) => (
                                                <MyItem data={info} index={index} key={index} title='Meal' />
                                            ))
                                        :
                                        <MyItem data='정보없음' index={0} key={0} title='Meal' />} */}
                                </View>}

                            <View style={styles.ButtonConainer}>
                                <TouchableOpacity onPress={() => {
                                    if (loading) return;
                                    this.props.navigation.navigate('Photo', { image: lunchUrl });
                                }} style={styles.Button}><MealIcon /></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                }}
            </Query>
        )
    }
}

const getSubjects = gql`
query getSubjects($grade: Int!, $class_: Int!) {
    getSubjects(grade: $grade, class_: $class_) {
        todaySubjects
        url
    }
}
`
let myTime = null;
let myTimeUrl = null;
export class Timetable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: null,
            url: null,
            grade: null,
            class: null,
        }
    }

    _buttonHandle = () => {
        if (!myTimeUrl) return;
        this.props.navigation.navigate('Photo', { image: myTimeUrl });
    }
    render() {
        return (
            <Query query={getSubjects} variables={{ grade: this.props.grade, class_: this.props.class_ }} fetchPolicy='cache-and-network'>
                {({ loading, data }) => {
                    if (!loading && (myTime === null || myTime !== data.getSubjects.todaySubjects)) myTime = data.getSubjects.todaySubjects;
                    if (!loading && (myTimeUrl === null || myTimeUrl !== data.getSubjects.url)) myTimeUrl = data.getSubjects.url;
                    return <View style={styles.Container}>
                        <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={this.props.onClick}>
                            <View style={styles.TitleContainer}>
                                <Text style={styles.TitleText}>시간표</Text>
                            </View>

                            <View style={styles.ContentConainer}>
                                {myTime === null
                                    ?
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color='#ddd' size='small' />
                                    </View>
                                    :
                                    <View>
                                        <MyItem data={myTime[0] ? myTime[0] : ''} key={0} index={0} />
                                        <MyItem data={myTime[1] ? myTime[1] : ''} key={1} index={1} />
                                        <MyItem data={myTime[2] ? myTime[2] : ''} key={2} index={2} />
                                        <MyItem data={myTime[3] ? myTime[3] : ''} key={3} index={3} />
                                        <View style={{ width: 50, marginLeft: 10, borderBottomColor: '#dbdbdb', borderBottomWidth: 1, marginBottom: 2, marginTop: 2 }} />
                                        <MyItem data={myTime[4] ? myTime[4] : ''} key={4} index={4} />
                                        <MyItem data={myTime[5] ? myTime[5] : ''} key={5} index={5} />
                                        {(myTime.length >= 7 && myTime[6] !== ' ' && myTime[6] !== null && myTime[6] !== '') && <MyItem data={myTime[6]} key={6} index={6} />}
                                    </View>
                                }
                            </View>

                            <View style={styles.ButtonConainer}>
                                <TouchableOpacity onPress={this._buttonHandle} style={styles.Button}><MoreIcon /></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                }}
            </Query>
        )
    }
}

const getNotification = gql`
query listNotifications {
    listNotifications {
        items {
            title
        }
    }
}
`

let listNoti = null;
export class Notification extends Component {
    _buttonHandle = () => {
        this.props.navigation.navigate('Notification');
    }

    render() {
        return (
            <View style={styles.Container}>
                <Query query={getNotification} fetchPolicy='cache-and-network'>
                    {({ loading, data }) => {
                        if (!loading && listNoti === null) listNoti = data.listNotifications.items;
                        return <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={this.props.onClick}>
                            <View style={styles.TitleContainer}>
                                <Text style={styles.TitleText}>공지</Text>
                            </View>

                            <View style={styles.ContentConainer}>
                                {listNoti !== null
                                    ?
                                    listNoti && listNoti.length > 0
                                        ?
                                        listNoti.map(
                                            (info, index) => (
                                                index < 6
                                                    ?
                                                    <MyItem data={info.title} index={index} key={index} title='Notification' />
                                                    :
                                                    index === 6 ?
                                                        <MyItem data={'...'} index={index} key={index} title='Notification' />
                                                        : null
                                            ))
                                        :
                                        <MyItem data='정보없음' index={0} key={0} title='Notification' />

                                    :
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <ActivityIndicator color='#ddd' size='small' />
                                    </View>}
                            </View>

                            <View style={styles.ButtonConainer}>
                                <TouchableOpacity onPress={this._buttonHandle} style={styles.Button}><EnterIcon /></TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    }}
                </Query>
            </View>
        )
    }
}
const getTraffic = gql`
query getTraffic {
    getTraffic {
        items {
            title
        }
    }
}
`

export class Traffic extends Component {
    constructor(props) {
        super(props);
        this.state = {
            subway: {
                gusung: '5분',
                Jukjeon: '2분'
            },
            bus: [
                {
                    name: "35",
                    color: 0,
                    time1: "5분"
                }
            ],
            busList: [
                {
                    stationNumber: 0,
                    busName: '35',
                }
            ],
            refresing: false,
        }
    }
    _refrashHandle = async () => {
        // if (this.state.refresing) return;
        // this.setState({ refresing: true });
        // const bus = await AsyncStorage.getItem('BUSLIST');
        // this.setState({ busList: JSON.parse(bus) });
        // setTimeout(() => {
        //     try {
        //         this.busRefetch().then(res => {
        //             this.setState({ refresing: false });
        //         })
        //     } catch (error) {
        //         this.setState({ refresing: false });
        //     }
        // }, 100);

    }
    _busHandle = () => {
        this.props.navigation.navigate("Bus");
    }
    render() {
        // const { bus } = this.props;
        return (
            <View style={styles.Container}>
                <Query query={getTraffic} fetchPolicy='cache-and-network'>
                    {({ loading, data, refetch }) => {
                        if (this.busRefetch === undefined) this.busRefetch = refetch;
                        return <TouchableOpacity activeOpacity={1} stlye={{ flex: 1 }} onPress={this.props.onClick}>
                            <View style={styles.TitleContainer}>
                                <Text style={styles.TitleText}>교통</Text>
                            </View>

                            <View style={styles.ContentConainer}>
                                <MyItem data={'개발중'} index={0} key={0} title='Notification' />
                                {/* <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 }}><Text style={{ lineHeight: 20, fontSize: 14 }}>구성방면</Text><Text>{this.state.subway.gusung}</Text></View>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6 }}><Text style={{ lineHeight: 20, fontSize: 14 }}>죽전방면</Text><Text>{this.state.subway.Jukjeon}</Text></View>
                                <View style={{ width: 100, alignSelf: 'center', borderBottomColor: '#dbdbdb', borderBottomWidth: 1, marginBottom: 6, marginTop: 6 }} />
                                <TouchableOpacity activeOpacity={0.8} onPress={this._busHandle}>
                                    <View >
                                        {this.state.bus.map(
                                            (info, index) => (
                                                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 6, marginBottom: 3 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                        <BusIcon bus={info.color} />
                                                        <Text style={{ marginLeft: 5, lineHeight: 20, fontSize: 14 }}>{info.name}</Text>
                                                    </View>
                                                    <Text>{info.time1}</Text>
                                                </View>
                                            )
                                        )}
                                        {this.state.bus.length < 4 ? <Plus style={{ alignSelf: 'center', marginTop: 5, marginBottom: 5 }} /> : null}
                                    </View>
                                </TouchableOpacity> */}
                            </View>

                            <View style={styles.ButtonConainer}>
                                {this.state.refresing
                                    ?
                                    <ActivityIndicator color='#dbdbdb' size='small' />
                                    :
                                    <TouchableOpacity onPress={this._refrashHandle} style={styles.Button}><RefrashIcon /></TouchableOpacity>
                                }

                            </View>
                        </TouchableOpacity>
                    }}
                </Query>
            </View>
        )
    }
}

BusIcon = (bus) => {
    switch (bus.bus) {
        case 0: return <Yellowbus />
        case 1: return <GreenBus />
        case 2: return <BlueBus />
        case 3: return <RedBus />
        default: return <Yellowbus />
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
