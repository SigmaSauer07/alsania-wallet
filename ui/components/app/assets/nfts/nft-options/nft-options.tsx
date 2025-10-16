import React, { useContext, useRef, useState } from 'react';
import { I18nContext } from '../../../../../contexts/i18n';
import {
  Box,
  ButtonIcon,
  ButtonIconSize,
  Icon,
  IconName,
  IconSize,
  Popover,
  PopoverPosition,
} from '../../../../component-library';
import { IconColor } from '../../../../../helpers/constants/design-system';
import { SelectableListItem } from '../../asset-list/sort-control/sort-control';

type NftOptionsProps = {
  onRemove: () => void;
  onViewOnOpensea?: () => void;
  showOpenSeaLink: boolean;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
  onCopyMetadataUrl?: () => void;
  onDownloadImage?: () => void;
};

const NftOptions = ({
  onRemove,
  onViewOnOpensea,
  showOpenSeaLink,
  onToggleFavorite,
  isFavorite,
  onCopyMetadataUrl,
  onDownloadImage,
}: NftOptionsProps) => {
  const t = useContext(I18nContext);
  const [nftOptionsOpen, setNftOptionsOpen] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  const closePopover = () => {
    setNftOptionsOpen(false);
  };

  return (
    <Box ref={ref}>
      <ButtonIcon
        iconName={IconName.MoreVertical}
        data-testid="nft-options__button"
        onClick={() => setNftOptionsOpen(!nftOptionsOpen)}
        color={IconColor.iconDefault}
        size={ButtonIconSize.Sm}
        ariaLabel={t('nftOptions')}
      />
      <Popover
        onClickOutside={closePopover}
        isOpen={nftOptionsOpen}
        position={PopoverPosition.BottomEnd}
        referenceElement={ref.current}
        matchWidth={false}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
        }}
      >
        {showOpenSeaLink ? (
          <SelectableListItem
            testId="nft-options__view-on-opensea"
            onClick={() => {
              closePopover();
              onViewOnOpensea?.();
            }}
          >
            <Icon
              name={IconName.Export}
              size={IconSize.Sm}
              marginInlineEnd={2}
            />
            {t('viewOnOpensea')}
          </SelectableListItem>
        ) : null}
        {onToggleFavorite ? (
          <SelectableListItem
            testId="nft-options__favorite"
            onClick={() => {
              closePopover();
              onToggleFavorite?.();
            }}
          >
            <Icon
              name={isFavorite ? IconName.BookmarkFilled : IconName.Bookmark}
              size={IconSize.Sm}
              marginInlineEnd={2}
            />
            {isFavorite ? t('removeFavorite') : t('addFavorite')}
          </SelectableListItem>
        ) : null}
        {onCopyMetadataUrl ? (
          <SelectableListItem
            testId="nft-options__copy-metadata-url"
            onClick={() => {
              closePopover();
              onCopyMetadataUrl?.();
            }}
          >
            <Icon name={IconName.Copy} size={IconSize.Sm} marginInlineEnd={2} />
            {t('copyMetadataUrl')}
          </SelectableListItem>
        ) : null}
        {onDownloadImage ? (
          <SelectableListItem
            testId="nft-options__download-image"
            onClick={() => {
              closePopover();
              onDownloadImage?.();
            }}
          >
            <Icon name={IconName.Download} size={IconSize.Sm} marginInlineEnd={2} />
            {t('downloadImage')}
          </SelectableListItem>
        ) : null}
        <SelectableListItem
          testId="nft-item-remove"
          onClick={() => {
            closePopover();
            onRemove?.();
          }}
        >
          <Icon name={IconName.Trash} size={IconSize.Sm} marginInlineEnd={2} />
          {t('removeNFT')}
        </SelectableListItem>
      </Popover>
    </Box>
  );
};

export default NftOptions;
