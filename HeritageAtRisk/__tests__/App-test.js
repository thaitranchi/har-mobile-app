/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
const {act} = renderer;

jest.mock(
  '@react-native-async-storage/async-storage',
  () => require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

it('renders correctly', async () => {
  let tree;

  await act(async () => {
    tree = renderer.create(<App />);
    await Promise.resolve();
    await Promise.resolve();
  });

  expect(tree).toBeTruthy();
});
