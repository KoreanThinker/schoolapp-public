import React, { Component } from 'react'
import { Text, View, FlatList, TouchableOpacity, StyleSheet, Dimensions, AsyncStorage, Platform } from 'react-native'
import { Meal, Timetable, Notification, Traffic } from './BannerScrollCards';
import TimetableIcon from '../Icons/timetable.svg';
import MealIcon from '../Icons/meal.svg';
import StarIcon from '../Icons/star.svg';
import BusIcon from '../Icons/bus.svg';
import TimetableIconLight from '../Icons/timetablelight.svg';
import MealIconLight from '../Icons/meallight.svg';
import StarIconLight from '../Icons/starlight.svg';
import StarHighlightIcon from '../Icons/starHighlight.svg';
import BusIconLight from '../Icons/buslight.svg';
import gql from 'graphql-tag'
import { Query } from 'react-apollo'



const WIDTH = Dimensions.get('window').width;
const SCROLLUNIT = (636 - WIDTH) / 4;
const ISIOS = Platform.OS === 'ios';
let offset = SCROLLUNIT * 2 + ((WIDTH - 318) / 2);

const Bus = [
    '35',
    '690',
    '720'
];

const getNotification = gql`
query listNotifications {
    listNotifications {
        items {
            postid
        }
    }
}
`

let lastNotifications = "*";
let isNewNoti = false;

export default class BannerScroll extends Component {
    constructor(props) {
        super(props);
        this.state = {
            xOffset: 0,
            // isNewNotification: isNewNoti,
        }
        // console.log('load');
    }
    async componentDidMount() {
        // const d = await AsyncStorage.getItem('LASTNOTIFICATIONS');
        // if (lastNotifications === "*") {
        //     lastNotifications = d;
        // }
    }
    _scrollCtrl(_x) {
        this.myScroll.scrollToOffset({ offset: _x, animated: true });
        offset = _x;
    }
    _handleScroll(_xOffset) {
        this.setState({
            xOffset: _xOffset,
        });
        offset = _xOffset;

        if (_xOffset > SCROLLUNIT * 1) {
            this.setState({ isNewNotification: false });
            // isNewNoti = false;
            // AsyncStorage.setItem('LASTNOTIFICATIONS', this.newNotifications);
        }
    }

    render() {
        const headerList = [
            <View style={{ width: (WIDTH - 318) / 2 }} />,
            <Meal onClick={() => this._scrollCtrl(0)} navigation={this.props.navigation} />,
            <Notification onClick={() => this._scrollCtrl(SCROLLUNIT * 2 + ((WIDTH - 318) / 2))} navigation={this.props.navigation} />,
            <Timetable onClick={() => this._scrollCtrl(SCROLLUNIT * 2 + ((WIDTH - 318) / 2))} grade={this.props.grade} class_={this.props.class_} navigation={this.props.navigation} />,
            !ISIOS && <Traffic onClick={() => this._scrollCtrl(SCROLLUNIT * 4 + WIDTH - 318)} navigation={this.props.navigation} bus={Bus} />,
            <View style={{ width: (WIDTH - 318) / 2 }} />
        ];
        return (
            <View>
                {/* <Query query={getNotification} fetchPolicy="network-only" onCompleted={data => {
                    if (this.newNotifications !== undefined) return;
                    if (data.listNotifications.items.length > 0) {
                        const d = data.listNotifications.items[0].postid;
                        this.newNotifications = d;
                        if (d !== lastNotifications) {
                            isNewNoti = true;
                            this.setState({ isNewNotification: true });
                        }
                    } else {
                        this.newNotifications = null;
                    }



                }}>
                    {({ data }) => {
                        return null;
                    }}
                </Query> */}
                <View style={styles2.ScrollViewHolder}>
                    <View style={{ width: WIDTH, height: 250, justifyContent: 'center' }}>
                        <FlatList
                            horizontal={true}
                            style={{ width: WIDTH }}
                            showsHorizontalScrollIndicator={false}
                            overScrollMode={"never"}
                            ref={(ref) => this.myScroll = ref}
                            onScroll={event => this._handleScroll(event.nativeEvent.contentOffset.x)}
                            scrollEventThrottle={16}
                            // onLayout={() => this.myScroll.scrollToOffset({ offset: offset, animated: false })}
                            // contentOffset={{ x: offset, y: 0 }}
                            data={headerList}
                            keyExtractor={(item, index) => 'key' + index}
                            renderItem={({ item }) => {
                                return item
                            }}
                        />
                    </View>
                </View>
                <View style={styles2.GenreContainer}>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._scrollCtrl(0)}>
                        <View style={styles2.IconContainer}>{this.state.xOffset < SCROLLUNIT ? <MealIcon /> : <MealIconLight />}</View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._scrollCtrl(SCROLLUNIT * 2 + ((WIDTH - 318) / 2))}>
                        <View style={styles2.IconContainer}>{this.state.xOffset < SCROLLUNIT * 3 ? <StarIcon /> : <StarIconLight />}</View>
                    </TouchableOpacity>
                    <TouchableOpacity activeOpacity={1} onPress={() => this._scrollCtrl(SCROLLUNIT * 2 + ((WIDTH - 318) / 2))}>
                        {/* {this.state.isNewNotification
                            ?
                            <View style={styles2.IconContainer}>
                                <StarHighlightIcon />
                            </View>
                            : */}
                        <View style={styles2.IconContainer}>{this.state.xOffset > SCROLLUNIT * 1 ? <TimetableIcon /> : <TimetableIconLight />}</View>
                    </TouchableOpacity>
                    {!ISIOS && <TouchableOpacity activeOpacity={1} onPress={() => this._scrollCtrl(SCROLLUNIT * 4 + WIDTH - 318)}>
                        <View style={styles2.IconContainer}>{this.state.xOffset > SCROLLUNIT * 3 ? <BusIcon /> : <BusIconLight />}</View>
                    </TouchableOpacity>}
                </View>
            </View>
        )
    }


}




const styles2 = StyleSheet.create({
    IconContainer: {
        width: 50,
        height: 50,
        alignItems: 'center',
        justifyContent: 'center'
    },
    Container: {
        alignItems: 'center',
        width: WIDTH
    },
    ScrollViewHolder: {
        marginTop: 35,
        height: 250,
        width: WIDTH
    },
    ScrollView: {
        width: '100%',
    },
    GenreContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'center',
        flexDirection: 'row',
        width: 250,
        marginTop: 25,
    },


})

// export default AsSingleton(BannerScroll);