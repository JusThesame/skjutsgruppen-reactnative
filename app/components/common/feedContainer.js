import React from 'react';
import { StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
});


const FeedContainer = ({ children, bgColor }) => (
  <View style={[styles.wrapper, { backgroundColor: bgColor }]}>
    {children}
  </View>
);

FeedContainer.propTypes = {
  children: PropTypes.node.isRequired,
  bgColor: PropTypes.string,
};

FeedContainer.defaultProps = {
  bgColor: '#fff',
};


export default FeedContainer;
