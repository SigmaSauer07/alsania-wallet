import { NameType } from '@metamask/name-controller';
import { TransactionStatus } from '@metamask/transaction-controller';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import configureStore from 'redux-mock-store';
import {
  TrustSignalDisplayState,
  useTrustSignals,
} from '../../../hooks/useTrustSignals';
import { GasEstimateTypes } from '../../../../shared/constants/gas';
import {
  MetaMetricsEventCategory,
  MetaMetricsEventName,
} from '../../../../shared/constants/metametrics';
import transactionGroup from '../../../../test/data/mock-pending-transaction-data.json';
import mockState from '../../../../test/data/mock-state.json';
import { renderWithProvider } from '../../../../test/jest';
import { MetaMetricsContext } from '../../../contexts/metametrics';
import { selectBridgeHistoryForAccount } from '../../../ducks/bridge-status/selectors';
import { getTokens } from '../../../ducks/metamask/metamask';
import { useGasFeeEstimates } from '../../../hooks/useGasFeeEstimates';
import {
  getConversionRate,
  getCurrentNetwork,
  getNames,
  getPreferences,
  getSelectedAccount,
  getShouldShowFiat,
  getTokenExchangeRates,
  getSelectedInternalAccount,
} from '../../../selectors';
import { getNftContractsByAddressByChain } from '../../../selectors/nft';
import { abortTransactionSigning } from '../../../store/actions';
import { setBackgroundConnection } from '../../../store/background-connection';
import TransactionListItem from '.';

const FEE_MARKET_ESTIMATE_RETURN_VALUE = {
  gasEstimateType: GasEstimateTypes.feeMarket,
  gasFeeEstimates: {
    low: {
      minWaitTimeEstimate: 180000,
      maxWaitTimeEstimate: 300000,
      suggestedMaxPriorityFeePerGas: '3',
      suggestedMaxFeePerGas: '53',
    },
    medium: {
      minWaitTimeEstimate: 15000,
      maxWaitTimeEstimate: 60000,
      suggestedMaxPriorityFeePerGas: '7',
      suggestedMaxFeePerGas: '70',
    },
    high: {
      minWaitTimeEstimate: 0,
      maxWaitTimeEstimate: 15000,
      suggestedMaxPriorityFeePerGas: '10',
      suggestedMaxFeePerGas: '100',
    },
    estimatedBaseFee: '50',
  },
  estimatedGasFeeTimeBounds: {},
};

jest.mock('react-redux', () => {
  const actual = jest.requireActual('react-redux');

  return {
    ...actual,
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
  };
});

jest.mock('../../../hooks/bridge/useBridgeTxHistoryData', () => {
  return {
    ...jest.requireActual('../../../hooks/bridge/useBridgeTxHistoryData'),
    useBridgeTxHistoryData: jest.fn(() => ({
      bridgeTxHistoryItem: undefined,
      isBridgeComplete: false,
      showBridgeTxDetails: false,
    })),
  };
});

jest.mock('../../../hooks/useGasFeeEstimates', () => ({
  useGasFeeEstimates: jest.fn(),
}));

jest.mock('../../../hooks/useTrustSignals', () => ({
  useTrustSignals: jest.fn(),
  TrustSignalDisplayState: {
    Malicious: 'malicious',
    Petname: 'petname',
    Verified: 'verified',
    Warning: 'warning',
    Recognized: 'recognized',
    Unknown: 'unknown',
  },
}));

setBackgroundConnection({
  getGasFeeTimeEstimate: jest.fn(),
});

jest.mock('react', () => {
  const originReact = jest.requireActual('react');
  return {
    ...originReact,
    useLayoutEffect: jest.fn(),
  };
});

jest.mock('../../../store/actions.ts', () => ({
  tryReverseResolveAddress: jest.fn().mockReturnValue({ type: 'TYPE' }),
  abortTransactionSigning: jest.fn(),
}));

const mockStore = configureStore();

const useTrustSignalsMock = jest.mocked(useTrustSignals);

const generateUseSelectorRouter = (opts) => (selector) => {
  if (selector === getConversionRate) {
    return 1;
  } else if (selector === getSelectedAccount) {
    return {
      balance: opts.balance ?? '2AA1EFB94E0000',
    };
  } else if (selector === getTokenExchangeRates) {
    return opts.tokenExchangeRates ?? {};
  } else if (selector === getCurrentNetwork) {
    return { nickname: 'Ethereum Mainnet' };
  } else if (selector === getPreferences) {
    return opts.preferences ?? {};
  } else if (selector === getShouldShowFiat) {
    return opts.shouldShowFiat ?? false;
  } else if (selector === getTokens) {
    return opts.tokens ?? [];
  } else if (selector === selectBridgeHistoryForAccount) {
    return opts.bridgeHistory ?? {};
  } else if (selector === getSelectedInternalAccount) {
    return opts.selectedInternalAccount ?? { address: '0xDefaultAddress' };
  } else if (selector === getNames) {
    return {
      [NameType.ETHEREUM_ADDRESS]: {
        '0xc0ffee254729296a45a3885639ac7e10f9d54979': {
          '0x5': {
            name: 'TestName2',
          },
        },
      },
    };
  } else if (selector === getNftContractsByAddressByChain) {
    return {
      '0x5': {
        '0xc0ffee254729296a45a3885639ac7e10f9d54979': {
          name: 'iZUMi Bond USD',
        },
      },
    };
  }
  return undefined;
};

describe('TransactionListItem', () => {
  beforeAll(() => {
    useGasFeeEstimates.mockImplementation(
      () => FEE_MARKET_ESTIMATE_RETURN_VALUE,
    );

    useTrustSignalsMock.mockImplementation((requests) =>
      requests.map(() => ({
        state: TrustSignalDisplayState.Unknown,
        label: null,
      })),
    );
  });

  afterAll(() => {
    useGasFeeEstimates.mockRestore();
  });

  describe('ActivityListItem interactions', () => {
    it('should show the activity details popover and log metrics when the activity list item is clicked', () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '0x3',
        }),
      );

      const store = mockStore(mockState);
      const mockTrackEvent = jest.fn();
      const { queryByTestId } = renderWithProvider(
        <MetaMetricsContext.Provider value={mockTrackEvent}>
          <TransactionListItem transactionGroup={transactionGroup} />
        </MetaMetricsContext.Provider>,
        store,
      );
      const activityListItem = queryByTestId('activity-list-item');
      fireEvent.click(activityListItem);
      expect(mockTrackEvent).toHaveBeenCalledWith({
        event: MetaMetricsEventName.ActivityDetailsOpened,
        category: MetaMetricsEventCategory.Navigation,
        properties: {
          activity_type: 'send',
        },
      });
      const popoverClose = queryByTestId('popover-close');
      fireEvent.click(popoverClose);
      expect(mockTrackEvent).toHaveBeenCalledWith({
        event: MetaMetricsEventName.ActivityDetailsClosed,
        category: MetaMetricsEventCategory.Navigation,
        properties: {
          activity_type: 'send',
        },
      });
    });
  });

  describe('when account has insufficient balance to cover gas', () => {
    it(`should indicate account has insufficient funds to cover gas price for cancellation of pending transaction`, () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '0x3',
        }),
      );
      const { queryByTestId } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByTestId('not-enough-gas__tooltip')).toBeInTheDocument();
    });

    it('should not disable "cancel" button when user has sufficient funds', () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '2AA1EFB94E0000',
        }),
      );
      const { queryByTestId } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByTestId('not-enough-gas__tooltip')).not.toBeInTheDocument();
    });

    it(`should open the edit gas popover when cancel is clicked`, () => {
      useSelector.mockImplementation(
        generateUseSelectorRouter({
          balance: '2AA1EFB94E0000',
        }),
      );
      const { getByText, queryByText } = renderWithProvider(
        <TransactionListItem transactionGroup={transactionGroup} />,
      );
      expect(queryByText('Cancel transaction')).not.toBeInTheDocument();

      const cancelButton = getByText('Cancel');
      fireEvent.click(cancelButton);
      expect(getByText('Cancel transaction')).toBeInTheDocument();
    });
  });

  it('hides speed up button if status is approved', () => {
    useSelector.mockImplementation(
      generateUseSelectorRouter({
        balance: '2AA1EFB94E0000',
      }),
    );

    const transactionGroupSigning = {
      ...transactionGroup,
      primaryTransaction: {
        ...transactionGroup.primaryTransaction,
        status: TransactionStatus.approved,
      },
    };

    const { queryByTestId } = renderWithProvider(
      <TransactionListItem transactionGroup={transactionGroupSigning} />,
    );

    const speedUpButton = queryByTestId('speed-up-button');
    expect(speedUpButton).not.toBeInTheDocument();
  });

  it('aborts transaction signing if cancel button clicked and status is approved', () => {
    useSelector.mockImplementation(
      generateUseSelectorRouter({
        balance: '2AA1EFB94E0000',
      }),
    );

    useDispatch.mockReturnValue(jest.fn());

    const transactionGroupSigning = {
      ...transactionGroup,
      primaryTransaction: {
        ...transactionGroup.primaryTransaction,
        status: TransactionStatus.approved,
      },
    };

    const { queryByTestId } = renderWithProvider(
      <TransactionListItem transactionGroup={transactionGroupSigning} />,
    );

    const cancelButton = queryByTestId('cancel-button');
    fireEvent.click(cancelButton);

    expect(abortTransactionSigning).toHaveBeenCalledTimes(1);
    expect(abortTransactionSigning).toHaveBeenCalledWith(
      transactionGroupSigning.primaryTransaction.id,
    );
  });
});
