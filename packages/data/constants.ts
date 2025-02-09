import packageJson from '../../package.json';
import getEnvConfig from './utils/getEnvConfig';

// Environments
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_PREVIEW = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';

// ZK3
export const SEMAPHORE_ZK3_CONTRACT_ADDRESS = '0xba4cf9D716Ec42E2996Fc2e6b8B97854CD344Ce3';
export const ZK3_REFERENCE_MODULE_ADDRESS = '0x60a867ACF71d5c7cDf357d70CdC4FBAF7CcBdBb0';
export const SEMAPHORE_ZK3_CONTRACT_ABI = [
  {
    inputs: [
      {
        internalType: 'contract ISemaphoreVerifier',
        name: '_verifier',
        type: 'address'
      }
    ],
    stateMutability: 'nonpayable',
    type: 'constructor'
  },
  {
    inputs: [],
    name: 'Semaphore__CallerIsNotCoordinator',
    type: 'error'
  },
  {
    inputs: [],
    name: 'Semaphore__GroupAlreadyExists',
    type: 'error'
  },
  {
    inputs: [],
    name: 'Semaphore__GroupDoesNotExist',
    type: 'error'
  },
  {
    inputs: [],
    name: 'Semaphore__MerkleTreeDepthIsNotSupported',
    type: 'error'
  },
  {
    inputs: [],
    name: 'Semaphore__YouAreUsingTheSameNillifierTwice',
    type: 'error'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'coordinator',
        type: 'address'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'CircleCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'CircleURIUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeDepth',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'zeroValue',
        type: 'uint256'
      }
    ],
    name: 'GroupCreated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256'
      }
    ],
    name: 'MemberAdded',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256'
      }
    ],
    name: 'MemberRemoved',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'index',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newIdentityCommitment',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'merkleTreeRoot',
        type: 'uint256'
      }
    ],
    name: 'MemberUpdated',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'signal',
        type: 'uint256'
      },
      {
        indexed: false,
        internalType: 'uint256[8]',
        name: 'proof',
        type: 'uint256[8]'
      }
    ],
    name: 'MembershipVerified',
    type: 'event'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'addIdentity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'signal',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'nullifierHash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'externalNullifier',
        type: 'uint256'
      },
      {
        internalType: 'uint256[8]',
        name: 'proof',
        type: 'uint256[8]'
      }
    ],
    name: 'broadcastSignal',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'address',
        name: 'coordinator',
        type: 'address'
      },
      {
        internalType: 'uint256',
        name: 'merkleTreeDepth',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'createCircle',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      }
    ],
    name: 'getContentURI',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      }
    ],
    name: 'getMerkleTreeDepth',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      }
    ],
    name: 'getMerkleTreeRoot',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'groupId',
        type: 'uint256'
      }
    ],
    name: 'getNumberOfMerkleTreeLeaves',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'signal',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'nullifierHash',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'externalNullifier',
        type: 'uint256'
      },
      {
        internalType: 'uint256[8]',
        name: 'proof',
        type: 'uint256[8]'
      }
    ],
    name: 'isValidProof',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'uint256',
        name: 'identityCommitment',
        type: 'uint256'
      },
      {
        internalType: 'uint256[]',
        name: 'proofSiblings',
        type: 'uint256[]'
      },
      {
        internalType: 'uint8[]',
        name: 'proofPathIndices',
        type: 'uint8[]'
      },
      {
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'revokeIdentity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: 'circleId',
        type: 'uint256'
      },
      {
        internalType: 'string',
        name: 'contentURI',
        type: 'string'
      }
    ],
    name: 'updateContentURI',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const;

// Lens Network
export const LENS_NETWORK = process.env.NEXT_PUBLIC_LENS_NETWORK ?? 'sandbox';
export const MAINNET_API_URL = 'https://api.lens.dev';
export const TESTNET_API_URL = 'https://api-mumbai.lens.dev';
export const SANDBOX_API_URL = 'https://api-sandbox-mumbai.lens.dev';
export const STAGING_API_URL = 'https://staging-api-social-mumbai.lens.crtlkey.com';
export const STAGING_SANDBOX_API_URL = 'https://staging-api-social-mumbai.sandbox.crtlkey.com';

export const API_URL = getEnvConfig().apiEndpoint;
export const LENSHUB_PROXY = getEnvConfig().lensHubProxyAddress;
export const LENS_PERIPHERY = getEnvConfig().lensPeripheryAddress;
export const DEFAULT_COLLECT_TOKEN = getEnvConfig().defaultCollectToken;
export const LIT_PROTOCOL_ENVIRONMENT = getEnvConfig().litProtocolEnvironment;

export const IS_MAINNET = API_URL === MAINNET_API_URL;

// XMTP
export const XMTP_ENV = IS_MAINNET ? 'production' : 'dev';
export const XMTP_PREFIX = 'lens.dev/dm';

// Application
export const APP_NAME = 'Lenster';
export const DESCRIPTION =
  'Lenster is a composable, decentralized, and permissionless social media web app built with Lens Protocol 🌿';
export const APP_VERSION = packageJson.version;

// Git
export const GIT_COMMIT_SHA = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7);

// Misc
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const LENSPROTOCOL_HANDLE = 'lensprotocol';
export const HANDLE_SUFFIX = IS_MAINNET ? '.lens' : '.test';

// Mixpanel
export const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN ?? '';
export const MIXPANEL_ENABLED = MIXPANEL_TOKEN && IS_PRODUCTION;

// Messages
export const ERROR_MESSAGE = 'Something went wrong!';
export const SIGN_WALLET = 'Please sign in your wallet.';
export const WRONG_NETWORK = IS_MAINNET
  ? 'Please change network to Polygon mainnet.'
  : 'Please change network to Polygon Mumbai testnet.';
export const SIGN_ERROR = 'Failed to sign data';

// URLs
export const STATIC_ASSETS_URL = 'https://static-assets.lenster.xyz';
export const STATIC_IMAGES_URL = `${STATIC_ASSETS_URL}/images`;
export const POLYGONSCAN_URL = IS_MAINNET ? 'https://polygonscan.com' : 'https://mumbai.polygonscan.com';
export const RARIBLE_URL = IS_MAINNET ? 'https://rarible.com' : 'https://testnet.rarible.com';
export const IPFS_GATEWAY = 'https://gateway.ipfscdn.io/ipfs/';
export const EVER_API = 'https://endpoint.4everland.co';
export const SIMPLEANALYTICS_API = 'https://simpleanalytics.com/lenster.xyz.json';
export const DEFAULT_OG = `${STATIC_IMAGES_URL}/og/logo.jpeg`;
export const IFRAMELY_URL = 'https://iframely.lenster.xyz/iframely';

// Workers
export const USER_CONTENT_URL = 'https://user-content.lenster.xyz';
export const STS_TOKEN_URL = IS_PRODUCTION ? 'https://sts.lenster.xyz' : 'http://localhost:8082';
export const METADATA_WORKER_URL = IS_PRODUCTION ? 'https://metadata.lenster.xyz' : 'http://localhost:8083';
export const FRESHDESK_WORKER_URL = IS_PRODUCTION ? 'https://freshdesk.lenster.xyz' : 'http://localhost:8084';

// Web3
export const ALCHEMY_KEY = 'oAMpbRc8dSPSJBeY4DQb-Ah9Jd5JCmgb';
export const WALLETCONNECT_PROJECT_ID = 'cd542acc70c2b548030f9901a52e70c8';

// Errors
export const ERRORS = {
  notMined:
    'A previous transaction may not been mined yet or you have passed in a invalid nonce. You must wait for that to be mined before doing another action, please try again in a few moments. Nonce out of sync.'
};

// Regex
export const URL_REGEX =
  /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[\da-z]+([.\-][\da-z]+)*\.[a-z]{2,63}(:\d{1,5})?(\/.*)?$/;
export const ADDRESS_REGEX = /^(0x)?[\da-f]{40}$/i;
export const HANDLE_REGEX = /^[\da-z]+$/;
export const ALL_HANDLES_REGEX = /([\s+])@(\S+)/g;
export const HANDLE_SANITIZE_REGEX = /[^\d .A-Za-z]/g;

// Utils
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'audio/aac',
  'audio/ogg',
  'audio/webm',
  'audio/flac'
];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/ogg', 'video/webm', 'video/quicktime'];
export const ALLOWED_MEDIA_TYPES = [...ALLOWED_VIDEO_TYPES, ...ALLOWED_IMAGE_TYPES, ...ALLOWED_AUDIO_TYPES];

// UI
export const MESSAGE_PAGE_LIMIT = 15;
export const MIN_WIDTH_DESKTOP = 1024;

// Named transforms
export const AVATAR = '300x300';
export const COVER = '1500x500';
export const ATTACHMENT = '1000,fit';

// Localstorage keys
export const LS_KEYS = {
  LENSTER_STORE: 'lenster.store',
  PREFERENCES_STORE: 'preferences.store',
  TRANSACTION_STORE: 'transaction.store',
  TIMELINE_STORE: 'timeline.store',
  MESSAGE_STORE: 'message.store',
  SELECTED_LOCALE: 'selected.locale'
};

// S3 bucket
export const S3_BUCKET = {
  LENSTER_MEDIA: 'lenster-media'
};
