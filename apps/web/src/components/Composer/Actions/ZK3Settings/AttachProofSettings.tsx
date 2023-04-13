import { Button } from '@components/UI/Button';
import { Card } from '@components/UI/Card';
import { CheckCircleIcon, KeyIcon } from '@heroicons/react/solid';
import onError from '@lib/onError';
import { Trans } from '@lingui/macro';
import { Identity } from '@semaphore-protocol/identity';
import clsx from 'clsx';
import type { Dispatch, FC, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { useAccessSettingsStore } from 'src/store/access-settings';
import { usePublicationStore } from 'src/store/publication';
import { useSignMessage } from 'wagmi';

interface AttachProofSettings {
  setShowModal: Dispatch<boolean>;
}

const ZK3_endpoint = 'https://dev.zk3.io/graphql';
const headers = {
  'content-type': 'application/json'
};
const graphqlQuery = {
  operationName: 'GetCircles',
  query: `query GetCircles { circles { id name description members contentURI } }`,
  variables: {}
};

const options = {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(graphqlQuery)
};

interface circle {
  id: string;
  members: string[];
  name: string;
  description: string;
  contentURI: string;
}

interface ModuleProps {
  title: string;
  icon: ReactNode;
  onClick: () => void;
  selected: boolean;
}

const ZK3Proof: FC<ModuleProps> = ({ title, icon, onClick, selected }) => (
  <div className={clsx({ 'dropdown-active': selected }, 'menu-item', 'shadow-md')} onClick={onClick}>
    <div className="flex items-center justify-between space-x-2">
      <div className="flex items-center space-x-1.5">
        <div className="text-brand-500">{icon}</div>
        <div>{title}</div>
      </div>
      {selected && <CheckCircleIcon className="w-5 text-green-500" />}
    </div>
  </div>
);

interface AttachProofProps {
  setShowModal: Dispatch<boolean>;
}

const AttachProofSettings: FC<AttachProofProps> = ({ setShowModal }) => {
  const hasConditions = useAccessSettingsStore((state) => state.hasConditions);
  const reset = useAccessSettingsStore((state) => state.reset);
  const publicationSelectedCircle = usePublicationStore((state) => state.publicationSelectedCircle);
  const setPublicationSelectedCircle = usePublicationStore((state) => state.setPublicationSelectedCircle);
  const { signMessageAsync } = useSignMessage({ onError });
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [myCircleList, setMyCircleList] = useState<circle[]>([]);

  useEffect(() => {
    const identityString = localStorage.getItem('ZK3_identity');
    if (identityString) {
      console.log('entered identityString check: ', identityString);
      const _identity = new Identity(identityString);
      if (!identity) {
        setIdentity(_identity);
      }
      console.log(_identity?.getCommitment());
      const fetchCircleData = async () => {
        const response = await fetch(ZK3_endpoint, options);
        const data = await response.json();
        var _myCircleList: circle[] = [];
        // eslint-disable-next-line unicorn/no-array-for-each
        data.data.circles.forEach((element: any) => {
          if (element.members.includes(identity?.getCommitment().toString())) {
            _myCircleList.push(element);
          }
        });
        console.log(_myCircleList);
        setMyCircleList(_myCircleList);
      };
      fetchCircleData();
      console.log('circle data fetched');
    }
  }, [identity]);

  const handleConnectIdentity = async () => {
    // Get signature
    const signature = await signMessageAsync({
      message: 'gm zk3 frens'
    });
    const _identity = new Identity(signature);
    localStorage.setItem('ZK3_identity', _identity.toString());
    setIdentity(_identity);
    window.dispatchEvent(new Event('identity set'));
    console.log('end of handleConnectIdentity');
  };

  const onSave = () => {
    if (!hasConditions()) {
      reset();
    }
    setShowModal(false);
  };

  return (
    <div className="p-5">
      {!identity && (
        <Card className="mt-5 flex items-center justify-between p-5">
          <Trans>No Identity Found</Trans>
          <Button onClick={handleConnectIdentity}>
            <Trans>Sign Identity</Trans>
          </Button>
        </Card>
      )}
      {identity && (
        <>
          {myCircleList.map((circle) => (
            <ZK3Proof
              key={circle.id}
              title={circle.description}
              selected={publicationSelectedCircle ? publicationSelectedCircle.id === circle.id : false}
              icon={<KeyIcon className="h-4 w-4" />}
              onClick={() => {
                setPublicationSelectedCircle(circle);
              }}
            />
          ))}
        </>
      )}
      <div className="flex justify-between space-x-2 pt-5">
        <a href="https://zk3-app-zk3.vercel.app/" target="_blank">
          <Button>
            <Trans>New Proof</Trans>
          </Button>
        </a>
        <div className="flex justify-end space-x-2">
          <Button
            className="ml-auto"
            variant="danger"
            outline
            onClick={() => {
              setPublicationSelectedCircle(null);
              onSave();
            }}
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button onClick={onSave}>
            <Trans>Save</Trans>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AttachProofSettings;
