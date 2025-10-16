/**
 * Session Key Manager UI Component
 * User-friendly interface for managing session keys
 */

import React, { useState, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  Icon,
  IconName,
  Modal,
  ModalContent,
  ModalHeader,
  TextField,
} from '../../component-library';
import { useI18nContext } from '../../../hooks/useI18nContext';

interface SessionKey {
  address: string;
  validUntil: number;
  validAfter: number;
  permissions: string[];
  label: string;
}

interface SessionKeyManagerProps {
  sessionKeys: SessionKey[];
  onAdd: (key: Omit<SessionKey, 'address'>) => void;
  onRevoke: (address: string) => void;
}

export const SessionKeyManager: React.FC<SessionKeyManagerProps> = ({
  sessionKeys,
  onAdd,
  onRevoke,
}) => {
  const t = useI18nContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newKey, setNewKey] = useState({
    label: '',
    duration: '1', // hours
    permissions: [] as string[],
  });

  const handleAddKey = useCallback(() => {
    const now = Math.floor(Date.now() / 1000);
    const duration = parseInt(newKey.duration) * 3600; // Convert hours to seconds

    onAdd({
      label: newKey.label,
      validAfter: now,
      validUntil: now + duration,
      permissions: newKey.permissions,
    });

    setNewKey({ label: '', duration: '1', permissions: [] });
    setIsModalOpen(false);
  }, [newKey, onAdd]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (validUntil: number) => {
    return Date.now() / 1000 > validUntil;
  };

  const getTimeRemaining = (validUntil: number) => {
    const remaining = validUntil - Date.now() / 1000;
    if (remaining < 0) return 'Expired';

    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      return `${Math.floor(hours / 24)} days`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} minutes`;
  };

  return (
    <Box className="session-key-manager" padding={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={4}>
        <Box>
          <Text variant="headingMd" fontWeight="bold">
            {t('sessionKeys')}
          </Text>
          <Text variant="bodySm" color="text-alternative">
            {t('sessionKeysDescription')}
          </Text>
        </Box>
        <Button
          variant="primary"
          size="sm"
          startIconName={IconName.Add}
          onClick={() => setIsModalOpen(true)}
        >
          {t('addSessionKey')}
        </Button>
      </Box>

      {sessionKeys.length === 0 ? (
        <Box
          padding={8}
          borderRadius="lg"
          backgroundColor="background-alternative"
          textAlign="center"
        >
          <Icon name={IconName.Key} size="lg" color="icon-muted" marginBottom={2} />
          <Text variant="bodyMd" color="text-alternative">
            {t('noSessionKeys')}
          </Text>
          <Text variant="bodySm" color="text-muted" marginTop={2}>
            {t('sessionKeysEmptyDescription')}
          </Text>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {sessionKeys.map((key) => (
            <Box
              key={key.address}
              padding={4}
              borderRadius="md"
              borderWidth={1}
              borderColor={isExpired(key.validUntil) ? 'border-muted' : 'border-default'}
              backgroundColor={isExpired(key.validUntil) ? 'background-alternative' : 'background-default'}
            >
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box flex={1}>
                  <Box display="flex" alignItems="center" gap={2} marginBottom={2}>
                    <Icon
                      name={isExpired(key.validUntil) ? IconName.Danger : IconName.Key}
                      color={isExpired(key.validUntil) ? 'icon-muted' : 'icon-default'}
                    />
                    <Text variant="bodyMd" fontWeight="medium">
                      {key.label}
                    </Text>
                    {isExpired(key.validUntil) && (
                      <Box
                        paddingLeft={2}
                        paddingRight={2}
                        paddingTop={1}
                        paddingBottom={1}
                        borderRadius="pill"
                        backgroundColor="error-muted"
                      >
                        <Text variant="bodySm" color="error-default">
                          {t('expired')}
                        </Text>
                      </Box>
                    )}
                  </Box>

                  <Box display="flex" flexDirection="column" gap={1}>
                    <Text variant="bodySm" color="text-alternative">
                      <strong>{t('address')}:</strong> {key.address.slice(0, 10)}...{key.address.slice(-8)}
                    </Text>
                    <Text variant="bodySm" color="text-alternative">
                      <strong>{t('expires')}:</strong> {formatDate(key.validUntil)} ({getTimeRemaining(key.validUntil)})
                    </Text>
                    <Text variant="bodySm" color="text-alternative">
                      <strong>{t('permissions')}:</strong> {key.permissions.join(', ')}
                    </Text>
                  </Box>
                </Box>

                <Button
                  variant="secondary"
                  size="sm"
                  danger
                  onClick={() => onRevoke(key.address)}
                  startIconName={IconName.Trash}
                >
                  {t('revoke')}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalHeader onClose={() => setIsModalOpen(false)}>
          {t('addSessionKey')}
        </ModalHeader>
        <ModalContent>
          <Box padding={4}>
            <Box marginBottom={4}>
              <Text variant="bodyMd" marginBottom={2}>
                {t('sessionKeyLabel')}
              </Text>
              <TextField
                placeholder={t('sessionKeyLabelPlaceholder')}
                value={newKey.label}
                onChange={(e) => setNewKey({ ...newKey, label: e.target.value })}
              />
            </Box>

            <Box marginBottom={4}>
              <Text variant="bodyMd" marginBottom={2}>
                {t('duration')}
              </Text>
              <TextField
                type="number"
                placeholder="1"
                value={newKey.duration}
                onChange={(e) => setNewKey({ ...newKey, duration: e.target.value })}
                endAdornment={<Text variant="bodySm">{t('hours')}</Text>}
              />
            </Box>

            <Box marginBottom={4}>
              <Text variant="bodyMd" marginBottom={2}>
                {t('permissions')}
              </Text>
              {['eth_sendTransaction', 'eth_signTypedData', 'personal_sign'].map((perm) => (
                <Box key={perm} display="flex" alignItems="center" gap={2} marginBottom={2}>
                  <input
                    type="checkbox"
                    checked={newKey.permissions.includes(perm)}
                    onChange={(e) => {
                      const perms = e.target.checked
                        ? [...newKey.permissions, perm]
                        : newKey.permissions.filter((p) => p !== perm);
                      setNewKey({ ...newKey, permissions: perms });
                    }}
                  />
                  <Text variant="bodySm">{perm}</Text>
                </Box>
              ))}
            </Box>

            <Box display="flex" gap={2} justifyContent="flex-end">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button
                variant="primary"
                onClick={handleAddKey}
                disabled={!newKey.label || newKey.permissions.length === 0}
              >
                {t('add')}
              </Button>
            </Box>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};
