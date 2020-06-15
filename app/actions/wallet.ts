import { BigNumber } from 'comit-sdk';

export type Action = SetBTCBalance | SetETHBalance | SetDAIBalance;

interface SetBTCBalance {
  kind: 'setBTCBalance';
  value: BigNumber;
}

export const setBTCBalance = (value: BigNumber): SetBTCBalance => ({
  kind: 'setBTCBalance',
  value
});

interface SetETHBalance {
  kind: 'setETHBalance';
  value: BigNumber;
}

export const setETHBalance = (value: BigNumber): SetETHBalance => ({
  kind: 'setETHBalance',
  value
});

interface SetDAIBalance {
  kind: 'setDAIBalance';
  value: BigNumber;
}

export const setDAIBalance = (value: BigNumber): SetDAIBalance => ({
  kind: 'setDAIBalance',
  value
});
