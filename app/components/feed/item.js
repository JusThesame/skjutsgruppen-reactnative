import React, { PureComponent } from 'react';
import { View, TouchableOpacity, Image, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Detail from '@components/feed/itemDetail';
import {
  CLOSE_GROUP,
  GROUP_FEED_TYPE_JOINED_GROUP,
  FEED_FILTER_WANTED,
  ACTIVITY_TYPE_SHARE_LOCATION_FEED,
  ACTIVITY_TYPE_CREATE_EXPERIENCE,
  EXPERIENCE_STATUS_CAN_CREATE,
} from '@config/constant';

import Colors from '@theme/colors';
import FOF from '@components/relation/friendsOfFriend';
import ShareLocation from '@components/feed/shareLocation';
import MakeExperience from '@components/feed/makeExperience';
import { getDate } from '@config';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: 20,
    paddingVertical: 6,
    marginTop: 16,
  },
  profilePicWrapper: {
    width: 48,
    height: 48,
  },
  profilePic: {
    height: 48,
    width: 48,
    borderRadius: 24,
    marginRight: 2,
  },
  indicator: {
    height: 16,
    width: 16,
    borderRadius: 8,
    position: 'absolute',
    top: 0,
    right: -2,
  },
  pinkBg: {
    backgroundColor: Colors.background.pink,
  },
  blueBg: {
    backgroundColor: Colors.background.blue,
  },
});

class FeedItem extends PureComponent {
  isTripStartedForShareLocation = () => {
    const { feed: { Trip: trip } } = this.props;
    return getDate(trip.date).subtract(40, 'minute').isBefore();
  }

  isTripStarted = () => {
    const { feed: { Trip: trip } } = this.props;
    return getDate(trip.date).add(trip.duration / 2, 'second').isBefore();
  }

  isTripEnded = () => {
    const { feed: { Trip: trip } } = this.props;

    return getDate(trip.date)
      .add(trip.duration, 'second')
      .add(1, 'day')
      .isBefore();
  }

  canShareLocation = () => {
    const { feed: { Trip: trip } } = this.props;
    const { Participants, isParticipant } = trip;


    if ((Participants && Participants.count <= 1) || !isParticipant) {
      return false;
    }

    if (!this.isTripStartedForShareLocation()) {
      return false;
    }

    if (this.isTripEnded()) {
      return false;
    }

    return true;
  }

  canCreateExperience = () => {
    const { feed: { Trip: trip } } = this.props;
    const { experienceStatus, Participants, isParticipant } = trip;

    if (experienceStatus) {
      return (
        Participants.count > 1
        && isParticipant
        && experienceStatus === EXPERIENCE_STATUS_CAN_CREATE
      );
    }

    return false;
  }

  renderProfilePic() {
    const { feed, onPress } = this.props;
    let imgSrc = '';
    let userId = feed.User.id;

    if (feed.ActivityType.type === GROUP_FEED_TYPE_JOINED_GROUP
      && Object.keys(feed.Enabler).length > 0 && feed.Enabler.avatar) {
      imgSrc = feed.Enabler.avatar;
      userId = feed.Enabler.id;
    } else {
      imgSrc = feed.User.avatar;
    }

    return (
      <View style={styles.profilePicWrapper}>
        <TouchableOpacity onPress={() => {
          if (feed.User.deleted) return null;
          return onPress('Profile', { id: userId });
        }}
        >
          <Image source={{ uri: imgSrc }} style={styles.profilePic} />
        </TouchableOpacity>
        {
          feed.Trip
          &&
          <View
            style={[
              styles.indicator,
              (feed.Trip.type === FEED_FILTER_WANTED) ? styles.blueBg : styles.pinkBg,
            ]}
          />
        }
      </View>
    );
  }

  renderRelation = () => {
    const { feed } = this.props;

    if (feed.User.relation && feed.User.relation.path) {
      return (
        <View style={{ marginLeft: 74 }}>
          <FOF mini relation={feed.User.relation} viewee={feed.User} />
        </View>
      );
    }

    return null;
  }

  render() {
    const { feed, onPress, onLongPress } = this.props;

    if (feed.ActivityType.type === ACTIVITY_TYPE_SHARE_LOCATION_FEED && feed.Trip) {
      if (!this.canShareLocation()) {
        return null;
      }

      return (
        <ShareLocation
          onPress={onPress}
          detail={feed.Trip}
        />
      );
    }

    if (feed.ActivityType.type === ACTIVITY_TYPE_CREATE_EXPERIENCE && feed.Trip) {
      if (this.canCreateExperience() && this.isTripStarted() && !this.isTripEnded()) {
        return (
          <MakeExperience
            onPress={onPress}
            detail={feed.Trip}
          />);
      }

      return null;
    }

    return (
      <View>
        <View style={styles.wrapper}>
          {this.renderProfilePic()}
          <Detail
            feed={feed}
            onPress={onPress}
            onLongPress={onLongPress}
          />
        </View>
        {feed.showRelation && this.renderRelation()}
      </View>
    );
  }
}

FeedItem.propTypes = ({
  feed: PropTypes.shape({
    ActivityType: PropTypes.shape({
      type: PropTypes.string,
    }),
    User: PropTypes.shape({
      avatar: PropTypes.string,
      firstName: PropTypes.string,
    }).isRequired,
    feedable: PropTypes.string,
    id: PropTypes.number,
    updatedAt: PropTypes.string,
  }).isRequired,
  onPress: PropTypes.func.isRequired,
  onLongPress: PropTypes.func.isRequired,
});

export default FeedItem;
