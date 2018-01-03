import React, { Component } from 'react';
import { StyleSheet, ScrollView, View, Text } from 'react-native';
import { withParticipants } from '@services/apollo/trip';
import FriendList from '@components/friendList';
import Button from '@components/experience/button';
import Colors from '@theme/colors';
import { compose } from 'react-apollo';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.background.fullWhite,
  },
  title: {
    fontSize: 16,
    textAlign: 'center',
    color: '#000',
    padding: 24,
    backgroundColor: Colors.background.fullWhite,
    elevation: 5,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '5%',
    paddingHorizontal: 24,
    borderColor: Colors.border.lightGray,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});

class Participants extends Component {
  constructor(props) {
    super(props);
    this.state = { participants: [] };
  }

  componentWillMount() {
    const { participants, user } = this.props;

    if (participants.indexOf(user.id) < 0) {
      participants.push(user.id);
    }

    this.setState({ participants });
  }

  onNext = () => {
    const { participants } = this.state;
    const { user, onNext } = this.props;

    if (participants.indexOf(user.id) > -1) {
      participants.splice(participants.indexOf(user.id), 1);
    }

    onNext(participants);
  }

  setOption = (type, value) => {
    const data = this.state.participants;

    if (data.indexOf(value) > -1) {
      data.splice(data.indexOf(value), 1);
    } else {
      data.push(value);
    }

    this.setState({ participants: data });
  }

  render() {
    const { tripParticipants, onBack, user } = this.props;
    const { participants } = this.state;

    return (
      <View style={styles.wrapper}>
        <ScrollView>
          <Text style={styles.title}>Tag who participated in the ride:</Text>
          <FriendList
            title=""
            loading={tripParticipants.loading}
            friends={tripParticipants.rows}
            total={tripParticipants.count}
            setOption={this.setOption}
            selected={participants}
            disabled={[user.id]}
          />

        </ScrollView>
        <View style={styles.actions}>
          <Button onPress={onBack} label="Back" icon="back" />
          {
            participants.length > 1 &&
            <Button onPress={this.onNext} label="Done" icon="next" />
          }
        </View>
      </View>
    );
  }
}

Participants.propTypes = {
  tripParticipants: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    rows: PropTypes.array.isRequired,
    count: PropTypes.number.isRequired,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  participants: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const mapStateToProps = state => ({ user: state.auth.user });

export default compose(withParticipants, connect(mapStateToProps))(Participants);
