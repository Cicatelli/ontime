import { IoEye, IoEyeOffOutline } from 'react-icons/io5';

import TooltipActionBtn from '../../../common/components/buttons/TooltipActionBtn';
import { setMessage, useExternalMessageInput, useTimerMessageInput } from '../../../common/hooks/useSocket';
import { tooltipDelayMid } from '../../../ontimeConfig';

import InputRow from './InputRow';
import TimerControlsPreview from './TimerViewControl';

import { useTranslation } from '../../../translation/TranslationProvider';

export default function MessageControl() {
  return (
    <>
      <TimerControlsPreview />
      <TimerMessageInput />
      <ExternalInput />
    </>
  );
}

function TimerMessageInput() {
  const { text, visible } = useTimerMessageInput();
  const { getLocalizedString } = useTranslation();

  return (
    <InputRow
      label={getLocalizedString('timer.message')}
      placeholder={getLocalizedString('timer.message.plac')}
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.timerText(newValue)}
    >
      <TooltipActionBtn
        clickHandler={() => setMessage.timerVisible(!visible)}
        tooltip={visible ? 'Make invisible' : 'Make visible'}
        aria-label='Toggle timer message visibility'
        openDelay={tooltipDelayMid}
        icon={visible ? <IoEye size='18px' /> : <IoEyeOffOutline size='18px' />}
        variant={visible ? 'ontime-filled' : 'ontime-subtle'}
        size='sm'
      />
    </InputRow>
  );
}

function ExternalInput() {
  const { text, visible } = useExternalMessageInput();

  const toggleExternal = () => {
    if (visible) {
      setMessage.timerSecondary(null);
    } else {
      setMessage.timerSecondary('external');
    }
  };

  const { getLocalizedString } = useTranslation();

  return (
    <InputRow
      label={getLocalizedString('timer.external')}
      placeholder={getLocalizedString('timer.external.plac')}
      text={text}
      visible={visible}
      changeHandler={(newValue) => setMessage.externalText(newValue)}
    >
      <TooltipActionBtn
        clickHandler={toggleExternal}
        tooltip={visible ? 'Make invisible' : 'Make visible'}
        aria-label='Toggle external message visibility'
        openDelay={tooltipDelayMid}
        icon={visible ? <IoEye size='18px' /> : <IoEyeOffOutline size='18px' />}
        variant={visible ? 'ontime-filled' : 'ontime-subtle'}
        size='sm'
      />
    </InputRow>
  );
}
