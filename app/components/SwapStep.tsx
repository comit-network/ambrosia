import { Protocol, Role, SwapEvent } from '../utils/swap';
import {
  Badge,
  Box,
  Button,
  Flex,
  Icon,
  IconButton,
  Link,
  List,
  ListIcon,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tag,
  TagIcon,
  TagLabel,
  Text,
  Tooltip,
  useDisclosure
} from '@chakra-ui/core';
import { Currency } from '../utils/currency';
import React, { useState } from 'react';
import { useLedgerBitcoinWallet } from '../hooks/useLedgerBitcoinWallet';
import { useLedgerEthereumWallet } from '../hooks/useLedgerEthereumWallet';
import { LedgerAction } from '../comit-sdk';
import { BigNumber } from 'ethers';

export enum SwapStepName {
  HERC20_HBIT_ALICE_DEPLOY = 'HERC20_HBIT_ALICE_DEPLOY',
  HERC20_HBIT_ALICE_FUND = 'HERC20_HBIT_ALICE_FUND',
  HERC20_HBIT_BOB_FUND = 'HERC20_HBIT_BOB_FUND',
  HERC20_HBIT_ALICE_REDEEM = 'HERC20_HBIT_ALICE_REDEEM',
  HERC20_HBIT_BOB_REDEEM = 'HERC20_HBIT_BOB_REDEEM',

  HBIT_HERC20_ALICE_FUND = 'HBIT_HERC20_ALICE_FUND',
  HBIT_HERC20_BOB_DEPLOY = 'HBIT_HERC20_BOB_DEPLOY',
  HBIT_HERC20_BOB_FUND = 'HBIT_HERC20_BOB_FUND',
  HBIT_HERC20_ALICE_REDEEM = 'HBIT_HERC20_ALICE_REDEEM',
  HBIT_HERC20_BOB_REDEEM = 'HBIT_HERC20_BOB_REDEEM'
}

interface LedgerInteractionButtonProperties {
  onClick: () => void;
  active: boolean;
  variant?: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  ledgerAction?: LedgerAction;
  onTransactionSigned: (txId: string) => void;
}

function SignWithLedgerModal({
  isOpen,
  onClose,
  ledgerAction,
  onTransactionSigned
}: ModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [signingError, setSigningError] = useState('');
  const bitcoinWallet = useLedgerBitcoinWallet();
  const ethereumWallet = useLedgerEthereumWallet();

  if (!ledgerAction) {
    return null;
  }

  const ledgerApp = (() => {
    switch (ledgerAction.type) {
      case 'bitcoin-send-amount-to-address':
        return 'Bitcoin';
      case 'ethereum-call-contract':
      case 'ethereum-deploy-contract':
        return 'Ethereum';
      default:
        throw new Error(`Cannot use Ledger for ${ledgerAction.type} action`);
    }
  })();

  const onSign = async () => {
    setIsSigning(true);
    setSigningError('');

    try {
      let txId;
      switch (ledgerAction.type) {
        case 'bitcoin-send-amount-to-address': {
          txId = await bitcoinWallet.sendToAddress(
            ledgerAction.payload.to,
            ledgerAction.payload.amount,
            0.00035
          );
          break;
        }
        case 'ethereum-call-contract': {
          txId = await ethereumWallet
            .signAndSend({
              to: ledgerAction.payload.contract_address,
              gasLimit: ledgerAction.payload.gas_limit,
              data: ledgerAction.payload.data
            })
            .then(r => r.hash);
          break;
        }
        case 'ethereum-deploy-contract': {
          txId = await ethereumWallet
            .signAndSend({
              gasLimit: ledgerAction.payload.gas_limit,
              value: BigNumber.from(ledgerAction.payload.amount).toHexString(),
              data: ledgerAction.payload.data
            })
            .then(r => r.hash);
          break;
        }
      }
      onTransactionSigned(txId);
      onClose();
    } catch (e) {
      setSigningError(e.message);
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign transaction with Nano Ledger S</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Please unlock your Ledger and open the {ledgerApp} app! After that,
            click `&quot;` Sign `&quot;` and follow the on-screen instructions
            of your Ledger!
          </Text>
          {signingError && <Text color="red.500">{signingError}</Text>}
        </ModalBody>

        <ModalFooter>
          <Button variantColor="blue" onClick={onSign} isLoading={isSigning}>
            Sign
          </Button>
          <Button variantColor="gray" onClick={onClose} isDisabled={isSigning}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function LedgerInteractionButton({
  active,
  onClick,
  variant
}: LedgerInteractionButtonProperties) {
  let tooltip = 'Please wait until you can confirm with Ledger Nano S';
  let displayVariant = 'gray';
  let styles;

  if (active) {
    switch (variant) {
      case 'cyan': {
        styles = 'button ledger cyan';
        break;
      }
      case 'orange': {
        styles = 'button ledger orange';
        break;
      }
      default:
        break;
    }

    displayVariant = variant;
    tooltip = 'Click to confirm tx with ledger Nano S';
  }

  return (
    <Tooltip
      aria-label="confirm-ledger-tx"
      label={tooltip}
      placement="top"
      hasArrow
      bg={`${displayVariant}.600`}
    >
      <IconButton
        // @ts-ignore
        icon="ledger"
        onClick={onClick}
        variantColor={displayVariant}
        backgroundColor={active ? 0 : `${displayVariant}.400`}
        className={styles}
        isDisabled={!active}
        roundedLeft={0}
      />
    </Tooltip>
  );
}

// TODO: Include network!
function getBlockchainExplorerUrl(event: SwapEventName): string {
  switch (event) {
    case SwapEventName.HERC20_DEPLOYED:
    case SwapEventName.HERC20_FUNDED:
    case SwapEventName.HERC20_REDEEMED:
    case SwapEventName.HERC20_REFUNDED:
      return 'https://etherscan.io/tx/';
    case SwapEventName.HBIT_FUNDED:
    case SwapEventName.HBIT_REDEEMED:
    case SwapEventName.HBIT_REFUNDED:
    default:
      return 'https://www.blockchain.com/btc/tx/';
  }
}

interface StepProperties {
  swapId: string;
  role: Role;
  name: SwapStepName;
  isActive: boolean;
  isUserInteractionActive: boolean;
  event: SwapEvent;
  asActiveStep?: boolean;
  ledgerAction?: LedgerAction; // TODO: Omit actions we are not handling yet, lightning + bitcoin-broadcast-signed-transaction
  onSigned: (txId: string) => void;
}

interface DisplayParams {
  protocol: Protocol;
  currency: Currency;
  isInteractionRequired: boolean;

  index: number;
  label: string;
}

function getAliceParams(name: SwapStepName): DisplayParams {
  switch (name) {
    case SwapStepName.HERC20_HBIT_ALICE_DEPLOY:
      return {
        index: 1,
        label: 'You Lock (1/2)',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HERC20_HBIT_ALICE_FUND:
      return {
        index: 2,
        label: 'You Lock (2/2)',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HERC20_HBIT_BOB_FUND:
      return {
        index: 3,
        label: 'They Lock',
        protocol: Protocol.HER20,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    case SwapStepName.HERC20_HBIT_ALICE_REDEEM:
      return {
        index: 4,
        label: 'Auto Unlock Your',
        protocol: Protocol.HER20,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    case SwapStepName.HERC20_HBIT_BOB_REDEEM:
      return {
        index: 5,
        label: 'They Unlock',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HBIT_HERC20_ALICE_FUND:
      return {
        index: 1,
        label: 'You Lock',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: true
      };
    case SwapStepName.HBIT_HERC20_BOB_DEPLOY:
      return {
        index: 2,
        label: 'They Lock (1/2)',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HBIT_HERC20_BOB_FUND:
      return {
        index: 3,
        label: 'They Lock (2/2)',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HBIT_HERC20_ALICE_REDEEM:
      return {
        index: 4,
        label: 'You Unlock',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HBIT_HERC20_BOB_REDEEM:
      return {
        index: 5,
        label: 'They Unlock',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    default:
      return {
        index: 0,
        label: 'Swap Step',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
  }
}

function getBobParams(name: SwapStepName) {
  switch (name) {
    case SwapStepName.HERC20_HBIT_ALICE_DEPLOY:
      return {
        index: 1,
        label: 'Wait (1/2)',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HERC20_HBIT_ALICE_FUND:
      return {
        index: 2,
        label: 'Wait (2/2)',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HERC20_HBIT_BOB_FUND:
      return {
        index: 3,
        label: 'You Lock',
        protocol: Protocol.HER20,
        currency: Currency.BTC,
        isInteractionRequired: true
      };
    case SwapStepName.HERC20_HBIT_ALICE_REDEEM:
      return {
        index: 4,
        label: 'They Unlock',
        protocol: Protocol.HER20,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    case SwapStepName.HERC20_HBIT_BOB_REDEEM:
      return {
        index: 5,
        label: 'You Unlock',
        protocol: Protocol.HER20,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HBIT_HERC20_ALICE_FUND:
      return {
        index: 1,
        label: 'Wait',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    case SwapStepName.HBIT_HERC20_BOB_DEPLOY:
      return {
        index: 2,
        label: 'You Lock (1/2)',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HBIT_HERC20_BOB_FUND:
      return {
        index: 3,
        label: 'You Lock (2/2)',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: true
      };
    case SwapStepName.HBIT_HERC20_ALICE_REDEEM:
      return {
        index: 4,
        label: 'They Unlock',
        protocol: Protocol.HBIT,
        currency: Currency.DAI,
        isInteractionRequired: false
      };
    case SwapStepName.HBIT_HERC20_BOB_REDEEM:
      return {
        index: 5,
        label: 'Auto Unlock Your',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
    default:
      return {
        index: 0,
        label: 'Swap Step',
        protocol: Protocol.HBIT,
        currency: Currency.BTC,
        isInteractionRequired: false
      };
  }
}

export default function SwapStep({
  swapId,
  name,
  isActive,
  isUserInteractionActive,
  event,
  asActiveStep,
  ledgerAction,
  onSigned,
  role
}: StepProperties) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    protocol,
    currency,
    isInteractionRequired,
    index,
    label
  }: DisplayParams =
    role === Role.ALICE ? getAliceParams(name) : getBobParams(name);

  let rounded;
  let interactionButton;
  let roleBadge;
  let variantColor = 'gray';
  if (isActive) {
    variantColor = protocol === Protocol.HBIT ? 'orange' : 'cyan';
  }
  if (isInteractionRequired) {
    rounded = 0;
    interactionButton = (
      <LedgerInteractionButton
        active={isUserInteractionActive}
        onClick={onOpen}
        variant={variantColor}
      />
    );
    roleBadge = (
      <Badge
        variant="solid"
        variantColor={variantColor}
        marginRight="0.3rem"
        fontSize="xs"
        alignSelf="center"
      >
        Ledger Nano S
      </Badge>
    );
  }

  const currencyIcon = currency === Currency.BTC ? 'bitcoin' : 'dai';

  interface SwapEventDisplayProperties {
    event: SwapEvent;
  }

  const SwapEventDisplay = ({ event }: SwapEventDisplayProperties) => {
    if (!event) {
      return <></>;
    }

    return (
      <Flex
        direction="column"
        width="100%"
        paddingLeft="0.5rem"
        paddingBottom="0.3rem"
        roundedBottom="md"
      >
        <List>
          <ListItem>
            <Flex direction="row" alignItems="center">
              <ListIcon icon="check-circle" color="green.500" />
              {/*<Text>{`${(new Date(event.seen_at)).toLocaleString()}: `}</Text>*/}
              <Link
                href={`${getBlockchainExplorerUrl(event.name)}${event.tx}`}
                isExternal
                color="teal.500"
              >
                {`${event.tx.substring(0, 10)}...`}
                <Icon name="external-link" mx="2px" />
              </Link>
            </Flex>
          </ListItem>
        </List>
      </Flex>
    );
  };

  if (asActiveStep) {
    const activeStepMinWidth = '200px';
    return (
      <>
        <Flex
          direction="row"
          width="100%"
          justifyContent="right"
          key={swapId + name + 'activeSwap'}
          marginRight="1rem"
        >
          <Flex direction="row">
            <Badge
              variant="solid"
              variantColor={variantColor}
              marginRight="0.3rem"
              fontSize="xs"
              alignSelf="center"
            >
              Step {index}
            </Badge>
            {roleBadge}
          </Flex>
          <Flex direction={'row'}>
            <Tag
              width="100%"
              height="40px"
              minWidth={activeStepMinWidth}
              variant="outline"
              variantColor={variantColor}
              roundedRight={rounded}
              backgroundColor={`${variantColor}.50`}
            >
              <TagLabel>{label}</TagLabel>
              <TagIcon size="20px" icon={currencyIcon} />
            </Tag>
            {interactionButton}
          </Flex>
        </Flex>
        <SignWithLedgerModal
          isOpen={isOpen}
          onClose={onClose}
          ledgerAction={ledgerAction}
          onTransactionSigned={onSigned}
        />
      </>
    );
  }

  return (
    <Box width="100%" key={swapId + name + 'statusRow'}>
      <Flex direction="row">
        <Badge
          variant="solid"
          variantColor={variantColor}
          marginRight="0.3rem"
          fontSize="xs"
          alignSelf="center"
        >
          Step {index}
        </Badge>
        {roleBadge}
      </Flex>
      <Flex direction={'row'}>
        <Tag
          width="100%"
          height="40px"
          variant="outline"
          variantColor={variantColor}
          roundedRight={rounded}
          backgroundColor={`${variantColor}.50`}
        >
          <TagLabel>{label}</TagLabel>
          <TagIcon size="20px" icon={currencyIcon} />
        </Tag>
        {interactionButton}
      </Flex>
      <SwapEventDisplay event={event} />
      <SignWithLedgerModal
        isOpen={isOpen}
        onClose={onClose}
        ledgerAction={ledgerAction}
        onTransactionSigned={onSigned}
      />
    </Box>
  );
}
