import { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

import { useElectronEvent } from '../../../../common/hooks/useElectronEvent';
import { isLocalhost, isOntimeCloud } from '../../../../externals';
import * as Panel from '../../panel-utils/PanelUtils';

export default function ShutdownPanel() {
  const { isElectron, sendToElectron } = useElectronEvent();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const sendShutdown = () => {
    sendToElectron('shutdown', 'now');
    onClose();
  };

  const canShutdown = isElectron || isLocalhost;

  return (
    <>
      <Panel.Header>Shutdown Ontime</Panel.Header>
      <Panel.Section>
        {isOntimeCloud ? (
          <Panel.Highlight>
            For security reasons, shutting down the server must be done from the Ontime Cloud dashboard.
          </Panel.Highlight>
        ) : (
          <Panel.Paragraph>
            This will shutdown the Ontime server. <br />
            The runtime state will be lost, but your project is kept for next time.
          </Panel.Paragraph>
        )}
        <Button colorScheme='red' onClick={onOpen} maxWidth='350px' isDisabled={!(isElectron || isLocalhost)}>
          Shutdown ontime
        </Button>
        {!canShutdown && (
          <Panel.Description>Note: Ontime can only be shutdown from the machine it is running in.</Panel.Description>
        )}
        <AlertDialog variant='ontime' isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Ontime Shutdown
              </AlertDialogHeader>
              <AlertDialogBody>
                This will shutdown the Ontime server. <br /> Are you sure?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose} variant='ontime-ghosted-white'>
                  Cancel
                </Button>
                <Button colorScheme='red' onClick={sendShutdown} disabled={!canShutdown}>
                  Shutdown
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Panel.Section>
    </>
  );
}
