export type Action = SetBTCBalance | SetETHBalance | SetDAIBalance;

interface SetBTCBalance {
  kind: 'setBTCBalance';
  value: number;
}

export const setBTCBalance = (value: number): SetBTCBalance => ({
  kind: 'setBTCBalance',
  value
});

interface SetETHBalance {
  kind: 'setETHBalance';
  value: number;
}

export const setETHBalance = (value: number): SetETHBalance => ({
  kind: 'setETHBalance',
  value
});

interface SetDAIBalance {
  kind: 'setDAIBalance';
  value: number;
}

export const setDAIBalance = (value: number): SetDAIBalance => ({
  kind: 'setDAIBalance',
  value
});
