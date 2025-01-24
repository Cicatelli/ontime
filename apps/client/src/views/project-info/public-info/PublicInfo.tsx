import { useSearchParams } from 'react-router-dom';
import { ProjectData } from 'ontime-types';

import { isStringBoolean } from '../../../features/viewers/common/viewUtils';

interface PublicInfoProps {
  general: ProjectData;
}

export default function PublicInfo(props: PublicInfoProps) {
  const { general } = props;
  const [searchParams] = useSearchParams();

  const showPublic = isStringBoolean(searchParams.get('showPublic'));

  if (!showPublic) {
    return null;
  }

  return (
    <>
      {general.publicInfo && (
        <>
          <div className='info__label'>Public info</div>
          <div className='info__value'>{general.publicInfo}</div>
        </>
      )}
      {general.publicUrl && (
        <>
          <div className='info__label'>Public URL</div>
          <a href={general.publicUrl} target='_blank' rel='noreferrer' className='info__value'>
            {general.publicUrl}
          </a>
        </>
      )}
    </>
  );
}