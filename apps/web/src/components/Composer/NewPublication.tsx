import Attachments from '@components/Shared/Attachments';
import { AudioPublicationSchema } from '@components/Shared/Audio';
import withLexicalContext from '@components/Shared/Lexical/withLexicalContext';
import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { ErrorMessage } from '@components/UI/ErrorMessage';
import { Spinner } from '@components/UI/Spinner';
import type { IGif } from '@giphy/js-types';
import { ChatAlt2Icon, PencilAltIcon } from '@heroicons/react/outline';
import type { CollectCondition, EncryptedMetadata, FollowCondition } from '@lens-protocol/sdk-gated';
import { LensGatedSDK } from '@lens-protocol/sdk-gated';
import type {
  AccessConditionOutput,
  CreatePublicPostRequest
} from '@lens-protocol/sdk-gated/dist/graphql/types';
import { $convertFromMarkdownString } from '@lexical/markdown';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import getTextNftUrl from '@lib/getTextNftUrl';
import getUserLocale from '@lib/getUserLocale';
import { Mixpanel } from '@lib/mixpanel';
import onError from '@lib/onError';
import splitSignature from '@lib/splitSignature';
import uploadToArweave from '@lib/uploadToArweave';
import { t } from '@lingui/macro';
import { Group } from '@semaphore-protocol/group';
import { Identity } from '@semaphore-protocol/identity';
import type { FullProof } from '@semaphore-protocol/proof';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import { readContract } from '@wagmi/core';
import { LensHub } from 'abis';
import clsx from 'clsx';
import {
  ALLOWED_AUDIO_TYPES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  APP_NAME,
  LENSHUB_PROXY,
  LIT_PROTOCOL_ENVIRONMENT,
  SEMAPHORE_ZK3_CONTRACT_ABI,
  SEMAPHORE_ZK3_CONTRACT_ADDRESS,
  SIGN_WALLET,
  ZK3_REFERENCE_MODULE_ADDRESS
} from 'data/constants';
import { BigNumber, ethers } from 'ethers';
import { keccak256 } from 'ethers/lib/utils';
import type {
  CreatePublicCommentRequest,
  MetadataAttributeInput,
  Publication,
  PublicationMetadataV2Input
} from 'lens';
import {
  CollectModules,
  PublicationMainFocus,
  PublicationMetadataDisplayTypes,
  ReferenceModules,
  useBroadcastMutation,
  useCreateCommentTypedDataMutation,
  useCreateCommentViaDispatcherMutation,
  useCreatePostTypedDataMutation,
  useCreatePostViaDispatcherMutation
} from 'lens';
import { $getRoot } from 'lexical';
import dynamic from 'next/dynamic';
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { OptmisticPublicationType } from 'src/enums';
import { useAccessSettingsStore } from 'src/store/access-settings';
import { useAppStore } from 'src/store/app';
import { useCollectModuleStore } from 'src/store/collect-module';
import { usePublicationStore } from 'src/store/publication';
import { useReferenceModuleStore } from 'src/store/reference-module';
import { useTransactionPersistStore } from 'src/store/transaction';
import { PUBLICATION } from 'src/tracking';
import type { LensterAttachment } from 'src/types';
import getSignature from 'utils/getSignature';
import getTags from 'utils/getTags';
import { v4 as uuid } from 'uuid';
import { useContractWrite, useProvider, useSigner, useSignTypedData } from 'wagmi';

import Editor from './Editor';

const Attachment = dynamic(() => import('@components/Composer/Actions/Attachment'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});
const Giphy = dynamic(() => import('@components/Composer/Actions/Giphy'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});
const CollectSettings = dynamic(() => import('@components/Composer/Actions/CollectSettings'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});
const ReferenceSettings = dynamic(() => import('@components/Composer/Actions/ReferenceSettings'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});
const AccessSettings = dynamic(() => import('@components/Composer/Actions/AccessSettings'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});
const ZK3Settings = dynamic(() => import('@components/Composer/Actions/ZK3Settings/ZK3Settings'), {
  loading: () => <div className="shimmer mb-1 h-5 w-5 rounded-lg" />
});

const ZK3ReferenceModule: string = ZK3_REFERENCE_MODULE_ADDRESS;
interface NewPublicationProps {
  publication: Publication;
}
interface circle {
  id: string;
  members: string[];
  name: string;
  description: string;
  contentURI: string;
}

const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT;
async function uploadJSONToIPFS(val: string) {
  console.log('pinata jwt: ', PINATA_JWT);
  // upload to ipfs.io
  const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'post',
    body: val,
    headers: {
      'Content-type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`
    }
  });
  const { IpfsHash } = await res.json();
  const contentURI = `ipfs://${IpfsHash}`;
  console.log('contentURI: ', contentURI);
  return contentURI;
  // return res.json()
}

const NewPublication: FC<NewPublicationProps> = ({ publication }) => {
  // App store
  const userSigNonce = useAppStore((state) => state.userSigNonce);
  const setUserSigNonce = useAppStore((state) => state.setUserSigNonce);
  const currentProfile = useAppStore((state) => state.currentProfile);

  // Publication store
  const publicationContent = usePublicationStore((state) => state.publicationContent);
  const setPublicationContent = usePublicationStore((state) => state.setPublicationContent);
  const publicationSelectedCircle = usePublicationStore((state) => state.publicationSelectedCircle);
  //const setPublicationSelectedCircle = usePublicationStore((state) => state.setPublicationSelectedCircle);
  const audioPublication = usePublicationStore((state) => state.audioPublication);
  const setShowNewPostModal = usePublicationStore((state) => state.setShowNewPostModal);
  const attachments = usePublicationStore((state) => state.attachments);
  const setAttachments = usePublicationStore((state) => state.setAttachments);
  const addAttachments = usePublicationStore((state) => state.addAttachments);
  const isUploading = usePublicationStore((state) => state.isUploading);

  // Transaction persist store
  const txnQueue = useTransactionPersistStore((state) => state.txnQueue);
  const setTxnQueue = useTransactionPersistStore((state) => state.setTxnQueue);

  // Collect module store
  const selectedCollectModule = useCollectModuleStore((state) => state.selectedCollectModule);
  const payload = useCollectModuleStore((state) => state.payload);
  const resetCollectSettings = useCollectModuleStore((state) => state.reset);

  // Reference module store
  const selectedReferenceModule = useReferenceModuleStore((state) => state.selectedReferenceModule);
  const onlyFollowers = useReferenceModuleStore((state) => state.onlyFollowers);
  const degreesOfSeparation = useReferenceModuleStore((state) => state.degreesOfSeparation);

  // Access module store
  const restricted = useAccessSettingsStore((state) => state.restricted);
  const followToView = useAccessSettingsStore((state) => state.followToView);
  const collectToView = useAccessSettingsStore((state) => state.collectToView);
  const resetAccessSettings = useAccessSettingsStore((state) => state.reset);

  // States
  const [loading, setLoading] = useState(false);
  const [publicationContentError, setPublicationContentError] = useState('');
  const [editor] = useLexicalComposerContext();
  const provider = useProvider();
  const { data: signer } = useSigner();
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ZK3ReferenceModuleInitData, setZK3ReferenceModuleInitData] = useState<string>('');

  const isComment = Boolean(publication);
  const isAudioPublication = ALLOWED_AUDIO_TYPES.includes(attachments[0]?.type);

  const onCompleted = () => {
    editor.update(() => {
      $getRoot().clear();
    });
    setPublicationContent('');
    setAttachments([]);
    resetCollectSettings();
    resetAccessSettings();
    if (!isComment) {
      setShowNewPostModal(false);
    }

    // Track in mixpanel
    const eventProperties = {
      publication_type: restricted ? 'token_gated' : 'public',
      publication_collect_module: selectedCollectModule,
      publication_reference_module: selectedReferenceModule,
      publication_reference_module_degrees_of_separation:
        selectedReferenceModule === ReferenceModules.DegreesOfSeparationReferenceModule
          ? degreesOfSeparation
          : null,
      publication_has_attachments: attachments.length > 0,
      publication_attachment_types:
        attachments.length > 0 ? attachments.map((attachment) => attachment.type) : null
    };
    Mixpanel.track(isComment ? PUBLICATION.NEW_COMMENT : PUBLICATION.NEW_POST, eventProperties);
  };

  useEffect(() => {
    setPublicationContentError('');
  }, [audioPublication]);

  useEffect(() => {
    editor.update(() => {
      $convertFromMarkdownString(publicationContent);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ZK3 setup Identity state
  useEffect(() => {
    const fetchIdentity = () => {
      const identityString = localStorage.getItem('ZK3_identity');
      if (identityString) {
        const _identity = new Identity(identityString);
        if (!identity) {
          setIdentity(_identity);
        }
        console.log(_identity?.getCommitment());
      }
    };
    fetchIdentity();
    window.addEventListener('identity set', fetchIdentity);
    return () => window.removeEventListener('identity set', fetchIdentity);
  }, [identity]);

  const generateOptimisticPublication = ({ txHash, txId }: { txHash?: string; txId?: string }) => {
    return {
      id: uuid(),
      ...(isComment && { parent: publication.id }),
      type: isComment ? OptmisticPublicationType.NewComment : OptmisticPublicationType.NewPost,
      txHash,
      txId,
      content: publicationContent,
      attachments,
      title: audioPublication.title,
      cover: audioPublication.cover,
      author: audioPublication.author
    };
  };

  const { signTypedDataAsync, isLoading: typedDataLoading } = useSignTypedData({ onError });

  const { error, write } = useContractWrite({
    address: LENSHUB_PROXY,
    abi: LensHub,
    functionName: isComment ? 'commentWithSig' : 'postWithSig',
    mode: 'recklesslyUnprepared',
    onSuccess: ({ hash }) => {
      onCompleted();
      setTxnQueue([generateOptimisticPublication({ txHash: hash }), ...txnQueue]);
    },
    onError
  });

  const [broadcast] = useBroadcastMutation({
    onCompleted: (data) => {
      onCompleted();
      if (data.broadcast.__typename === 'RelayerResult') {
        setTxnQueue([generateOptimisticPublication({ txId: data.broadcast.txId }), ...txnQueue]);
      }
    }
  });

  const typedDataGenerator = async (generatedData: any) => {
    const { id, typedData } = generatedData;
    const {
      profileId,
      contentURI,
      collectModule,
      collectModuleInitData,
      referenceModule,
      referenceModuleInitData,
      referenceModuleData,
      deadline
    } = typedData.value;
    const signature = await signTypedDataAsync(getSignature(typedData));
    const { v, r, s } = splitSignature(signature);
    const sig = { v, r, s, deadline };
    const inputStruct = {
      profileId,
      contentURI,
      collectModule,
      collectModuleInitData,
      referenceModule,
      referenceModuleInitData,
      referenceModuleData,
      ...(isComment && {
        profileIdPointed: typedData.value.profileIdPointed,
        pubIdPointed: typedData.value.pubIdPointed
      }),
      sig
    };
    setUserSigNonce(userSigNonce + 1);
    const { data } = await broadcast({ variables: { request: { id, signature } } });
    if (data?.broadcast.__typename === 'RelayError') {
      return write({ recklesslySetUnpreparedArgs: [inputStruct] });
    }
  };

  const [createCommentTypedData] = useCreateCommentTypedDataMutation({
    onCompleted: async ({ createCommentTypedData }) => await typedDataGenerator(createCommentTypedData),
    onError
  });

  const [createPostTypedData] = useCreatePostTypedDataMutation({
    onCompleted: async ({ createPostTypedData }) => await typedDataGenerator(createPostTypedData),
    onError
  });

  const [createCommentViaDispatcher] = useCreateCommentViaDispatcherMutation({
    onCompleted: (data) => {
      onCompleted();
      if (data.createCommentViaDispatcher.__typename === 'RelayerResult') {
        setTxnQueue([
          generateOptimisticPublication({ txId: data.createCommentViaDispatcher.txId }),
          ...txnQueue
        ]);
      }
    },
    onError
  });

  const [createPostViaDispatcher] = useCreatePostViaDispatcherMutation({
    onCompleted: (data) => {
      onCompleted();
      if (data.createPostViaDispatcher.__typename === 'RelayerResult') {
        setTxnQueue([
          generateOptimisticPublication({ txId: data.createPostViaDispatcher.txId }),
          ...txnQueue
        ]);
      }
    },
    onError
  });

  const createViaDispatcher = async (request: any) => {
    const variables = {
      options: { overrideSigNonce: userSigNonce },
      request
    };

    if (isComment) {
      const { data } = await createCommentViaDispatcher({ variables: { request } });
      if (data?.createCommentViaDispatcher?.__typename === 'RelayError') {
        return await createCommentTypedData({ variables });
      }

      return;
    }

    const { data } = await createPostViaDispatcher({ variables: { request } });
    if (data?.createPostViaDispatcher?.__typename === 'RelayError') {
      return await createPostTypedData({ variables });
    }

    return;
  };

  const getMainContentFocus = () => {
    if (attachments.length > 0) {
      if (isAudioPublication) {
        return PublicationMainFocus.Audio;
      } else if (ALLOWED_IMAGE_TYPES.includes(attachments[0]?.type)) {
        return PublicationMainFocus.Image;
      } else if (ALLOWED_VIDEO_TYPES.includes(attachments[0]?.type)) {
        return PublicationMainFocus.Video;
      } else {
        return PublicationMainFocus.TextOnly;
      }
    } else {
      return PublicationMainFocus.TextOnly;
    }
  };

  const getAnimationUrl = () => {
    if (
      attachments.length > 0 &&
      (isAudioPublication || ALLOWED_VIDEO_TYPES.includes(attachments[0]?.type))
    ) {
      return attachments[0]?.item;
    }

    return null;
  };

  const getAttachmentImage = () => {
    return isAudioPublication ? audioPublication.cover : attachments[0]?.item;
  };

  const getAttachmentImageMimeType = () => {
    return isAudioPublication ? audioPublication.coverMimeType : attachments[0]?.type;
  };

  const createTokenGatedMetadata = async (metadata: PublicationMetadataV2Input) => {
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    if (!signer) {
      return toast.error(SIGN_WALLET);
    }

    // Create the SDK instance
    const tokenGatedSdk = await LensGatedSDK.create({
      provider,
      signer,
      env: LIT_PROTOCOL_ENVIRONMENT as any
    });

    // Connect to the SDK
    await tokenGatedSdk.connect({
      address: currentProfile.ownedBy,
      env: LIT_PROTOCOL_ENVIRONMENT as any
    });

    // Condition for gating the content
    const collectAccessCondition: CollectCondition = { thisPublication: true };
    const followAccessCondition: FollowCondition = { profileId: currentProfile.id };

    // Create the access condition
    let accessCondition: AccessConditionOutput = {};
    if (collectToView && followToView) {
      accessCondition = {
        and: { criteria: [{ collect: collectAccessCondition }, { follow: followAccessCondition }] }
      };
    } else if (collectToView) {
      accessCondition = { collect: collectAccessCondition };
    } else if (followToView) {
      accessCondition = { follow: followAccessCondition };
    }

    // Generate the encrypted metadata and upload it to Arweave
    const { contentURI } = await tokenGatedSdk.gated.encryptMetadata(
      metadata,
      currentProfile.id,
      accessCondition,
      async (data: EncryptedMetadata) => {
        return await uploadToArweave(data);
      }
    );

    return contentURI;
  };

  const createMetadata = async (metadata: PublicationMetadataV2Input) => {
    return await uploadToArweave(metadata);
  };

  // Generate Group from Circle
  function generateGroupFromCircle(_circle: circle) {
    const _group = new Group(_circle.id);
    console.log('roop pre adding members: ', _group.root);
    console.log('circle Members: ', _circle.members);
    _group.addMembers([...new Set(_circle.members)]);
    console.log('group: ', _group);
    console.log('group root: ', _group.root);
    return _group;
  }

  // ZK3 Proof Creation
  const createZK3Proof = async (_identity: Identity, _circle: circle, _signal: string) => {
    console.log('start generateFullProof', _identity);
    if (_identity && _circle && _signal) {
      console.log('generating proof: ', _circle, _signal);
    } else {
      console.log('generateFullProof: failed argument check: ', _identity, _circle, _signal);
      return;
    }
    const group = generateGroupFromCircle(_circle);
    if (!group) {
      console.log('no group');
      return;
    }
    console.log('generateFullProof: passed all return checks');
    // check if identity is part of the group
    if (!group.indexOf(_identity.commitment.toString())) {
      console.log('identity is not part of the group', _identity.commitment, group.members);
      return;
    }
    const externalNullifier = group.root;
    const hashedPostBody = BigNumber.from(keccak256(Buffer.from(_signal)));
    // const merkleProof = await group.generateMerkleProof(group.indexOf(_identity.commitment))
    console.log('root: ', group.root);
    const fullProof: FullProof = await generateProof(_identity, group, externalNullifier, hashedPostBody);
    console.log('fullProof: ', fullProof);

    const success = await verifyProof(fullProof, 20);
    console.log('isSuccess: ', success);
    // todo: actually attach proof to post and send it (after testing that the proof is ok!)
    return { proof: fullProof, group };
  };

  const createPublication = async () => {
    console.log('entering createPublication');
    if (!currentProfile) {
      return toast.error(SIGN_WALLET);
    }

    try {
      setLoading(true);
      if (isAudioPublication) {
        setPublicationContentError('');
        const parsedData = AudioPublicationSchema.safeParse(audioPublication);
        if (!parsedData.success) {
          const issue = parsedData.error.issues[0];
          return setPublicationContentError(issue.message);
        }
      }
      if (publicationContent.length === 0 && attachments.length === 0) {
        return setPublicationContentError(`${isComment ? 'Comment' : 'Post'} should not be empty!`);
      }

      setPublicationContentError('');
      let textNftImageUrl = null;
      if (!attachments.length && selectedCollectModule !== CollectModules.RevertCollectModule) {
        textNftImageUrl = await getTextNftUrl(
          publicationContent,
          currentProfile.handle,
          new Date().toLocaleString()
        );
      }

      const attributes: MetadataAttributeInput[] = [
        {
          traitType: 'type',
          displayType: PublicationMetadataDisplayTypes.String,
          value: getMainContentFocus()?.toLowerCase()
        }
      ];

      if (isAudioPublication) {
        attributes.push({
          traitType: 'author',
          displayType: PublicationMetadataDisplayTypes.String,
          value: audioPublication.author
        });
      }

      const attachmentsInput: LensterAttachment[] = attachments.map((attachment) => ({
        type: attachment.type,
        altTag: attachment.altTag,
        item: attachment.item!
      }));

      if (publicationSelectedCircle) {
        attributes.push({
          traitType: 'zk3Circle',
          displayType: PublicationMetadataDisplayTypes.String,
          value: publicationSelectedCircle.description
        });
        attributes.push({
          traitType: 'zk3CircleId',
          displayType: PublicationMetadataDisplayTypes.String,
          value: publicationSelectedCircle.id
        });
      }

      const metadata: PublicationMetadataV2Input = {
        version: '2.0.0',
        metadata_id: uuid(),
        content: publicationContent,
        external_url: `https://lenster.xyz/u/${currentProfile?.handle}`,
        image: attachmentsInput.length > 0 ? getAttachmentImage() : textNftImageUrl,
        imageMimeType:
          attachmentsInput.length > 0
            ? getAttachmentImageMimeType()
            : textNftImageUrl
            ? 'image/svg+xml'
            : null,
        name: isAudioPublication
          ? audioPublication.title
          : `${isComment ? 'Comment' : 'Post'} by @${currentProfile?.handle}`,
        tags: getTags(publicationContent),
        animation_url: getAnimationUrl(),
        mainContentFocus: getMainContentFocus(),
        contentWarning: null,
        attributes,
        media: attachmentsInput,
        locale: getUserLocale(),
        appId: APP_NAME
      };

      let arweaveId = null;
      let ipfsId: string | null = null;
      if (restricted) {
        arweaveId = await createTokenGatedMetadata(metadata);
      } else if (publicationSelectedCircle) {
        // ipfsId = await uploadToIPFS(metadata);
        ipfsId = await uploadJSONToIPFS(JSON.stringify(metadata));
      } else {
        arweaveId = await createMetadata(metadata);
      }

      const calcRefModule = () => {
        if (selectedReferenceModule === ReferenceModules.FollowerOnlyReferenceModule) {
          return { followerOnlyReferenceModule: onlyFollowers ? true : false };
        }

        return {
          degreesOfSeparationReferenceModule: {
            commentsRestricted: true,
            mirrorsRestricted: true,
            degreesOfSeparation
          }
        };
      };
      let initData: string = ZK3ReferenceModuleInitData;
      if (publicationSelectedCircle) {
        const { proof, group } = (await createZK3Proof(
          identity!,
          publicationSelectedCircle,
          publicationContent
        ))!;

        console.log('rootOnChainArgs: ', SEMAPHORE_ZK3_CONTRACT_ADDRESS, [
          BigNumber.from(publicationSelectedCircle?.id)
        ]);
        const rootOnChain = await readContract({
          address: SEMAPHORE_ZK3_CONTRACT_ADDRESS,
          abi: SEMAPHORE_ZK3_CONTRACT_ABI,
          functionName: 'getMerkleTreeRoot',
          args: [BigNumber.from(publicationSelectedCircle?.id)]
        });
        const hashedPostBody = BigNumber.from(keccak256(Buffer.from(publicationContent)));
        initData = ethers.utils.AbiCoder.prototype.encode(
          ['bool', 'bool', 'uint256', 'uint256', 'uint256', 'uint256', 'uint256[8]'],
          [
            false,
            false,
            hashedPostBody,
            proof?.nullifierHash,
            publicationSelectedCircle?.id.toString(),
            proof?.externalNullifier,
            proof?.proof
          ]
        );
        console.log('initData', initData);
        setZK3ReferenceModuleInitData(initData);
        console.log('ZK3ReferenceModuleInitData', ZK3ReferenceModuleInitData);

        console.log('rootOnChain', rootOnChain.toString());
        // check if roots match
        if (rootOnChain.toString() !== group.root.toString()) {
          console.log('localRoot', group.root.toString());
          console.log("roots don't match");
          return;
        }
        const isValid = await readContract({
          address: SEMAPHORE_ZK3_CONTRACT_ADDRESS,
          abi: SEMAPHORE_ZK3_CONTRACT_ABI,
          functionName: 'isValidProof',
          args: [
            hashedPostBody,
            BigNumber.from(proof?.nullifierHash),
            BigNumber.from(publicationSelectedCircle?.id),
            BigNumber.from(proof?.externalNullifier),
            // @ts-ignore
            proof?.proof
          ]
        });

        console.log('isValid', isValid);

        const broadcastPost = async () => {
          const broadcastPostMutation = {
            operationName: 'Mutation',
            query: `
              mutation Mutation($circleId: ID!, $profileId: String!, $contentUri: String!, $refInitData: String!, $signature: String) {
                  broadcastPost(circleId: $circleId, profileId: $profileId, contentURI: $contentUri, refInitData: $refInitData, signature: $signature)
                }
                `,
            variables: {
              circleId: publicationSelectedCircle.id,
              profileId: currentProfile?.id,
              contentUri: ipfsId,
              refInitData: initData
            }
          };

          const response = await fetch('https://dev.zk3.io/graphql', {
            method: 'POST',
            headers: {
              'x-access-token': `Bearer ${localStorage.getItem('accessToken')}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(broadcastPostMutation)
          });
          const data: { data: any } = await response.json();
          console.log('broadcastPost with Dispatcher: ', data.data);
          return data.data;
        };

        const result = await broadcastPost();
        console.log('result: ', result);
      } else {
        // if ZK3 Proof attached, temp force to ZK3 reference module
        const request: CreatePublicPostRequest | CreatePublicCommentRequest = {
          profileId: currentProfile?.id,
          contentURI: publicationSelectedCircle ? `${ipfsId}` : `ar://${arweaveId}`,
          ...(isComment && {
            publicationId: publication.__typename === 'Mirror' ? publication?.mirrorOf?.id : publication?.id
          }),
          collectModule: payload,
          referenceModule: publicationSelectedCircle
            ? {
                unknownReferenceModule: {
                  contractAddress: ZK3ReferenceModule,
                  data: initData
                }
              }
            : calcRefModule()
        };

        console.log('request', request);

        if (currentProfile?.dispatcher?.canUseRelay) {
          return await createViaDispatcher(request);
        }
        if (isComment) {
          return await createCommentTypedData({
            variables: {
              options: { overrideSigNonce: userSigNonce },
              request: request as CreatePublicCommentRequest
            }
          });
        }
        console.log('checkpoint');
        // return await publishPost({
        //   recklesslySetUnpreparedArgs: [
        //     {
        //       profileId: request.profileId,
        //       contentURI: request.contentURI,
        //       collectModule: '0x',
        //       collectModuleInitData: '0x',
        //       referenceModule: ZK3ReferenceModule, // add address of LensZK3ReferenceModule here
        //       referenceModuleInitData: initData // add ABI encoded proof here
        //     }
        //   ]
        // });
        return await createPostTypedData({
          variables: { options: { overrideSigNonce: userSigNonce }, request }
        });
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const setGifAttachment = (gif: IGif) => {
    const attachment = {
      id: uuid(),
      item: gif.images.original.url,
      type: 'image/gif',
      altTag: gif.title
    };
    addAttachments([attachment]);
  };

  const isLoading = loading || typedDataLoading;

  return (
    <Card className={clsx({ 'rounded-none border-none': !isComment }, 'pb-3')}>
      {error && <ErrorMessage className="mb-3" title={t`Transaction failed!`} error={error} />}
      <Editor />
      {publicationContentError && (
        <div className="mt-1 px-5 pb-3 text-sm font-bold text-red-500">{publicationContentError}</div>
      )}
      <div className="block items-center px-5 sm:flex">
        <div className="flex items-center space-x-4">
          <Attachment />
          <Giphy setGifAttachment={(gif: IGif) => setGifAttachment(gif)} />
          <CollectSettings />
          <ReferenceSettings />
          <AccessSettings />
          <ZK3Settings />
        </div>
        <div className="ml-auto pt-2 sm:pt-0">
          <Button
            disabled={isLoading || isUploading}
            icon={
              isLoading ? (
                <Spinner size="xs" />
              ) : isComment ? (
                <ChatAlt2Icon className="h-4 w-4" />
              ) : (
                <PencilAltIcon className="h-4 w-4" />
              )
            }
            onClick={createPublication}
          >
            {isComment
              ? t({ id: '[cta]Comment', message: 'Comment' })
              : t({ id: '[cta]Post', message: 'Post' })}
          </Button>
        </div>
      </div>
      <div className="px-5">
        <Attachments attachments={attachments} isNew />
      </div>
    </Card>
  );
};

export default withLexicalContext(NewPublication);
