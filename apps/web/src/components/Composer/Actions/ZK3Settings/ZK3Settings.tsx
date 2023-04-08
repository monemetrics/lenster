import MenuTransition from '@components/Shared/MenuTransition';
import HelpTooltip from '@components/UI/HelpTooltip';
import { Modal } from '@components/UI/Modal';
import { Spinner } from '@components/UI/Spinner';
import { Tooltip } from '@components/UI/Tooltip';
import useOnClickOutside from '@components/utils/hooks/useOnClickOutside';
import { Menu } from '@headlessui/react';
import { KeyIcon } from '@heroicons/react/outline';
import { t, Trans } from '@lingui/macro';
import clsx from 'clsx';
import type { FC } from 'react';
import { useId, useRef, useState } from 'react';
// import toast from 'react-hot-toast';
import { usePublicationStore } from 'src/store/publication';

// import { PUBLICATION } from 'src/tracking';
import AttachProofSettings from './AttachProofSettings';

const ZK3: FC = () => {
  // const attachments = usePublicationStore((state) => state.attachments);

  const publicationSelectedCircle = usePublicationStore((state) => state.publicationSelectedCircle);
  const isUploading = usePublicationStore((state) => state.isUploading);
  const [showMenu, setShowMenu] = useState(false);
  const id = useId();
  const dropdownRef = useRef(null);
  const [showModal, setShowModal] = useState(false);

  useOnClickOutside(dropdownRef, () => setShowMenu(false));

  return (
    <Menu as="div">
      <Menu.Button
        onClick={() => setShowMenu(!showMenu)}
        className="rounded-full hover:bg-gray-300 hover:bg-opacity-20"
        aria-label="More"
      >
        {isUploading ? (
          <Spinner size="sm" />
        ) : (
          <Tooltip placement="top" content="ZK3">
            <KeyIcon
              className={clsx(publicationSelectedCircle ? 'text-green-500' : 'text-brand', 'h-5 w-5')}
            />
          </Tooltip>
        )}
      </Menu.Button>
      <MenuTransition show={showMenu}>
        <Menu.Items
          ref={dropdownRef}
          static
          className="absolute z-[5] mt-2 rounded-xl border bg-white py-1 shadow-sm focus:outline-none dark:border-gray-700 dark:bg-gray-900"
        >
          <Menu.Item
            as="label"
            className={({ active }) =>
              clsx(
                { 'dropdown-active': active },
                'menu-item !flex cursor-pointer items-center gap-1 space-x-1 rounded-lg'
              )
            }
            htmlFor={`image_${id}`}
            onClick={() => setShowModal(!showModal)}
          >
            <KeyIcon className="text-brand h-4 w-4" />
            <span className="text-sm">Attach ZK3 Proof</span>
          </Menu.Item>
        </Menu.Items>
      </MenuTransition>
      <Modal
        title={
          <div className="flex items-center space-x-2">
            <span>
              <Trans>ZK3 Wizard</Trans>
            </span>
            <HelpTooltip content={t`Select or generate ZK3 proofs to attach to your post.`} />
          </div>
        }
        icon={<KeyIcon className="text-brand h-5 w-5" />}
        show={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        <AttachProofSettings setShowModal={setShowModal} />
      </Modal>
    </Menu>
  );
};

export default ZK3;
