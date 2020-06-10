import { Swap } from 'comit-sdk';

const TRY_PARAMS = { maxTimeoutSecs: 10, tryIntervalSecs: 1 };

async function parseStatus(swap) {
  const { properties } = await swap.fetchDetails();
  const { status, state } = properties;

  const MAKER_ACCEPTED =
    state.communication.status === 'ACCEPTED' &&
    state.alpha_ledger.status === 'NOT_DEPLOYED';
  if (MAKER_ACCEPTED) {
    return 'MAKER_ACCEPTED';
  }

  const TAKER_LEDGER_DEPLOYED = state.alpha_ledger.status === 'DEPLOYED';
  if (TAKER_LEDGER_DEPLOYED) {
    return 'TAKER_LEDGER_DEPLOYED';
  }

  const MAKER_LEDGER_FUNDED = state.beta_ledger.status === 'FUNDED';
  if (MAKER_LEDGER_FUNDED) {
    return 'MAKER_LEDGER_FUNDED';
  }

  const SWAPPED = status === 'SWAPPED';
  if (SWAPPED) {
    return 'SWAPPED';
  } // TODO: use to display completed status

  return 'WAITING_FOR_MAKER';
}

async function canRefund(swap: Swap) {
  const { properties } = await swap.fetchDetails();
  const { state } = properties;

  const TAKER_LEDGER_FUNDED = state.alpha_ledger.status === 'FUNDED';
  if (TAKER_LEDGER_FUNDED) {
    return true;
  }

  return false;
}

export default class TakerStateMachine {
  swap: Swap;

  constructor(swap: Swap) {
    this.swap = swap;
  }

  /**
   * Returns the current's status of the swap.
   */
  async getStatus() {
    const status = await parseStatus(this.swap);
    return status;
  }

  /**
   * Returns boolean, true if the refund action is available.
   */
  async canRefund() {
    const answer = await canRefund(this.swap);
    return answer;
  }

  async refund() {
    const allowed = await canRefund(this.swap);
    if (allowed) {
      try {
        console.log('running swap.refund');
        await this.swap.refund(TRY_PARAMS);
      } catch (error) {
        console.error('refund failed');
        console.error(error);
      }
      console.log('ran');
    }

    return false;
  }

  /**
   * Returns the next available swap Action name
   */
  async getNextActionName() {
    const status = await parseStatus(this.swap);
    const NEXT_ACTION_NAME = {
      MAKER_ACCEPTED: 'DEPLOY',
      TAKER_LEDGER_DEPLOYED: 'FUND',
      MAKER_LEDGER_FUNDED: 'REDEEM',
      WAITING_FOR_MAKER: 'WAIT',
      SWAPPED: false
    };

    return NEXT_ACTION_NAME[status];
  }

  /**
   * Executes the next step of the swap
   */
  async next() {
    console.log('runTakerNextStep');
    const status = await parseStatus(this.swap);
    console.log(status);
    const TAKER_SWAP_STATE_MACHINE = {
      MAKER_ACCEPTED: async params => {
        console.log('running swap.deploy');
        await this.swap.deploy(params);
      }, // results in TAKER_LEDGER_FUNDED
      TAKER_LEDGER_DEPLOYED: async params => {
        console.log('running swap.fund');
        await this.swap.fund(params);
      }, // results in TAKER_LEDGER_FUNDED
      MAKER_LEDGER_FUNDED: async params => {
        // TODO: swap.refund is also possible here
        // Note refund is possible when alpha ledger is Funded but not Redeemed
        console.log('running swap.redeem');
        await this.swap.redeem(params);
      }, // results in TAKER_LEDGER_REDEEMED
      WAITING_FOR_MAKER: async () => {
        return true; // noop
      },
      SWAPPED: async () => {
        return true; // noop
      } // Let user know that swap is done
    };

    console.log('Executing next step...');
    await TAKER_SWAP_STATE_MACHINE[status](TRY_PARAMS);
    console.log('Next step executed');
  }
}
